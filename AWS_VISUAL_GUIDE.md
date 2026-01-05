# AWS Deployment Visual Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        YOUR USERS                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS Amplify (Frontend)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js Application                                  │   │
│  │  - Auth0 Authentication                               │   │
│  │  - Chat Interface                                     │   │
│  │  URL: https://main.xxxxx.amplifyapp.com              │   │
│  └───────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTP API Calls
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS EC2 Instance (Backend)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FastAPI Application                                  │   │
│  │  - Chat API                                           │   │
│  │  - RAG System                                         │   │
│  │  - Authentication                                     │   │
│  │  URL: http://YOUR_IP:8000                             │   │
│  └───────┬───────────────────────┬──────────────────────┘   │
│          │                       │                           │
│          ▼                       ▼                           │
│  ┌──────────────┐      ┌──────────────────┐               │
│  │  SQLite DB   │      │   ChromaDB        │               │
│  │  (chatbot.db)│      │   (vector_db/)    │               │
│  └──────────────┘      └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ External APIs
                           ▼
        ┌──────────────────────────────────────┐
        │  Google Gemini API                   │
        │  Auth0 Authentication Service        │
        └──────────────────────────────────────┘
```

---

## Deployment Flow

```
START
  │
  ├─► Create AWS Account
  │     │
  │     ├─► Enter email & password
  │     ├─► Add payment info (won't charge)
  │     └─► Verify phone number
  │
  ├─► Launch EC2 Instance
  │     │
  │     ├─► Choose Ubuntu 22.04
  │     ├─► Select t2.micro (free)
  │     ├─► Create key pair (.pem file)
  │     ├─► Configure security group
  │     └─► Launch & get IP address
  │
  ├─► Connect to EC2
  │     │
  │     ├─► SSH with .pem file
  │     └─► Install dependencies
  │
  ├─► Setup Backend
  │     │
  │     ├─► Clone repository
  │     ├─► Create virtual environment
  │     ├─► Install Python packages
  │     ├─► Create .env file
  │     ├─► Upload knowledge base
  │     ├─► Initialize database
  │     └─► Start with PM2
  │
  ├─► Deploy Frontend on Amplify
  │     │
  │     ├─► Connect GitHub repo
  │     ├─► Configure build settings
  │     ├─► Set environment variables
  │     └─► Deploy & get URL
  │
  ├─► Configure Auth0
  │     │
  │     ├─► Update callback URLs
  │     ├─► Update logout URLs
  │     └─► Update web origins
  │
  └─► TEST & VERIFY
        │
        ├─► Test backend health
        ├─► Test frontend login
        └─► Test chat functionality

END - Your chatbot is live! 🎉
```

---

## Step-by-Step Visual Flow

### Step 1: AWS Account Creation
```
Browser → aws.amazon.com
    │
    ├─► Click "Create Account"
    ├─► Enter email
    ├─► Verify email
    ├─► Create password
    ├─► Enter contact info
    ├─► Add payment (won't charge)
    └─► Verify phone
         │
         └─► ✅ Account Created
```

### Step 2: EC2 Instance Launch
```
AWS Console → EC2
    │
    ├─► Click "Launch Instance"
    ├─► Name: chatbot-backend
    ├─► AMI: Ubuntu 22.04
    ├─► Type: t2.micro
    ├─► Create key pair (.pem)
    ├─► Security: Port 8000 open
    └─► Launch
         │
         └─► ✅ Instance Running (Note IP)
```

### Step 3: Connect & Setup
```
Terminal → SSH Connection
    │
    ├─► chmod 400 key.pem
    ├─► ssh -i key.pem ubuntu@IP
    ├─► sudo apt update
    ├─► Install Python, Node, PM2
    ├─► Clone repo
    ├─► Setup venv
    ├─► Install requirements
    ├─► Create .env
    ├─► Upload DATABSE files
    ├─► Initialize DB
    └─► pm2 start
         │
         └─► ✅ Backend Running
```

### Step 4: Amplify Deployment
```
AWS Console → Amplify
    │
    ├─► New App → Host Web App
    ├─► Connect GitHub
    ├─► Select repo & branch
    ├─► Configure build (amplify.yml)
    ├─► Set environment variables
    └─► Deploy
         │
         └─► ✅ Frontend Live (Note URL)
```

### Step 5: Auth0 Configuration
```
Auth0 Dashboard → Applications
    │
    ├─► Select your app
    ├─► Update Callback URLs
    ├─► Update Logout URLs
    ├─► Update Web Origins
    └─► Save
         │
         └─► ✅ Auth0 Configured
```

---

## File Structure on EC2

```
/home/ubuntu/chatbot/
│
├── .env                    # Environment variables
├── chatbot.db              # SQLite database
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── venv/                   # Virtual environment
│
├── vector_db/              # ChromaDB vector store
│   └── chroma.sqlite3
│
├── DATABSE/                # Knowledge base files
│   ├── file1.pdf
│   ├── file2.docx
│   └── ...
│
└── (other project files)
```

---

## Network Flow

```
User Browser
    │
    │ HTTPS Request
    ▼
AWS CloudFront (Amplify CDN)
    │
    │ Serves Next.js App
    ▼
User Sees Frontend
    │
    │ User Clicks "Login"
    ▼
Auth0 Authentication
    │
    │ Returns Token
    ▼
Frontend Stores Token
    │
    │ User Sends Message
    │ API Call with Token
    ▼
EC2 Backend (Port 8000)
    │
    ├─► Validates Token (Auth0)
    ├─► Processes Message
    ├─► Queries SQLite DB
    ├─► Searches ChromaDB
    ├─► Calls Gemini API
    └─► Returns Response
         │
         ▼
Frontend Displays Response
```

---

## Security Flow

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
         │ HTTPS (Encrypted)
         ▼
┌─────────────────┐
│  AWS Amplify    │
│  (Frontend)     │
└────────┬────────┘
         │
         │ API Call
         │ (Bearer Token)
         ▼
┌─────────────────┐
│  EC2 Backend    │
│  Port 8000      │
└────────┬────────┘
         │
         │ Validates Token
         ▼
┌─────────────────┐
│  Auth0 Service  │
└─────────────────┘
```

---

## Cost Breakdown (Free Tier)

```
┌─────────────────────────────────────┐
│  AWS Free Tier (12 months)          │
├─────────────────────────────────────┤
│  EC2 t2.micro:  750 hrs/month  FREE │
│  Amplify:       5GB storage   FREE  │
│  Amplify:       15GB transfer FREE  │
│  Data Transfer: 1GB/month     FREE  │
├─────────────────────────────────────┤
│  TOTAL COST:    $0.00/month         │
└─────────────────────────────────────┘
```

---

## Monitoring Dashboard

```
AWS Console
    │
    ├─► EC2 Dashboard
    │     ├─► Instance Status: Running
    │     ├─► CPU Utilization: Low
    │     └─► Network In/Out
    │
    ├─► Amplify Dashboard
    │     ├─► Deployment Status: Live
    │     ├─► Build History
    │     └─► Access Logs
    │
    └─► Billing Dashboard
          ├─► Current Charges: $0.00
          └─► Free Tier Usage
```

---

## Common Issues & Solutions

```
Issue: Can't connect to EC2
  │
  ├─► Check security group (port 22)
  ├─► Check .pem file permissions
  └─► Verify IP address

Issue: Backend not accessible
  │
  ├─► Check security group (port 8000)
  ├─► Check PM2 status
  └─► Check firewall

Issue: Frontend build fails
  │
  ├─► Check build logs
  ├─► Verify amplify.yml
  └─► Check environment variables

Issue: Auth0 not working
  │
  ├─► Check callback URLs
  ├─► Verify environment variables
  └─► Check browser console
```

---

## Quick Reference Card

```
┌─────────────────────────────────────┐
│  EC2 Connection                     │
│  ssh -i key.pem ubuntu@IP           │
├─────────────────────────────────────┤
│  Backend URL                        │
│  http://IP:8000                     │
├─────────────────────────────────────┤
│  Frontend URL                       │
│  https://main.xxx.amplifyapp.com    │
├─────────────────────────────────────┤
│  Check Backend                      │
│  pm2 status                         │
├─────────────────────────────────────┤
│  Restart Backend                    │
│  pm2 restart chatbot                │
├─────────────────────────────────────┤
│  View Logs                          │
│  pm2 logs chatbot                   │
└─────────────────────────────────────┘
```

