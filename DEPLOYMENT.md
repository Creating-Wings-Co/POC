# Free Hosting Guide for Creating Wings Chatbot

This guide covers multiple free hosting options for your chatbot application.

## Architecture Overview

- **Backend**: FastAPI (Python) - handles chat, RAG, and database
- **Frontend**: Next.js (React) - Auth0 authentication UI
- **Database**: SQLite (chatbot.db)
- **Vector DB**: ChromaDB (vector_db/)
- **APIs**: Google Gemini, Auth0

---

## Option 1: Render (Recommended - Easiest)

Render offers free hosting for both backend and frontend with persistent storage.

### Backend Deployment on Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Backend Service**
   ```
   Name: chatbot-backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Set Environment Variables**
   - Go to Environment tab
   - Add these variables:
     ```
     GOOGLE_GEMINI_API_KEY=your_gemini_key
     AUTH0_DOMAIN=your_auth0_domain
     AUTH0_AUDIENCE=your_auth0_audience
     AUTH0_CLIENT_ID=your_auth0_client_id
     AUTH0_CLIENT_SECRET=your_auth0_client_secret
     AUTH0_NEXTJS_URL=https://your-frontend.onrender.com
     DATABASE_PATH=/opt/render/project/src/chatbot.db
     VECTOR_DB_PATH=/opt/render/project/src/vector_db
     KNOWLEDGE_BASE_PATH=/opt/render/project/src/DATABSE
     PORT=10000
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://chatbot-backend.onrender.com`

### Frontend Deployment on Render

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Frontend**
   ```
   Name: chatbot-frontend
   Root Directory: auth0-nextjs
   Build Command: npm install && npm run build
   Publish Directory: auth0-nextjs/.next
   ```

3. **Set Environment Variables**
   ```
   AUTH0_SECRET=your_random_secret_32_chars
   AUTH0_BASE_URL=https://chatbot-frontend.onrender.com
   AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   BACKEND_URL=https://chatbot-backend.onrender.com
   ```

4. **Update Auth0 Settings**
   - Go to Auth0 Dashboard → Applications
   - Update Allowed Callback URLs:
     ```
     https://chatbot-frontend.onrender.com/api/auth/callback
     ```
   - Update Allowed Logout URLs:
     ```
     https://chatbot-frontend.onrender.com
     ```
   - Update Allowed Web Origins:
     ```
     https://chatbot-frontend.onrender.com
     ```

### Upload Knowledge Base Files

1. **Option A: Use Render Shell** (Recommended)
   ```bash
   # SSH into your Render service
   # Upload DATABSE folder files via Render dashboard → Shell
   ```

2. **Option B: Include in Git**
   - Add DATABSE folder to repository
   - Files will be deployed automatically

3. **Option C: Use Render Disk**
   - Render free tier includes persistent disk
   - Files persist across deployments

### Initialize Vector Database

After first deployment, run initialization:
```bash
# Via Render Shell or add to build command
python initialize_db.py
```

---

## Option 2: Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel (Best for Next.js)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Set Root Directory: `auth0-nextjs`

3. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   ```

4. **Set Environment Variables**
   ```
   AUTH0_SECRET=your_random_secret
   AUTH0_BASE_URL=https://your-app.vercel.app
   AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   BACKEND_URL=https://your-backend.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel auto-deploys on every push

### Backend on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Get $5 free credit/month

2. **Create New Project**
   - Click "New Project"
   - "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**
   - Railway auto-detects Python
   - Add `Procfile`:
     ```
     web: uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

4. **Set Environment Variables**
   ```
   GOOGLE_GEMINI_API_KEY=your_key
   AUTH0_DOMAIN=your_domain
   AUTH0_AUDIENCE=your_audience
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_secret
   AUTH0_NEXTJS_URL=https://your-app.vercel.app
   DATABASE_PATH=/app/chatbot.db
   VECTOR_DB_PATH=/app/vector_db
   KNOWLEDGE_BASE_PATH=/app/DATABSE
   PORT=8000
   ```

5. **Add Persistent Storage**
   - Railway provides persistent disk automatically
   - Database files persist across deployments

---

## Option 3: Fly.io (All-in-One)

Fly.io offers free tier with shared CPU.

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create fly.toml**
   ```toml
   app = "your-chatbot-name"
   primary_region = "iad"

   [build]
     builder = "paketobuildpacks/builder:base"

   [http_service]
     internal_port = 8000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 256
   ```

3. **Deploy**
   ```bash
   fly launch
   fly secrets set GOOGLE_GEMINI_API_KEY=your_key
   fly secrets set AUTH0_DOMAIN=your_domain
   # ... set all other secrets
   fly deploy
   ```

---

## Option 4: PythonAnywhere (Backend Only)

Good for Python backend, but frontend needs separate hosting.

1. **Create Account**
   - Go to [pythonanywhere.com](https://www.pythonanywhere.com)
   - Free tier available

2. **Upload Files**
   - Use Files tab to upload your project
   - Or clone from GitHub

3. **Configure Web App**
   - Go to Web tab
   - Create new web app
   - Select "Manual configuration" → Python 3.11
   - Set source code path

4. **Set Environment Variables**
   - Edit WSGI file to set environment variables
   - Or use `.env` file

5. **Run**
   - Reload web app
   - Access via `yourusername.pythonanywhere.com`

---

## Important Notes

### Database Persistence

- **Render**: Free tier includes persistent disk (files persist)
- **Railway**: Persistent storage included
- **Vercel**: Serverless (no persistent storage for backend)
- **Fly.io**: Volumes available (need to configure)

### Free Tier Limitations

- **Render**: 
  - Free tier spins down after 15 min inactivity
  - First request after spin-down takes ~30 seconds
  - 750 hours/month free

- **Railway**: 
  - $5 free credit/month
  - Pay-as-you-go after credit

- **Vercel**: 
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless functions

- **Fly.io**: 
  - 3 shared VMs free
  - 3GB persistent volumes
  - 160GB outbound data/month

### Recommended Setup

**Best for Production:**
- Frontend: Vercel (Next.js optimized)
- Backend: Railway (persistent storage, reliable)

**Best for Testing:**
- Everything on Render (simplest, one platform)

**Best for Scale:**
- Frontend: Vercel
- Backend: Fly.io (better performance)

---

## Post-Deployment Checklist

- [ ] Update Auth0 callback URLs
- [ ] Set all environment variables
- [ ] Initialize vector database (`python initialize_db.py`)
- [ ] Upload knowledge base files (DATABSE folder)
- [ ] Test authentication flow
- [ ] Test chat functionality
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)

---

## Troubleshooting

### Backend won't start
- Check environment variables are set
- Check logs in hosting dashboard
- Verify PORT environment variable

### Database not persisting
- Ensure using persistent disk/storage
- Check file paths in environment variables
- Verify write permissions

### Frontend can't connect to backend
- Check CORS settings in main.py
- Verify BACKEND_URL environment variable
- Check Auth0 callback URLs

### Vector database empty
- Run `python initialize_db.py` after deployment
- Verify DATABSE folder files are uploaded
- Check VECTOR_DB_PATH is correct

---

## Cost Summary

All options below are **FREE** for small-scale usage:

- **Render**: Free tier (spins down when idle)
- **Vercel**: Free tier (generous limits)
- **Railway**: $5 free credit/month
- **Fly.io**: Free tier (3 VMs)

Total cost: **$0/month** for development/testing!

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Fly.io Docs: https://fly.io/docs

