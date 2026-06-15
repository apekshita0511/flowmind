from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()
GROQ_KEY = os.getenv('GROQ_API_KEY')

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
    start = raw.find('{')
    end = raw.rfind('}') + 1
    return json.loads(raw[start:end])

@api_view(['POST'])
def ai_chat(request):
    user_message = request.data.get('message', '')
    history = request.data.get('history', [])
    tasks = Task.objects.all()
    tasks_list = [{'id': t.id, 'title': t.title, 'status': t.status, 'priority': t.priority} for t in tasks]
    system_prompt = f"""You are FlowMind, a smart AI productivity agent.
Current tasks: {json.dumps(tasks_list)}
Priority: 1=Low, 2=Medium, 3=High, 4=Urgent, 5=Critical
Respond with ONE of these JSON formats only:
Create single task:
{{"action": "create_task", "title": "task title", "priority": 2, "message": "response"}}
Break down a goal into multiple tasks (use when user mentions a big goal like cracking an interview, learning something, completing a project):
{{"action": "breakdown_goal", "goal": "goal name", "tasks": [
  {{"title": "specific task 1", "priority": 3}},
  {{"title": "specific task 2", "priority": 2}}
], "message": "Here's your plan!"}}
Complete a task:
{{"action": "complete_task", "task_id": 1, "message": "response"}}
Just chat:
{{"action": "chat", "message": "response"}}
RULES:
- For any big goal (crack interview, learn skill, finish project, build something) → ALWAYS use breakdown_goal with 8-12 specific actionable tasks
- Always respond with raw JSON only, no markdown, no backticks
- Be specific and actionable in task titles"""
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-6:]:
        role = "assistant" if msg["role"] == "assistant" else "user"
        messages.append({"role": role, "content": msg["text"]})
    messages.append({"role": "user", "content": user_message})
    ai_response = get_groq_response(messages)
    action = ai_response.get('action')
    if action == 'create_task':
        task = Task.objects.create(
            title=ai_response['title'],
            priority=ai_response.get('priority', 2),
            source='agent'
        )
        return Response({'message': ai_response['message'], 'task_created': TaskSerializer(task).data})
    elif action == 'breakdown_goal':
        created_tasks = []
        for t in ai_response.get('tasks', []):
            task = Task.objects.create(
                title=t['title'],
                priority=t.get('priority', 2),
                source='agent'
            )
            created_tasks.append(TaskSerializer(task).data)
        return Response({
            'message': ai_response['message'],
            'tasks_created': created_tasks,
            'goal': ai_response.get('goal', '')
        })
    elif action == 'complete_task':
        try:
            task = Task.objects.get(id=ai_response['task_id'])
            task.status = 'done'
            task.save()
            return Response({'message': ai_response['message'], 'task_updated': TaskSerializer(task).data})
        except:
            return Response({'message': "Couldn't find that task."})
    return Response({'message': ai_response['message']})
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Task

@api_view(["GET"])
def focus_task(request):
    pending_tasks = Task.objects.filter(status="pending")

    # Highest priority pending task
    task = pending_tasks.order_by("-priority").first()

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