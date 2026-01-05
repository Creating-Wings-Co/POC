# AWS Free Tier Deployment Guide

Deploy your chatbot on AWS using the **Free Tier** - $0/month for 12 months!

## AWS Free Tier Overview

### What's Free (12 months):
- **EC2**: 750 hours/month of t2.micro or t3.micro
- **Amplify**: 5GB storage, 15GB data transfer/month
- **Elastic Beanstalk**: Uses EC2 free tier
- **S3**: 5GB storage, 20K GET requests/month
- **CloudFront**: 50GB data transfer/month

### Always Free:
- **Lambda**: 1M requests/month, 400K GB-seconds
- **API Gateway**: 1M API calls/month

---

## Recommended Setup: Amplify + EC2/Elastic Beanstalk

**Frontend**: AWS Amplify (Next.js)  
**Backend**: AWS EC2 Free Tier or Elastic Beanstalk

---

## Option 1: AWS Amplify (Frontend) + EC2 (Backend)

### Part A: Deploy Backend on EC2 Free Tier

#### Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Configure Instance**:
   ```
   Name: chatbot-backend
   AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
   Instance Type: t2.micro (Free tier eligible)
   Key Pair: Create new or use existing (.pem file)
   Network: Default VPC, Auto-assign Public IP: Enable
   Storage: 8GB gp3 (Free tier: 30GB)
   Security Group: Create new
     - SSH (22) from My IP
     - Custom TCP (8000) from Anywhere (0.0.0.0/0)
   ```

3. **Launch Instance** → Download key pair (.pem file)

#### Step 2: Connect to EC2 Instance

```bash
# Make key file executable
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

#### Step 3: Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip git

# Install system dependencies for ChromaDB
sudo apt install -y gcc g++ build-essential

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step 4: Set Up Environment Variables

```bash
# Create .env file
nano .env
```

Add:
```
GOOGLE_GEMINI_API_KEY=your_key
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_AUDIENCE=your_audience
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_secret
AUTH0_NEXTJS_URL=https://your-app.amplifyapp.com
DATABASE_PATH=/home/ubuntu/chatbot.db
VECTOR_DB_PATH=/home/ubuntu/vector_db
KNOWLEDGE_BASE_PATH=/home/ubuntu/DATABSE
```

#### Step 5: Upload Knowledge Base Files

```bash
# Create DATABSE directory
mkdir -p DATABSE

# Upload files via SCP (from your local machine)
# scp -i your-key.pem -r /path/to/DATABSE/* ubuntu@YOUR_EC2_IP:/home/ubuntu/DATABSE/
```

Or use AWS S3:
```bash
# From EC2
aws s3 cp s3://your-bucket/DATABSE/ ./DATABSE/ --recursive
```

#### Step 6: Initialize Database

```bash
python initialize_db.py
```

#### Step 7: Run Application with PM2 (Keeps it running)

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name chatbot

# Make PM2 start on boot
pm2 startup
pm2 save
```

#### Step 8: Get Your Backend URL

Your backend will be at: `http://YOUR_EC2_PUBLIC_IP:8000`

**Note**: For HTTPS, set up a domain with Route 53 and use Application Load Balancer (or use Elastic Beanstalk which includes this).

---

### Part B: Deploy Frontend on AWS Amplify

#### Step 1: Push Code to GitHub

Make sure your code is on GitHub.

#### Step 2: Deploy on Amplify

1. **Go to AWS Console** → Amplify → "New app" → "Host web app"
2. **Connect Repository**:
   - Choose GitHub/GitLab/Bitbucket
   - Authorize and select your repository
   - Select branch: `main` or `master`

3. **Configure Build Settings**:
   ```
   App name: chatbot-frontend
   Environment: Production
   ```

   **Build settings** (amplify.yml):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd auth0-nextjs
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: auth0-nextjs/.next
       files:
         - '**/*'
     cache:
       paths:
         - auth0-nextjs/node_modules/**/*
         - auth0-nextjs/.next/cache/**/*
   ```

4. **Environment Variables**:
   ```
   AUTH0_SECRET=your_random_32_char_string
   AUTH0_BASE_URL=https://main.xxxxx.amplifyapp.com
   AUTH0_ISSUER_BASE_URL=https://your_domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   BACKEND_URL=http://YOUR_EC2_IP:8000
   ```

5. **Save and Deploy**
   - Amplify will build and deploy automatically
   - Get your frontend URL: `https://main.xxxxx.amplifyapp.com`

#### Step 3: Update Auth0 Settings

- **Allowed Callback URLs**: `https://main.xxxxx.amplifyapp.com/api/auth/callback`
- **Allowed Logout URLs**: `https://main.xxxxx.amplifyapp.com`
- **Allowed Web Origins**: `https://main.xxxxx.amplifyapp.com`

---

## Option 2: AWS Elastic Beanstalk (Easier Backend)

Elastic Beanstalk makes EC2 deployment easier with automatic scaling and load balancing.

