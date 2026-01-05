# Local Development Setup Guide

This guide will help you run the chatbot application locally on your machine.

## Prerequisites

- Python 3.11 or higher
- Node.js 18+ and npm
- Google Gemini API key
- Auth0 account (for authentication)

---

## Step 1: Set Up Backend (Python/FastAPI)

### 1.1 Navigate to Project Directory
```bash
cd /Users/samayshetty/CWMVP
```

### 1.2 Activate Virtual Environment
```bash
# Activate the existing virtual environment
source venv/bin/activate

# If venv doesn't exist or you want to create a new one:
# python3 -m venv venv
# source venv/bin/activate
```

### 1.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Create Backend Environment File
Create a `.env` file in the root directory (`/Users/samayshetty/CWMVP/.env`):

```bash
nano .env
```

Add the following content (replace with your actual values):

```env
# Google Gemini API Key (Required)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Database Paths (Optional - defaults shown)
DATABASE_PATH=chatbot.db
VECTOR_DB_PATH=./vector_db
KNOWLEDGE_BASE_PATH=./DATABSE

# Auth0 Configuration (Required)
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_AUDIENCE=your_auth0_audience
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_NEXTJS_URL=http://localhost:3000
```

**To save in nano:** Press `Ctrl + X`, then `Y`, then `Enter`

### 1.5 Initialize Database
```bash
python initialize_db.py
```

This will:
- Create the SQLite database
- Process documents in the `DATABSE/` folder
- Create the vector database

### 1.6 Start Backend Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes.

**Backend will be running at:** `http://localhost:8000`

**Test it:** Open `http://localhost:8000/api/health` in your browser. You should see:
```json
{"status":"healthy","database":"connected","vector_store":"ready"}
```

---

## Step 2: Set Up Frontend (Next.js)

### 2.1 Navigate to Frontend Directory
Open a **new terminal window** (keep backend running):

```bash
cd /Users/samayshetty/CWMVP/auth0-nextjs
```

### 2.2 Install Node Dependencies
```bash
npm install
```

### 2.3 Create Frontend Environment File
Create a `.env.local` file in the `auth0-nextjs/` directory:

```bash
nano .env.local
```

Add the following content:

```env
# Auth0 Configuration (Required)
AUTH0_SECRET=generate_a_random_32_character_string_here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your_domain.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_AUDIENCE=your_auth0_audience

# Backend URL (Required)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

**To generate AUTH0_SECRET:**
```bash
openssl rand -hex 32
```

Copy the output and use it as your `AUTH0_SECRET` value.

### 2.4 Start Frontend Development Server
```bash
npm run dev
```

**Frontend will be running at:** `http://localhost:3000`

---

## Step 3: Configure Auth0

### 3.1 Update Auth0 Application Settings

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Navigate to **Applications** → Your Application
3. Update the following URLs:

   **Allowed Callback URLs:**
   ```
   http://localhost:3000/api/auth/callback
   ```

   **Allowed Logout URLs:**
   ```
   http://localhost:3000
   ```

   **Allowed Web Origins:**
   ```
   http://localhost:3000
   ```

4. Click **"Save Changes"**

---

## Step 4: Access Your App

1. **Open your browser** and go to: `http://localhost:3000`
2. **Click "Login"** - you'll be redirected to Auth0
3. **Sign in** with Google (or your Auth0 account)
4. **You'll be redirected back** to your chatbot
5. **Start chatting!** 

---

## Running Both Servers

You need **two terminal windows** running simultaneously:

### Terminal 1 - Backend:
```bash
cd /Users/samayshetty/CWMVP
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 - Frontend:
```bash
cd /Users/samayshetty/CWMVP/auth0-nextjs
npm run dev
```

---

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Module not found errors:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Database errors:**
```bash
# Reinitialize the database
python initialize_db.py
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

**Module not found errors:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Auth0 errors:**
- Make sure `.env.local` has all required Auth0 variables
- Verify Auth0 callback URLs match exactly
- Check that `AUTH0_SECRET` is set correctly

### Connection Issues

**Frontend can't connect to backend:**
- Make sure backend is running on port 8000
- Check `NEXT_PUBLIC_FASTAPI_URL` in `.env.local` matches backend URL
- Verify CORS is enabled in backend (it should be by default)

---

## Quick Commands Reference

### Start Backend:
```bash
cd /Users/samayshetty/CWMVP
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend:
```bash
cd /Users/samayshetty/CWMVP/auth0-nextjs
npm run dev
```

### Stop Servers:
- Press `Ctrl + C` in each terminal window

### Check Backend Health:
```bash
curl http://localhost:8000/api/health
```

---

## Environment Variables Summary

### Backend (.env):
- `GOOGLE_GEMINI_API_KEY` - Required
- `AUTH0_DOMAIN` - Required
- `AUTH0_AUDIENCE` - Required
- `AUTH0_CLIENT_ID` - Required
- `AUTH0_CLIENT_SECRET` - Required
- `AUTH0_NEXTJS_URL` - Required (use `http://localhost:3000` for local)
- `DATABASE_PATH` - Optional (default: `chatbot.db`)
- `VECTOR_DB_PATH` - Optional (default: `./vector_db`)
- `KNOWLEDGE_BASE_PATH` - Optional (default: `./DATABSE`)

### Frontend (.env.local):
- `AUTH0_SECRET` - Required (generate with `openssl rand -hex 32`)
- `AUTH0_BASE_URL` - Required (`http://localhost:3000` for local)
- `AUTH0_ISSUER_BASE_URL` - Required
- `AUTH0_CLIENT_ID` - Required
- `AUTH0_CLIENT_SECRET` - Required
- `AUTH0_AUDIENCE` - Required
- `NEXT_PUBLIC_FASTAPI_URL` - Required (`http://localhost:8000` for local)

---

