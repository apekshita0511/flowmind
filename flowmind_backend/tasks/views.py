from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from groq import Groq
import json
import os
from dotenv import load_dotenv

from .models import Task, Goal
from .serializers import TaskSerializer, GoalSerializer, RegisterSerializer
from .scoring import compute_focus_score

load_dotenv()
GROQ_KEY = os.getenv("GROQ_API_KEY")


class AIChatThrottle(UserRateThrottle):
    scope = 'ai_chat'


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    queryset = Task.objects.all()

    def get_queryset(self):
        return Task.objects.filter(goal__user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        new_status = serializer.validated_data.get('status')
        if new_status == 'done' and instance.status != 'done':
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Account created successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get_groq_response(messages):
    client = Groq(api_key=GROQ_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages
    )
    raw = response.choices[0].message.content.strip()
    if "```" in raw:
        raw = raw.replace("```json", "").replace("```", "").strip()
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        return {"action": "chat", "message": raw}
    try:
        return json.loads(raw[start:end])
    except json.JSONDecodeError:
        return {"action": "chat", "message": raw}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([AIChatThrottle])
def ai_chat(request):
    try:
        return _ai_chat_inner(request)
    except Exception as e:
        import traceback
        return Response({"message": f"[DEBUG] {type(e).__name__}: {str(e)}", "action": "chat", "traceback": traceback.format_exc()})


def _ai_chat_inner(request):
    user = request.user
    user_message = request.data.get("message", "")
    history = request.data.get("history", [])

    tasks = Task.objects.filter(goal__user=user)
    tasks_list = [
        {"id": t.id, "title": t.title, "status": t.status, "priority": t.priority}
        for t in tasks
    ]

    system_prompt = f"""
You are FlowMind, a smart AI productivity agent.

Current tasks:
{json.dumps(tasks_list)}

Priority:
1=Low
2=Medium
3=High
4=Urgent
5=Critical

Respond with ONE of these JSON formats only:

Create single task:
{{"action":"create_task","title":"task title","priority":2,"message":"response"}}

Break down a goal:
{{"action":"breakdown_goal","goal":"goal name","tasks":[{{"title":"task 1","priority":3}}],"message":"Here's your plan"}}

Complete task:
{{"action":"complete_task","task_id":1,"message":"response"}}

Chat:
{{"action":"chat","message":"response"}}

RULES:
- If the goal is about Amazon, Google, Microsoft, Meta, SWE, SDE, software engineering, coding interviews, placements, jobs or interviews:
  create tasks about DSA, LeetCode, System Design, OOP, DBMS, Operating Systems, Computer Networks, Resume preparation, Mock Interviews, Behavioral Questions.
- If the goal is about learning a technology: create a learning roadmap from beginner to advanced.
- If the goal is about business or startups: create business-related tasks.
- ALWAYS generate tasks directly related to the user's goal.
- ALWAYS use breakdown_goal for big goals.
- Generate 8-12 tasks.
- Always respond with raw JSON only.
"""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-6:]:
        messages.append({
            "role": "assistant" if msg["role"] == "assistant" else "user",
            "content": msg["text"]
        })
    messages.append({"role": "user", "content": user_message})

    ai_response = get_groq_response(messages)
    action = ai_response.get("action")

    if action == "create_task":
        goal, _ = Goal.objects.get_or_create(
            user=user, title="General", defaults={"status": "active"}
        )
        task = Task.objects.create(
            goal=goal,
            title=ai_response["title"],
            priority=ai_response.get("priority", 2),
            source="agent"
        )
        return Response({"message": ai_response["message"], "task_created": TaskSerializer(task).data})

    elif action == "breakdown_goal":
        goal_title = ai_response.get("goal", "").strip()
        existing_goal = Goal.objects.filter(
            title__iexact=goal_title, status="active", user=user
        ).first()

        if existing_goal:
            total = existing_goal.tasks.count()
            done = existing_goal.tasks.filter(status="done").count()
            return Response({
                "message": f"You already have this goal. Progress: {done}/{total} tasks completed.",
                "goal_exists": True,
                "goal": existing_goal.title
            })

        goal = Goal.objects.create(title=goal_title, user=user)
        created_tasks = []
        for t in ai_response.get("tasks", []):
            task = Task.objects.create(
                goal=goal,
                title=t["title"],
                priority=t.get("priority", 2),
                source="agent"
            )
            created_tasks.append(TaskSerializer(task).data)

        return Response({
            "message": ai_response["message"],
            "tasks_created": created_tasks,
            "goal": goal.title
        })

    elif action == "complete_task":
        try:
            task = Task.objects.get(id=ai_response["task_id"], goal__user=user)
            task.status = "done"
            task.completed_at = timezone.now()
            task.save()
            return Response({"message": ai_response["message"], "task_updated": TaskSerializer(task).data})
        except Task.DoesNotExist:
            return Response({"message": "Couldn't find that task."})

    return Response({"message": ai_response.get("message", "")})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def focus_task(request):
    pending = Task.objects.filter(goal__user=request.user, status="pending")
    if not pending.exists():
        return Response({"message": "No pending tasks"})

    best = max(pending, key=compute_focus_score)
    return Response({
        "id": best.id,
        "title": best.title,
        "priority": best.priority,
        "status": best.status,
        "score": round(compute_focus_score(best), 2),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def goals(request):
    all_goals = Goal.objects.filter(user=request.user)
    data = []
    for goal in all_goals:
        total = goal.tasks.count()
        done = goal.tasks.filter(status="done").count()
        progress = round((done / total) * 100) if total > 0 else 0
        data.append({
            "id": goal.id,
            "title": goal.title,
            "progress": progress,
            "tasks": TaskSerializer(goal.tasks.all(), many=True).data
        })
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analytics(request):
    user = request.user
    now = timezone.now()
    tasks = Task.objects.filter(goal__user=user)

    total = tasks.count()
    done_count = tasks.filter(status="done").count()
    pending_count = tasks.filter(status="pending").count()
    completion_rate = round((done_count / total) * 100) if total > 0 else 0

    # Last 7 days — tasks completed each day
    daily_completion = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        count = tasks.filter(completed_at__range=(day_start, day_end)).count()
        daily_completion.append({"date": day_start.strftime("%Y-%m-%d"), "completed": count})

    # Streak: consecutive days ending today with at least 1 completion
    streak = 0
    for i in range(30):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        if tasks.filter(completed_at__range=(day_start, day_end)).exists():
            streak += 1
        else:
            break

    # Completion rate broken down by priority level
    priority_stats = {}
    for p in range(1, 6):
        p_total = tasks.filter(priority=p).count()
        p_done = tasks.filter(priority=p, status="done").count()
        priority_stats[p] = {
            "total": p_total,
            "done": p_done,
            "rate": round((p_done / p_total) * 100) if p_total > 0 else 0,
        }

    # Productivity score: weighted blend of completion rate and streak
    productivity_score = min(100, round(completion_rate * 0.6 + streak * 4))

    return Response({
        "total_tasks": total,
        "completed": done_count,
        "pending": pending_count,
        "completion_rate": completion_rate,
        "streak_days": streak,
        "productivity_score": productivity_score,
        "daily_completion": daily_completion,
        "priority_stats": priority_stats,
    })
