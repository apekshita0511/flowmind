# FlowMind

[![Django](https://img.shields.io/badge/Django-6.0-darkgreen?style=flat-square&logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Groq API](https://img.shields.io/badge/Groq%20API-LLM-orange?style=flat-square)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

AI-powered productivity system that transforms goals into actionable task plans with real-time progress tracking and intelligent focus recommendations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Overview

FlowMind is a full-stack web application that leverages generative AI to help users break down ambitious goals into manageable, prioritized tasks. By integrating with the Groq API, FlowMind provides intelligent goal decomposition, real-time progress analytics, and AI-driven task prioritization.

The application features a modern React frontend with a dark theme and a production-ready Django REST API backend deployed on Render with PostgreSQL.

## Features

- **AI Goal Breakdown** — Describe any goal (e.g., "Crack Amazon in 3 months") and FlowMind generates an 8-12 task action plan using Groq's LLM
- **Analytics Dashboard** — Track productivity score, task completion rate, daily streaks, and priority-based performance metrics
- **Task Management** — Create, update, and complete tasks with 5-level priority system (Low, Medium, High, Urgent, Critical)
- **Intelligent Focus** — AI-recommended focus task based on priority, urgency, and task status
- **Secure Authentication** — JWT-based user authentication with refresh token support
- **Progress Tracking** — Real-time goal progress visualization and historical completion analytics
- **RESTful API** — Complete API documentation with Swagger UI for easy integration

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React | 19.x |
| **Frontend Styling** | CSS-in-JS (Inline) | Native |
| **Backend Framework** | Django REST Framework | 3.17 |
| **Backend Language** | Python | 3.11+ |
| **Database** | PostgreSQL | 13+ |
| **ORM** | Django ORM | Built-in |
| **Authentication** | JWT (djangorestframework-simplejwt) | 5.5 |
| **API Documentation** | drf-spectacular (OpenAPI/Swagger) | 0.28 |
| **AI Integration** | Groq API (llama-3.1-8b-instant) | Latest |
| **CORS** | django-cors-headers | 4.9 |
| **Static Files** | WhiteNoise | 6.9 |
| **Production Server** | Gunicorn | 26.0 |
| **Deployment** | Render | Cloud |
| **Environment Management** | python-dotenv | 1.2 |

## Architecture

```
┌─────────────┐                           ┌──────────────────┐
│   Browser   │                           │   Render Cloud   │
└──────┬──────┘                           └──────────────────┘
       │                                           │
       │ HTTP/HTTPS                                │
       │                                           │
    ┌──▼──────────────────────────────────────────▼───┐
    │        Render: flowmind-frontend               │
    │  ┌──────────────────────────────────────────┐  │
    │  │   React 19 (Dark Theme UI)               │  │
    │  │  - Auth Screen                            │  │
    │  │  - Chat Interface (AI Agent)             │  │
    │  │  - Task Management Panel                 │  │
    │  │  - Analytics Dashboard                   │  │
    │  └──────────────────────────────────────────┘  │
    │              (Node.js Runtime)                 │
    └──────────────┬─────────────────────────────────┘
                   │
                   │ API Calls (JSON)
                   │
    ┌──────────────▼─────────────────────────────────┐
    │     Render: flowmind-backend                  │
    │  ┌──────────────────────────────────────────┐  │
    │  │  Django REST API                         │  │
    │  │  - Authentication (JWT)                  │  │
    │  │  - Task/Goal Management                  │  │
    │  │  - AI Chat Handler                       │  │
    │  │  - Analytics Computation                 │  │
    │  └──────────────────────────────────────────┘  │
    │       (Python 3.11 + Gunicorn)                │
    │                                                 │
    │  ┌──────────────────────────────────────────┐  │
    │  │  Groq API Client                         │  │
    │  │  (llama-3.1-8b-instant)                  │  │
    │  └───────────────┬──────────────────────────┘  │
    └──────────────────┼───────────────────────────┘
                       │
                       │ LLM Requests
                       │
                    ┌──▼──┐
                    │Groq │
                    │ API │
                    └─────┘
                       │
    ┌──────────────────▼─────────────────────────────┐
    │     Render: PostgreSQL Database               │
    │  - Users                                       │
    │  - Goals                                       │
    │  - Tasks                                       │
    │  - Task History & Analytics                    │
    └──────────────────────────────────────────────┘
```

## Project Structure

```
flowmind/
├── frontend/                          # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── App.js                    # Main React component
│   │   ├── index.js
│   │   └── setupTests.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── flowmind_backend/                 # Django backend application
│   ├── flowmind_backend/             # Project settings
│   │   ├── settings.py               # Django configuration
│   │   ├── urls.py                   # URL routing
│   │   ├── wsgi.py                   # WSGI application
│   │   └── asgi.py                   # ASGI configuration
│   │
│   ├── tasks/                        # Main app
│   │   ├── models.py                 # Task, Goal, User models
│   │   ├── views.py                  # API views & AI handlers
│   │   ├── serializers.py            # DRF serializers
│   │   ├── urls.py                   # App URL routing
│   │   ├── scoring.py                # Focus task scoring algorithm
│   │   ├── migrations/               # Database migrations
│   │   └── admin.py
│   │
│   ├── manage.py                     # Django management script
│   ├── requirements.txt              # Python dependencies
│   └── db.sqlite3                    # Local SQLite (dev only)
│
├── render.yaml                       # Render deployment configuration
├── .gitignore
├── README.md                         # This file
└── LICENSE
```

## Installation

### Prerequisites

- **Node.js** 18+ with npm
- **Python** 3.11+
- **PostgreSQL** 13+ (or use Render's managed database)
- **Groq API Key** from [console.groq.com](https://console.groq.com)

### Clone the Repository

```bash
git clone https://github.com/apekshita0511/flowmind.git
cd flowmind
```

## Environment Variables

### Backend Environment Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `SECRET_KEY` | String | Django secret key for session encryption | `django-insecure-...` |
| `GROQ_API_KEY` | String | API key from Groq for LLM access | `gsk_...` |
| `DATABASE_URL` | String | PostgreSQL connection string | `postgresql://user:pass@host/dbname` |
| `DEBUG` | Boolean | Django debug mode (False in production) | `False` |
| `ALLOWED_HOSTS` | String | Comma-separated list of allowed hosts | `flowmind-backend.onrender.com,localhost` |
| `PYTHON_VERSION` | String | Python runtime version | `3.11` |

### Frontend Environment Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `REACT_APP_API_URL` | String | Backend base URL | `https://flowmind-backend.onrender.com` |
| `REACT_APP_API_BASE_URL` | String | API endpoint base | `https://flowmind-backend.onrender.com/api/v1` |
| `NODE_ENV` | String | Node environment | `production` |

## Running Locally

### Backend Setup

```bash
# Navigate to backend directory
cd flowmind_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
# Server runs on http://localhost:8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Server runs on http://localhost:3000
# API calls will be proxied to http://localhost:8000
```

### Environment Setup for Local Development

Create a `.env` file in `flowmind_backend/`:

```
SECRET_KEY=your-django-secret-key-here
GROQ_API_KEY=your-groq-api-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

Then in the frontend directory, create a `.env` file:

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

## API Overview

### Base URL
- **Development:** `http://localhost:8000/api/v1`
- **Production:** `https://flowmind-backend.onrender.com/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Create new user account |
| POST | `/auth/login/` | Obtain JWT access and refresh tokens |
| POST | `/auth/refresh/` | Refresh expired access token |

### Core API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/chat/` | Send message to AI agent (goal breakdown, task creation) | Yes |
| GET | `/goals/` | Retrieve all user goals with progress | Yes |
| GET | `/tasks/` | Retrieve all user tasks | Yes |
| PATCH | `/tasks/{id}/` | Update task status (mark as done) | Yes |
| GET | `/focus/` | Get AI-recommended focus task | Yes |
| GET | `/analytics/` | Get productivity analytics and stats | Yes |

### Documentation

Interactive API documentation available at:
- **Swagger UI:** `http://localhost:8000/api/v1/docs/`
- **ReDoc:** `http://localhost:8000/api/v1/schema/`

### Example: Chat with AI

**Request:**
```bash
POST /api/v1/chat/
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "message": "Crack Amazon in 3 months",
  "history": []
}
```

**Response:**
```json
{
  "message": "Here's your plan to crack Amazon in 3 months!",
  "tasks_created": [
    {
      "id": 1,
      "title": "Master Data Structures and Algorithms",
      "priority": 3,
      "status": "pending"
    }
  ],
  "goal": "Crack Amazon in 3 months"
}
```

## Screenshots

### Dashboard & Analytics
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/827021d3-f10f-475e-83ef-1087c4adfa71" />

*Real-time productivity metrics and goal progress tracking*

### AI Chat Interface
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/44eae13b-c23d-4c3f-b3af-89558f326b2b" />
*Natural language goal decomposition powered by Groq*

### Task Management
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/568362e6-ce1e-40c2-bca5-450e8fd2c45d" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b009b4e0-ab71-45e3-a416-895f1382a8cf" />
*Priority-based task tracking with completion status*

## Future Improvements

- [ ] Collaborative Goals — Share goals and tasks with team members
- [ ] Calendar Integration — Sync tasks with Google Calendar and Outlook
- [ ] Mobile App — React Native app for iOS and Android
- [ ] Advanced Analytics — Heatmaps, trend analysis, and predictive insights
- [ ] Integrations — Slack notifications, GitHub issue sync, Notion integration
- [ ] AI Model Selection — Support for multiple LLM providers (OpenAI, Anthropic)
- [ ] Offline Mode — Progressive Web App (PWA) for offline task management
- [ ] Custom Prompts — User-defined AI instructions for personalized goal breakdown

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with clear, atomic commits
4. **Submit a Pull Request** with a detailed description

### Code Style

- **Backend:** Follow PEP 8 standards
- **Frontend:** Use consistent JavaScript/React patterns
- **Commits:** Use descriptive commit messages

### Reporting Issues

Please use GitHub Issues to report bugs or suggest features.

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## Author

**Apekshita** — Full-stack developer passionate about AI-driven productivity tools.

- GitHub: [@apekshita0511](https://github.com/apekshita0511)
- Email: [apekshita20@gmail.com](mailto:apekshita20@gmail.com)

---

<div align="center">

[Report Bug](https://github.com/apekshita0511/flowmind/issues) • [Request Feature](https://github.com/apekshita0511/flowmind/issues)

</div>
