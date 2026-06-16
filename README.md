# ⚡ FlowMind — AI Productivity Agent

> An AI-powered productivity system that transforms goals into actionable plans, prioritizes work, tracks progress, and recommends what to focus on next.

## 🌐 Live Demo

### Frontend
https://flowmind-v7k9.vercel.app

### Backend API
https://flowmind-production-cc5b.up.railway.app/api/tasks/

### Admin Panel
https://flowmind-production-cc5b.up.railway.app/admin/

# 🚀 Overview

FlowMind is an AI productivity assistant built with React, Django REST Framework, PostgreSQL, and Groq LLMs.

Instead of only generating text, FlowMind converts user goals into structured task plans, stores them in a database, tracks completion progress, and continuously recommends the highest-priority task to focus on.

### Example

```text
User:
"I want to crack Amazon in 3 months"

FlowMind:
✓ Creates a goal
✓ Breaks it into interview-prep tasks
✓ Assigns priorities
✓ Tracks completion progress
✓ Suggests today's focus task
```

---

# ✨ Features

## 🤖 AI Goal Decomposition

Convert ambitious goals into actionable plans.

Example:

```text
Crack Amazon in 3 months
```

↓

```text
• DSA Practice
• System Design
• OOP Concepts
• DBMS
• Operating Systems
• Mock Interviews
• Resume Preparation
• Behavioral Questions
```

---

## 🎯 Smart Focus Mode

FlowMind automatically selects the most important pending task and displays it as:

```text
Today's Focus
```

Helping users avoid decision fatigue and focus on the next best action.

---

## 📊 Progress Tracking

Track progress for every goal.

Features include:

* Total tasks
* Completed tasks
* Remaining tasks
* Percentage completion

Example:

```text
Goal Progress: 38%
```

---

## ✅ Task Management

* Create tasks using natural language
* Mark tasks complete
* Real-time status updates
* Priority-based organization
* Goal-linked task tracking

---

## 🧠 AI Productivity Agent

The AI agent can:

* Create tasks
* Break down goals
* Complete tasks
* Recommend focus areas
* Answer productivity-related questions

using structured JSON actions between the frontend and backend.

---

## 🎨 Modern Dashboard

Includes:

* Dark productivity-focused UI
* Goal overview panel
* Focus task card
* Real-time task statistics
* AI chat interface
* Progress visualization

---

# 🏗️ System Architecture

```text
React Frontend
       │
       ▼
Django REST API
       │
       ▼
PostgreSQL Database
       │
       ▼
Groq API (Llama 3.3 70B)
```

---

# 🛠️ Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Frontend         | React.js                |
| Backend          | Django                  |
| API              | Django REST Framework   |
| Database         | PostgreSQL (Railway)    |
| AI               | Groq API                |
| Model            | Llama 3.3 70B Versatile |
| Frontend Hosting | Vercel                  |
| Backend Hosting  | Railway                 |
| Version Control  | Git & GitHub            |

---

# 📂 Project Structure

```text
flowmind/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── flowmind_backend/
│   ├── tasks/
│   ├── flowmind_backend/
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

---

# 🚀 Run Locally

## Backend

```bash
cd flowmind_backend

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm start
```

Frontend runs at:

```text
http://localhost:3000
```

---

# 🔑 Environment Variables

Create:

```text
flowmind_backend/.env
```

Add:

```env
GROQ_API_KEY=your_groq_api_key
```

---

# 📸 Screenshots
<img width="1912" height="1023" alt="image" src="https://github.com/user-attachments/assets/1c90abd0-a6ea-4031-ac7c-c0df90e9b727" />


### Dashboard

* AI chat interface
* Goal management
* Focus mode
* Progress tracking

### Goal Breakdown Example

Input:

```text
Crack Amazon in 3 months
```

Output:

```text
✓ Goal created
✓ Tasks generated
✓ Priorities assigned
✓ Progress tracked
```

<img width="1912" height="1023" alt="image" src="https://github.com/user-attachments/assets/efcebdcf-edf4-45b0-92b8-c8622144e51f" />
<img width="1917" height="1025" alt="image" src="https://github.com/user-attachments/assets/1b238d45-31ee-4192-a426-13fd9783474d" />



---

# 🎯 Future Improvements

* User Authentication (JWT)
* Multi-user support
* AI Weekly Planner
* Calendar Integration
* Productivity Analytics Dashboard
* Email Notifications
* Deadline Scheduling
* Long-Term AI Memory
* Recurring Tasks
* Mobile Responsive Version

---

# 👩‍💻 Author

**Apekshita Chauhan**

GitHub: https://github.com/apekshita0511

---

## ⭐ If you found this project interesting

Consider starring the repository and sharing feedback.
