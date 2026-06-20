# ⚡ FlowMind — AI Productivity Agent

> An AI-powered productivity system that transforms goals into actionable plans, prioritizes work, tracks progress, and recommends what to focus on next.

## 🌐 Live Demo

| | |
|---|---|
| **Frontend** | https://flowmind-v7k9.vercel.app |
| **Backend API** | https://flowmind-production-cc5b.up.railway.app/api/v1/ |
| **API Docs (Swagger)** | https://flowmind-production-cc5b.up.railway.app/api/v1/docs/ |
| **Admin Panel** | https://flowmind-production-cc5b.up.railway.app/admin/ |

---

# 🚀 Overview

FlowMind is a full-stack AI productivity assistant built with React, Django REST Framework, PostgreSQL, and Groq LLMs. It uses JWT authentication for per-user data isolation, a custom scoring algorithm to surface the most important task, and an analytics engine to track streaks and productivity over time.

### Example

```text
User: "I want to crack Amazon in 3 months"

FlowMind:
✓ Creates a goal tied to your account
✓ Breaks it into 10 interview-prep tasks
✓ Assigns priority levels (DSA=Critical, Mock Interviews=High...)
✓ Scores each task using urgency + priority + staleness
✓ Suggests today's highest-score focus task
✓ Tracks your streak and productivity score over time
```

---

# ✨ Features

## 🔐 JWT Authentication

Per-user accounts with secure JWT-based auth.

- Register / Login flow
- 24h access tokens, 7-day refresh tokens
- Every goal and task is scoped to the authenticated user

---

## 🤖 AI Goal Decomposition

Convert ambitious goals into structured action plans via Groq's Llama 3.3 70B model.

```text
Input:  "Crack Amazon in 3 months"

Output:
• DSA Practice           [Critical]
• LeetCode Daily         [Urgent]
• System Design          [High]
• OOP Concepts           [High]
• DBMS                   [Medium]
• Operating Systems      [Medium]
• Computer Networks      [Medium]
• Mock Interviews        [Urgent]
• Resume Preparation     [High]
• Behavioral Questions   [Medium]
```

Supports SWE/SDE interview prep, tech learning roadmaps, and business goals.

---

## 🎯 Smart Focus Algorithm

Focus is no longer just "highest priority number." A custom scoring formula ranks every pending task:

```
score = base_priority × urgency_multiplier × staleness_boost
```

- **urgency_multiplier** — exponential decay based on days until deadline (overdue = 4×, due today = 3×, due in 3 days = 2×)
- **staleness_boost** — tasks that have waited 30+ days get up to a 30% bump so nothing stays buried forever
- The top-scoring task is surfaced as **Today's Focus**

---

## 📊 Productivity Analytics

A dedicated Analytics tab shows:

| Metric | Description |
|---|---|
| Productivity Score | Weighted blend of completion rate + streak (0–100) |
| Day Streak | Consecutive days with at least one task completed |
| Completion Rate | % of all tasks marked done |
| Daily Chart | Bar chart of tasks completed over the last 7 days |
| Priority Breakdown | Completion rate per priority level (Low → Critical) |

---

## ⚙️ Production-Ready Engineering

| Feature | Detail |
|---|---|
| Rate limiting | AI chat throttled to 30 req/hour per user via DRF throttle |
| Auto-migration | `python manage.py migrate` runs on every Railway deploy |
| Static files | WhiteNoise serves static assets in production |
| API versioning | All endpoints under `/api/v1/` |
| Swagger docs | Auto-generated OpenAPI spec at `/api/v1/docs/` |
| CI pipeline | GitHub Actions runs 12 unit tests against PostgreSQL on every push |

---

## ✅ Task Management

- Create tasks via natural language chat
- Mark tasks complete (auto-records `completed_at` timestamp)
- Goal-linked task tracking with progress bars
- Priority color coding (green → red)
- Real-time sidebar updates after every action

---

# 🏗️ System Architecture

