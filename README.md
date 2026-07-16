# FlowMind 🚀

**AI-powered productivity system** — transforms goals into actionable plans.

FlowMind is a full-stack web application that uses AI (Groq) to break down your big goals into manageable tasks, track your progress, and help you stay focused.

## Features

✨ **AI Goal Breakdown** — Tell FlowMind a big goal like "Crack Amazon in 3 months" and it creates a complete action plan with 8-12 tasks  
📊 **Analytics Dashboard** — Track your productivity score, completion rate, and daily streaks  
⚡ **Task Management** — Create, complete, and prioritize tasks with 5-level priority system  
🎯 **Focus Mode** — Get AI-suggested focus task based on priority and urgency  
🔐 **User Authentication** — JWT-based auth with secure session management  

## Tech Stack

**Frontend:** React + JavaScript (dark theme UI)  
**Backend:** Django REST Framework + PostgreSQL  
**AI:** Groq API (llama-3.1-8b-instant)  
**Deployment:** Render (both frontend and backend)  

## Project Structure

```
flowmind/
├── frontend/              # React app
│   ├── src/
│   │   └── App.js        # Main React component
│   └── package.json
├── flowmind_backend/      # Django backend
│   ├── tasks/            # Models, views, serializers
│   ├── flowmind_backend/ # Settings, URLs, WSGI
│   └── manage.py
├── render.yaml           # Render deployment config
└── README.md
```

## Setup

### Local Development

**Backend:**
```bash
cd flowmind_backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm start  # localhost:3000
```

### Environment Variables

**Backend:**
- `SECRET_KEY` — Django secret key
- `GROQ_API_KEY` — Groq API key from https://console.groq.com
- `DATABASE_URL` — PostgreSQL (auto-set by Render)

**Frontend:**
- `REACT_APP_API_URL` — https://flowmind-backend.onrender.com
- `REACT_APP_API_BASE_URL` — https://flowmind-backend.onrender.com/api/v1

## API Endpoints

### Auth
- `POST /api/v1/auth/register/` — Create account
- `POST /api/v1/auth/login/` — Get JWT token

### Core
- `POST /api/v1/chat/` — Chat with AI agent
- `GET /api/v1/goals/` — List goals
- `GET /api/v1/tasks/` — List tasks
- `GET /api/v1/focus/` — Recommended focus task
- `GET /api/v1/analytics/` — Productivity stats

## How to Use

1. Sign up
2. Tell FlowMind a goal like "Crack Amazon in 3 months"
3. AI creates action plan with tasks
4. Track progress, mark tasks as done
5. Watch analytics update in real-time

## Deployment

Deployed on **Render** with auto-redeploy on git push:
- Backend: Python/Gunicorn
- Frontend: Node.js
- Database: PostgreSQL

## Known Issues

- Free tier Groq API rate limits — using 8B model to stay within TPM
- System prompt limited to 10 tasks to avoid request overflow

---

Built with ⚡ and AI.
