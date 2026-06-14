# ⚡ FlowMind — AI Productivity Agent

> Talk to your task manager in plain English. The AI agent autonomously creates tasks, breaks down goals, and manages your day.

## 🎯 What makes it different from ChatGPT?

ChatGPT gives you text. FlowMind **takes action** — it creates real tasks in a database, breaks big goals into actionable subtasks, and tracks your progress. The AI doesn't just talk, it works.

## ✨ Features

- 🤖 **Natural language task creation** — "Add a task to review my resume" → task created instantly
- 🎯 **Goal breakdown** — "I want to crack Amazon in 3 months" → AI generates 12 specific tasks automatically
- ✅ **Task completion** — "Mark leetcode as done" → status updated in real-time
- 📊 **Progress tracking** — live stats: pending, completed, completion %
- 🎨 **Priority visualization** — color-coded tasks (Low → Critical)
- 💬 **Conversation memory** — AI remembers context across messages

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Django + Django REST Framework |
| Database | SQLite |
| AI | Groq API (Llama 3.3 70B) |

## 🚀 Run Locally

**Backend:**
```bash
cd flowmind_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Environment variables** — create `flowmind_backend/.env`:GROQ_API_KEY=your_groq_api_key
## 👩‍💻 Author
Apekshita Chauhan — [GitHub](https://github.com/apekshita0511)
