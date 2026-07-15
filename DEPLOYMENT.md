# 🚀 FlowMind Deployment Guide — Render

This guide walks you through deploying FlowMind to [Render.com](https://render.com) in 15 minutes.

---

## ✅ Prerequisites

1. **Render Account** — Create one at [render.com](https://render.com) (free tier available)
2. **GitHub Repository** — Push this code to GitHub
3. **Groq API Key** — Get one from [console.groq.com](https://console.groq.com) (free tier)
4. **Credit Card** (optional) — Render's free tier is limited; upgrade for production workloads

---

## 📝 Step 1: Prepare Environment Variables

Before deploying, gather these secrets:

| Variable | Where to Get It |
|---|---|
| `SECRET_KEY` | Run `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` or generate a 50-character random string |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) → API Keys → Create Key |
| `DATABASE_URL` | Generated automatically when you create the PostgreSQL database (next step) |

---

## 🗄️ Step 2: Create PostgreSQL Database

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name:** `flowmind-db`
   - **Database:** `flowmind`
   - **User:** `postgres`
   - **Region:** Choose your region (e.g., US East)
   - **Plan:** Free (or paid if you need more resources)
4. Click **Create Database**
5. Wait for the database to be created (~1 min)
6. Copy the **Internal Database URL** from the database page — this is your `DATABASE_URL`

---

## 🔧 Step 3: Deploy Backend Service

1. Go to Render Dashboard → **New +** → **Web Service**
2. Choose **Deploy from GitHub Repository**
3. Select your GitHub repo (authorize if needed)
4. Choose your branch (typically `main`)
5. Fill in the form:

   | Field | Value |
   |---|---|
   | **Name** | `flowmind-backend` |
   | **Runtime** | `Python 3.11` |
   | **Build Command** | `cd flowmind_backend && pip install -r requirements.txt && python manage.py collectstatic --noinput` |
   | **Start Command** | `cd flowmind_backend && python manage.py migrate --noinput && gunicorn flowmind_backend.wsgi:application --bind 0.0.0.0:$PORT` |
   | **Plan** | Free (or paid) |
   | **Region** | Same as database (e.g., US East) |

6. Click **Create Web Service**

7. **Add Environment Variables:**
   - Click **Environment** (tab on left)
   - Add these variables:
     - `SECRET_KEY` = Your Django secret key
     - `GROQ_API_KEY` = Your Groq API key
     - `DATABASE_URL` = The PostgreSQL URL from Step 2
     - `DEBUG` = `False`

8. Wait for deployment (~2-3 min) — you'll see logs in the dashboard
9. Once live, note your backend URL (e.g., `https://flowmind-backend.onrender.com`)

---

## 🎨 Step 4: Deploy Frontend Service

1. Go to Render Dashboard → **New +** → **Web Service**
2. Choose **Deploy from GitHub Repository** (same repo)
3. Choose your branch (same as backend)
4. Fill in the form:

   | Field | Value |
   |---|---|
   | **Name** | `flowmind-frontend` |
   | **Runtime** | `Node` |
   | **Build Command** | `cd frontend && npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Plan** | Free (or paid) |
   | **Region** | Same as backend |

5. Click **Create Web Service**

6. **Add Environment Variables:**
   - Click **Environment** (tab on left)
   - Add these variables:
     - `REACT_APP_API_URL` = Your backend URL (e.g., `https://flowmind-backend.onrender.com`)
     - `NODE_ENV` = `production`

7. Wait for deployment (~2-3 min)
8. Once live, note your frontend URL (e.g., `https://flowmind-frontend.onrender.com`)

---

## 🧪 Step 5: Test the Deployment

1. Open your frontend URL in a browser: `https://flowmind-frontend.onrender.com`
2. Try to **sign up** with a test account
3. Check the API docs at: `https://flowmind-backend.onrender.com/api/v1/docs/`
4. Create a goal and verify tasks are generated via Groq

---

## 🐛 Troubleshooting

### **Frontend shows "Connection error"**
- Check `REACT_APP_API_URL` env var on the frontend service
- Verify it matches your backend service URL
- Open browser DevTools → Network tab → check API requests

### **Backend returns 500 error**
- Click the backend service → **Logs** tab
- Look for Django error messages
- Common issues:
  - `GROQ_API_KEY` not set or invalid
  - `DATABASE_URL` connection error
  - Migration failed (check logs for SQL errors)

### **Database connection refused**
- Verify `DATABASE_URL` is correct
- Check the database is running (Render dashboard)
- Ensure backend can reach the database (same region helps)

### **Static files return 404**
- The `collectstatic` command runs automatically
- Check build logs for errors
- WhiteNoise middleware should serve them

### **CORS errors in browser**
- Backend allows `*.onrender.com` by default
- If using a custom domain, update `CSRF_TRUSTED_ORIGINS` in `settings.py`

---

## 📊 Monitoring & Maintenance

### View Logs
- Go to service → **Logs** tab
- Tail logs in real-time or download for analysis

### View Database
- Use a tool like [pgAdmin](https://www.pgadmin.org/) or [DBeaver](https://dbeaver.io/)
- Connection string: Use your `DATABASE_URL`

### Restart Service
- Go to service → **Settings** → **Redeploy**
- Automatically redeploys on every git push to `main`

### Scale Resources
- Free tier: 0.5 GB RAM, auto-sleeps after 15 min inactivity
- Paid tier: Dedicated resources, always-on

---

## 🔐 Security Notes

1. **Never commit `.env` files** — they're in `.gitignore`
2. **Use strong `SECRET_KEY`** — run the command from Step 1
3. **Keep `GROQ_API_KEY` secret** — use Render's environment variables
4. **Enable HTTPS** — Render provides free SSL certificates
5. **Monitor rate limits** — Backend throttles AI chat to 30 req/hour per user
6. **Backup database** — Use Render's automated backups (paid feature)

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Django Deployment:** https://docs.djangoproject.com/en/stable/howto/deployment/
- **React Production:** https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks
- **Groq API Docs:** https://console.groq.com/docs

---

Happy deploying! 🚀
