from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Task, Goal
from .serializers import TaskSerializer, GoalSerializer
from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()
GROQ_KEY = os.getenv("GROQ_API_KEY")


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


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

    return json.loads(raw[start:end])


@api_view(["POST"])
def ai_chat(request):

    user_message = request.data.get("message", "")
    history = request.data.get("history", [])

    tasks = Task.objects.all()

    tasks_list = [
        {
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "priority": t.priority
        }
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
  create tasks about:
  DSA,
  LeetCode,
  System Design,
  OOP,
  DBMS,
  Operating Systems,
  Computer Networks,
  Resume preparation,
  Mock Interviews,
  Behavioral Questions.

- If the goal is about learning a technology:
  create a learning roadmap from beginner to advanced.

- If the goal is about business or startups:
  create business-related tasks.

- ALWAYS generate tasks directly related to the user's goal.

- ALWAYS use breakdown_goal for big goals.

- Generate 8-12 tasks.

- Always respond with raw JSON only.
"""

    messages = [{"role": "system", "content": system_prompt}]

    for msg in history[-6:]:
        role = "assistant" if msg["role"] == "assistant" else "user"
        messages.append({
            "role": role,
            "content": msg["text"]
        })

    messages.append({
        "role": "user",
        "content": user_message
    })

    ai_response = get_groq_response(messages)

    action = ai_response.get("action")

    # CREATE TASK
    if action == "create_task":

        task = Task.objects.create(
            title=ai_response["title"],
            priority=ai_response.get("priority", 2),
            source="agent"
        )

        return Response({
            "message": ai_response["message"],
            "task_created": TaskSerializer(task).data
        })

    # BREAKDOWN GOAL
    elif action == "breakdown_goal":

        goal_title = ai_response.get("goal", "").strip()

        existing_goal = Goal.objects.filter(
            title__iexact=goal_title,
            status="active"
        ).first()

        if existing_goal:

            total_tasks = existing_goal.tasks.count()

            completed_tasks = existing_goal.tasks.filter(
                status="done"
            ).count()

            return Response({
                "message": f"You already have this goal. Progress: {completed_tasks}/{total_tasks} tasks completed.",
                "goal_exists": True,
                "goal": existing_goal.title
            })

        goal = Goal.objects.create(
            title=goal_title
        )

        created_tasks = []

        for t in ai_response.get("tasks", []):

            task = Task.objects.create(
                goal=goal,
                title=t["title"],
                priority=t.get("priority", 2),
                source="agent"
            )

            created_tasks.append(
                TaskSerializer(task).data
            )

        return Response({
            "message": ai_response["message"],
            "tasks_created": created_tasks,
            "goal": goal.title
        })

    # COMPLETE TASK
    elif action == "complete_task":

        try:
            task = Task.objects.get(
                id=ai_response["task_id"]
            )

            task.status = "done"
            task.save()

            return Response({
                "message": ai_response["message"],
                "task_updated": TaskSerializer(task).data
            })

        except Task.DoesNotExist:
            return Response({
                "message": "Couldn't find that task."
            })

    # CHAT
    return Response({
        "message": ai_response.get("message", "")
    })


@api_view(["GET"])
def focus_task(request):

    pending_tasks = Task.objects.filter(
        status="pending"
    )

    task = pending_tasks.order_by(
        "-priority"
    ).first()

    if not task:
        return Response({
            "message": "No pending tasks"
        })

    return Response({
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "status": task.status
    })
@api_view(["GET"])
def goals(request):

    all_goals = Goal.objects.all()

    data = []

    for goal in all_goals:

        total = goal.tasks.count()
        done = goal.tasks.filter(status="done").count()

        progress = 0

        if total > 0:
            progress = round((done / total) * 100)

        data.append({
            "id": goal.id,
            "title": goal.title,
            "progress": progress,
            "tasks": TaskSerializer(
                goal.tasks.all(),
                many=True
            ).data
        })

    return Response(data)