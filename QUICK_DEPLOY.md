# Quick Deploy Guide - 5 Minutes

## Fastest Option: Render (Recommended)

### Step 1: Backend (3 minutes)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: `chatbot-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   ```
   GOOGLE_GEMINI_API_KEY=your_key_here
   AUTH0_DOMAIN=your_domain.auth0.com
   AUTH0_AUDIENCE=your_audience
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_secret
   DATABASE_PATH=/opt/render/project/src/chatbot.db
   VECTOR_DB_PATH=/opt/render/project/src/vector_db
   KNOWLEDGE_BASE_PATH=/opt/render/project/src/DATABSE
   ```
6. Click "Create Web Service"
7. Wait 5-10 minutes, copy your backend URL: `https://chatbot-backend-xxxx.onrender.com`

### Step 2: Frontend (2 minutes)

1. In Render, click "New +" → "Static Site"
2. Connect same GitHub repo
3. Configure:
   - **Name**: `chatbot-frontend`
   - **Root Directory**: `auth0-nextjs`
   - **Build Command**: `cd auth0-nextjs && npm install && npm run build`
   - **Publish Directory**: `auth0-nextjs/.next`
4. Add Environment Variables:
   ```
   AUTH0_SECRET=generate_random_32_char_string
   AUTH0_BASE_URL=https://chatbot-frontend-xxxx.onrender.com
   AUTH0_ISSUER_BASE_URL=https://your_domain.auth0.com
   AUTH0_CLIENT_ID=same_as_backend
   AUTH0_CLIENT_SECRET=same_as_backend
   BACKEND_URL=https://chatbot-backend-xxxx.onrender.com
   ```
5. Click "Create Static Site"

### Step 3: Update Auth0 (1 minute)

1. Go to Auth0 Dashboard → Applications
2. Update:
   - **Allowed Callback URLs**: `https://chatbot-frontend-xxxx.onrender.com/api/auth/callback`
   - **Allowed Logout URLs**: `https://chatbot-frontend-xxxx.onrender.com`
   - **Allowed Web Origins**: `https://chatbot-frontend-xxxx.onrender.com`

### Step 4: Initialize Database

1. Go to Render → Backend Service → Shell
2. Run: `python initialize_db.py`
3. Done! 🎉

---

## Alternative: Vercel + Railway

### Frontend on Vercel (2 min)
1. [vercel.com](https://vercel.com) → Import GitHub repo
2. Root Directory: `auth0-nextjs`
3. Add environment variables (same as above)
4. Deploy!

### Backend on Railway (3 min)
1. [railway.app](https://railway.app) → New Project → GitHub
2. Add environment variables
3. Railway auto-detects Python
4. Deploy!

---

## Environment Variables Cheat Sheet

Copy-paste this list:

**Backend:**
- `GOOGLE_GEMINI_API_KEY`
- `AUTH0_DOMAIN`
- `AUTH0_AUDIENCE`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_NEXTJS_URL` (frontend URL)
- `DATABASE_PATH`
- `VECTOR_DB_PATH`
- `KNOWLEDGE_BASE_PATH`

**Frontend:**
- `AUTH0_SECRET` (random 32 chars)
- `AUTH0_BASE_URL` (frontend URL)
- `AUTH0_ISSUER_BASE_URL` (Auth0 domain)
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `BACKEND_URL` (backend URL)

---

## Troubleshooting

**Backend won't start?**
- Check all env vars are set
- Check logs in Render dashboard

**Frontend can't connect?**
- Verify BACKEND_URL is correct
- Check CORS in main.py allows your frontend URL

**Auth not working?**
- Double-check Auth0 callback URLs
- Verify AUTH0_SECRET is set (frontend)

**Database empty?**
- Run `python initialize_db.py` in Render Shell
- Upload DATABSE folder files

---

## Free Tier Limits

- **Render**: Spins down after 15 min idle (first request slow)
- **Vercel**: Unlimited, 100GB bandwidth/month
- **Railway**: $5 free credit/month

**Total Cost: $0/month** ✅