```text
React Frontend (Vercel)
        │  JWT in Authorization header
        ▼
Django REST API  ──── /api/v1/auth/      (register, login, refresh)
(Railway)        ──── /api/v1/goals/     (per-user goals + progress)
        │        ──── /api/v1/tasks/     (CRUD, PATCH to complete)
        │        ──── /api/v1/chat/      (AI agent, throttled)
        │        ──── /api/v1/focus/     (smart scoring algorithm)
        │        ──── /api/v1/analytics/ (streak, chart, productivity)
        │        ──── /api/v1/docs/      (Swagger UI)
        ▼
PostgreSQL (Railway)
        │
        ▼
Groq API — Llama 3.3 70B
```

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Django 6 + Django REST Framework |
| Authentication | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL (Railway) |
| AI Model | Groq API — Llama 3.3 70B Versatile |
| API Docs | drf-spectacular (OpenAPI / Swagger) |
| Static Files | WhiteNoise |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| CI/CD | GitHub Actions |

---

# 📂 Project Structure

```text
flowmind/
│
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions — runs tests on every push
│
├── frontend/
│   └── src/
│       └── App.js              # Auth screen, main dashboard, analytics tab
│
├── flowmind_backend/
│   ├── tasks/
│   │   ├── models.py           # Goal (user FK) + Task (deadline, completed_at)
│   │   ├── views.py            # All endpoints with JWT auth
│   │   ├── scoring.py          # Smart focus algorithm
│   │   ├── serializers.py      # Task, Goal, Register serializers
│   │   ├── urls.py             # /api/v1/ routes
│   │   └── tests.py            # 12 unit tests
│   ├── flowmind_backend/
│   │   └── settings.py         # JWT, throttling, Swagger, WhiteNoise config
│   ├── Procfile                # migrate → collectstatic → gunicorn
│   └── requirements.txt
│
└── README.md
```

---

# 🧪 Tests

12 unit tests covering:

- **Scoring algorithm** — priority ordering, overdue deadline boost, near deadline vs far deadline
- **Auth** — register, password validation, JWT login, unauthenticated rejection
- **Goals** — list own goals, progress calculation (50% = 1/2 done), user isolation
- **Analytics** — expected response shape, zero-state safety, streak counting

```bash
cd flowmind_backend
python manage.py test tasks --verbosity=2
```

CI runs these automatically against PostgreSQL on every push to `main`.

---

# 🚀 Run Locally

## Backend

```bash
cd flowmind_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Runs at `http://127.0.0.1:8000`  
Swagger docs at `http://127.0.0.1:8000/api/v1/docs/`

## Frontend

```bash
cd frontend
npm install
npm start
```

Runs at `http://localhost:3000`

---

# 🔑 Environment Variables

Create `flowmind_backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_django_secret_key
DATABASE_URL=your_postgres_url   # optional, defaults to SQLite locally
```

---

# 📸 Screenshots
<img width="1915" height="1017" alt="Screenshot 2026-06-20 174224" src="https://github.com/user-attachments/assets/492bff75-b4e1-44ff-aa4c-b2d415389cc2" />
<img width="1918" height="1018" alt="Screenshot 2026-06-20 174242" src="https://github.com/user-attachments/assets/bed934d6-beb3-4a0a-97bf-616b043ef70c" />
<img width="1917" height="1002" alt="Screenshot 2026-06-20 174315" src="https://github.com/user-attachments/assets/18a3f525-8526-4dd8-a4a1-eade957b5827" />
<img width="1918" height="1003" alt="Screenshot 2026-06-20 174330" src="https://github.com/user-attachments/assets/7f5dbd7c-fc01-4c1d-bbcb-1ebfe1bb6658" />





### Dashboard
- AI chat interface
- Goal management with progress bars
- Smart focus task card with score
- Analytics tab (streak, productivity score, daily chart)

### Goal Breakdown Example

```text
Input:  "Crack Amazon in 3 months"
Output: ✓ Goal created  ✓ 10 tasks generated  ✓ Priorities assigned  ✓ Progress tracked
```

---

# 👩‍💻 Author

**Apekshita Chauhan**

GitHub: https://github.com/apekshita0511

---

⭐ If you found this project interesting, consider starring the repository.