### Step 1: Install EB CLI

```bash
pip install awsebcli
```

### Step 2: Initialize Elastic Beanstalk

```bash
cd /Users/samayshetty/CWMVP
eb init -p python-3.11 chatbot-backend --region us-east-1
```

### Step 3: Create Environment

```bash
eb create chatbot-env --instance-type t2.micro
```

### Step 4: Set Environment Variables

```bash
eb setenv GOOGLE_GEMINI_API_KEY=your_key \
         AUTH0_DOMAIN=your_domain \
         AUTH0_AUDIENCE=your_audience \
         AUTH0_CLIENT_ID=your_client_id \
         AUTH0_CLIENT_SECRET=your_secret \
         AUTH0_NEXTJS_URL=https://your-app.amplifyapp.com \
         DATABASE_PATH=/var/app/current/chatbot.db \
         VECTOR_DB_PATH=/var/app/current/vector_db \
         KNOWLEDGE_BASE_PATH=/var/app/current/DATABSE
```

### Step 5: Deploy

```bash
eb deploy
```

### Step 6: Get URL

```bash
eb status
# Copy the CNAME URL
```

---

## Option 3: AWS App Runner (Serverless-like)

App Runner is simpler than EC2 but has limitations with persistent storage.

### Step 1: Push Docker Image to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name chatbot-backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t chatbot-backend .
docker tag chatbot-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/chatbot-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/chatbot-backend:latest
```

### Step 2: Create App Runner Service

1. Go to AWS Console → App Runner → Create service
2. Source: ECR
3. Select your image
4. Configure:
   - CPU: 0.25 vCPU (Free tier)
   - Memory: 0.5 GB
   - Port: 8000
5. Add environment variables
6. Create service

**Note**: App Runner has limitations with persistent storage. Consider using S3 for database backups or use EC2/Elastic Beanstalk instead.

---

## Option 4: Lambda + API Gateway (Serverless)

For a serverless approach, you'd need to refactor to use:
- Lambda for API endpoints
- S3 for file storage
- DynamoDB instead of SQLite (free tier: 25GB storage, 25 RCU/WCU)

This requires significant code changes. Not recommended unless you want to refactor.

---

## Cost Comparison

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| **EC2 t2.micro** | 750 hrs/month (12 months) | ~$8.50/month |
| **Amplify** | 5GB storage, 15GB transfer | ~$0.15/GB storage |
| **Elastic Beanstalk** | Uses EC2 free tier | Same as EC2 |
| **App Runner** | 0.25 vCPU, 0.5GB RAM | ~$7/month minimum |

**Total Free Tier Cost: $0/month for 12 months** ✅

---

## Recommended Architecture

```
┌─────────────────┐
│  AWS Amplify    │  ← Frontend (Next.js) - FREE
│  (Next.js App)  │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│  AWS EC2         │  ← Backend (FastAPI) - FREE (12 months)
│  t2.micro        │
│  - SQLite DB     │
│  - ChromaDB      │
└──────────────────┘
```

---

## Post-Deployment Checklist

- [ ] EC2 instance running
- [ ] Security group allows port 8000
- [ ] Environment variables set
- [ ] Database initialized
- [ ] Knowledge base files uploaded
- [ ] PM2 or systemd service running
- [ ] Amplify frontend deployed
- [ ] Auth0 callback URLs updated
- [ ] Test authentication flow
- [ ] Test chat functionality

---

## Troubleshooting

### EC2 Backend Not Accessible
- Check security group allows port 8000 from 0.0.0.0/0
- Check EC2 instance is running
- Check application is running: `pm2 list` or `ps aux | grep uvicorn`

### Amplify Build Fails
- Check build logs in Amplify console
- Verify `amplify.yml` is correct
- Check environment variables are set

### Database Not Persisting
- EC2 instances persist data on EBS volume
- Elastic Beanstalk uses EBS automatically
- App Runner: Use S3 for persistence

### High Costs
- Monitor AWS Billing Dashboard
- Set up billing alerts
- Use AWS Cost Explorer

---

## Security Best Practices

1. **EC2 Security Group**: Only allow port 8000 from Amplify IP or use Application Load Balancer
2. **Environment Variables**: Never commit .env files
3. **Key Pairs**: Keep .pem files secure
4. **IAM Roles**: Use IAM roles instead of access keys when possible
5. **HTTPS**: Set up domain with SSL certificate (free via AWS Certificate Manager)

---

## Next Steps

1. Choose deployment option (EC2 + Amplify recommended)
2. Follow steps above
3. Set up custom domain (optional)
4. Configure CloudWatch for monitoring
5. Set up automated backups

---

## Need Help?

- AWS EC2 Docs: https://docs.aws.amazon.com/ec2/
- AWS Amplify Docs: https://docs.aws.amazon.com/amplify/
- AWS Elastic Beanstalk Docs: https://docs.aws.amazon.com/elasticbeanstalk/

