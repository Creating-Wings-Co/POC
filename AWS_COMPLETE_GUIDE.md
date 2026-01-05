# Complete AWS Deployment Guide - From Zero to Deployed

This is a **beginner-friendly, step-by-step guide** that takes you from creating an AWS account to having your chatbot fully deployed. Follow each step carefully.

---

## Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account (free)
- ✅ Your chatbot code pushed to GitHub
- ✅ Your Google Gemini API key
- ✅ Your Auth0 credentials (domain, client ID, client secret, audience)
- ✅ A credit/debit card (required for AWS account, but won't be charged for free tier)

---

## PART 1: Setting Up AWS Account (10 minutes)

### Step 1: Create AWS Account

1. **Go to AWS Website**
   - Open your browser
   - Go to: https://aws.amazon.com
   - Click **"Create an AWS Account"** (top right)

2. **Enter Email and Account Name**
   - Enter your email address
   - Choose an account name (e.g., "My Chatbot")
   - Click **"Verify email address"**
   - Check your email and enter the verification code

3. **Create Password**
   - Create a strong password
   - Re-enter password
   - Click **"Continue"**

4. **Contact Information**
   - Fill in your name, company (optional), phone number
   - Select country/region
   - Click **"Create account and continue"**

5. **Payment Information** ⚠️
   - **Don't worry!** AWS Free Tier won't charge you
   - Enter credit/debit card information
   - AWS will verify with a small temporary charge (refunded immediately)
   - Click **"Secure Submit"**

6. **Identity Verification**
   - AWS will call your phone number
   - Enter the verification code shown on screen
   - Select a support plan: **"Basic Plan - Free"**
   - Click **"Complete sign up"**

7. **Wait for Account Activation**
   - You'll see "Your account is being activated"
   - Wait 2-5 minutes
   - You'll receive a confirmation email

8. **Sign In**
   - Go to: https://console.aws.amazon.com
   - Sign in with your email and password

### Step 2: Choose AWS Region

1. **Select Region** (top right of AWS Console)
   - Recommended: **US East (N. Virginia) - us-east-1**
   - This region has the most services and best free tier availability
   - Click the region dropdown and select it

**✅ Part 1 Complete!** You now have an AWS account.

---

## PART 2: Deploy Backend on EC2 (30 minutes)

### Step 3: Launch EC2 Instance

1. **Open EC2 Console**
   - In AWS Console, search for **"EC2"** in the search bar
   - Click on **"EC2"** service

2. **Launch Instance**
   - Click the big orange button: **"Launch instance"**

3. **Name Your Instance**
   - **Name**: `chatbot-backend`
   - (Optional) Add tags if you want

4. **Choose AMI (Operating System)**
   - Scroll down to **"Application and OS Images"**
   - Click **"Browse more AMIs"**
   - Search for: **"Ubuntu"**
   - Select: **"Ubuntu Server 22.04 LTS"** (Free tier eligible)
   - Click **"Select"**

5. **Choose Instance Type**
   - Scroll to **"Instance type"**
   - Select: **"t2.micro"** (Free tier eligible)
   - This gives you 1 vCPU and 1 GB RAM (enough for your chatbot)

6. **Create Key Pair** (Important!)
   - Scroll to **"Key pair (login)"**
   - Click **"Create new key pair"**
   - **Key pair name**: `chatbot-key`
   - **Key pair type**: RSA
   - **Private key file format**: `.pem` (for Mac/Linux) or `.ppk` (for Windows)
   - Click **"Create key pair"**
   - **IMPORTANT**: The `.pem` file will download automatically. **SAVE IT SAFELY!** You'll need it to connect.

7. **Network Settings**
   - Scroll to **"Network settings"**
   - Click **"Edit"**
   - **Security group name**: `chatbot-backend-sg`
   - **Description**: `Security group for chatbot backend`
   - **Inbound security group rules**:
     - **Rule 1**: 
       - Type: SSH
       - Source: My IP (auto-filled)
     - **Click "Add security group rule"**
     - **Rule 2**:
       - Type: Custom TCP
       - Port: 8000
       - Source: Anywhere-IPv4 (0.0.0.0/0)
       - Description: `FastAPI backend port`
   - Leave everything else as default

8. **Configure Storage**
   - Scroll to **"Configure storage"**
   - **Size**: 8 GB (Free tier includes 30 GB)
   - Leave everything else default

9. **Review and Launch**
   - Scroll to bottom
   - Click **"Launch instance"**
   - You'll see: **"Successfully initiated launch of instance"**
   - Click **"View all instances"**

10. **Wait for Instance to Start**
    - You'll see your instance with status **"Pending"**
    - Wait 1-2 minutes
    - Status will change to **"Running"**
    - Note the **"Public IPv4 address"** (e.g., 54.123.45.67) - **COPY THIS!**

**✅ Step 3 Complete!** Your EC2 instance is running.

---

### Step 4: Connect to EC2 Instance

#### For Mac/Linux Users:

1. **Open Terminal**
   - Open Terminal app on your Mac

2. **Navigate to Downloads** (where your .pem file is)
   ```bash
   cd ~/Downloads
   ```

3. **Set Permissions**
   ```bash
   chmod 400 chatbot-key.pem
   ```

4. **Connect via SSH**
   ```bash
   ssh -i chatbot-key.pem ubuntu@YOUR_PUBLIC_IP
   ```
   Replace `YOUR_PUBLIC_IP` with the IP address you copied earlier.
   
   Example:
   ```bash
   ssh -i chatbot-key.pem ubuntu@54.123.45.67
   ```

5. **Accept Security Warning**
   - Type `yes` when asked "Are you sure you want to continue connecting?"
   - You should see: `Welcome to Ubuntu...`

**✅ You're now connected to your EC2 instance!**

#### For Windows Users:

1. **Install PuTTY** (if not installed)
   - Download: https://www.putty.org/
   - Install it

2. **Convert .pem to .ppk**
   - Open **PuTTYgen** (comes with PuTTY)
   - Click **"Load"**
   - Select your `chatbot-key.pem` file
   - Click **"Save private key"** → Save as `chatbot-key.ppk`

3. **Connect via PuTTY**
   - Open **PuTTY**
   - **Host Name**: `ubuntu@YOUR_PUBLIC_IP`
   - **Connection type**: SSH
   - **Port**: 22
   - In left sidebar: **Connection → SSH → Auth → Credentials**
   - **Private key file**: Browse and select `chatbot-key.ppk`
   - Click **"Open"**
   - Click **"Yes"** on security warning

**✅ You're now connected!**

---

### Step 5: Install Dependencies on EC2

**Run these commands one by one** (copy and paste each line, press Enter):

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y
```

Wait for this to finish (takes 2-3 minutes).

```bash
# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip git
```

```bash
# Install build tools (needed for ChromaDB)
sudo apt install -y gcc g++ build-essential
```

```bash
# Install Node.js (for PM2 process manager)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

```bash
# Install PM2 (keeps your app running)
sudo npm install -g pm2
```

```bash
# Verify installations
python3.11 --version
node --version
pm2 --version
```

You should see version numbers. **✅ Dependencies installed!**

---

### Step 6: Clone Your Repository

**Option A: If your code is on GitHub** (Recommended):

```bash
# Create app directory
mkdir -p ~/chatbot
cd ~/chatbot

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

**Option B: If you need to upload files manually:**

1. **On your local machine**, compress your project folder
2. **Upload to EC2**:
   ```bash
   # On your local machine (new terminal window)
   scp -i chatbot-key.pem -r /path/to/your/CWMVP ubuntu@YOUR_PUBLIC_IP:~/chatbot
   ```

3. **On EC2**:
   ```bash
   cd ~/chatbot
   ```

**✅ Code is now on EC2!**

---

### Step 7: Set Up Python Environment

```bash
# Make sure you're in the project directory
cd ~/chatbot

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# You should see (venv) in your prompt now
```

```bash
# Upgrade pip
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

This will take 3-5 minutes. Wait for it to finish.

**✅ Python environment ready!**

---

### Step 8: Create Environment Variables File

```bash
# Create .env file
nano .env
```

This opens a text editor. **Copy and paste this**, then replace the values:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_AUDIENCE=your_auth0_audience
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_NEXTJS_URL=https://your-frontend-will-be-here.amplifyapp.com
DATABASE_PATH=/home/ubuntu/chatbot/chatbot.db
VECTOR_DB_PATH=/home/ubuntu/chatbot/vector_db
KNOWLEDGE_BASE_PATH=/home/ubuntu/chatbot/DATABSE
```

**To save and exit nano:**
- Press `Ctrl + X`
- Press `Y` (yes)
- Press `Enter`

**✅ Environment variables set!**

---

### Step 9: Create Required Directories

```bash
# Create directories for database and knowledge base
mkdir -p vector_db DATABSE
```

---

### Step 10: Upload Knowledge Base Files

**Option A: Using SCP (from your local machine):**

Open a **new terminal window on your local machine**:

```bash
# Navigate to your project directory
cd /Users/samayshetty/CWMVP

# Upload DATABSE folder
scp -i ~/Downloads/chatbot-key.pem -r DATABSE/* ubuntu@YOUR_PUBLIC_IP:~/chatbot/DATABSE/
```

**Option B: Using Git:**

If your DATABSE folder is in Git, it should already be there. If not, add it and push:

```bash
# On EC2, if files are already there, skip this
# Otherwise, you'll need to upload manually
```

**✅ Knowledge base files uploaded!**

---

### Step 11: Initialize Database

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Initialize the database
python initialize_db.py
```

You should see output like "Database initialized" and "Added X documents to vector store".

**✅ Database initialized!**

---

### Step 12: Test Backend Locally

```bash
# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test it:**
- Open a new browser tab
- Go to: `http://YOUR_PUBLIC_IP:8000/api/health`
- You should see: `{"status":"healthy","database":"connected","vector_store":"ready"}`

**✅ Backend is working!**

Press `Ctrl + C` to stop the server.

---

### Step 13: Run Backend with PM2 (Keeps it running)

```bash
# Start with PM2
pm2 start "venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name chatbot

# Check status
pm2 status

# View logs
pm2 logs chatbot

# Make PM2 start on system boot
pm2 startup
# Copy the command it gives you and run it (it will be something like: sudo env PATH=...)
pm2 save
```

**✅ Backend is now running permanently!**

**Your backend URL**: `http://YOUR_PUBLIC_IP:8000`

**Note this URL** - you'll need it for the frontend!

---

## PART 3: Deploy Frontend on AWS Amplify (20 minutes)

### Step 14: Push Code to GitHub (If Not Already)

**On your local machine:**

```bash
cd /Users/samayshetty/CWMVP

# Check if you have a git repository
git status

# If not initialized:
git init
git add .
git commit -m "Initial commit"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**✅ Code is on GitHub!**

---

### Step 15: Deploy on AWS Amplify

1. **Open AWS Amplify Console**
   - In AWS Console, search for **"Amplify"**
   - Click on **"AWS Amplify"**

2. **Create New App**
   - Click **"New app"** → **"Host web app"**

3. **Connect Repository**
   - Choose **"GitHub"** (or GitLab/Bitbucket if you prefer)
   - Click **"Authorize"** → Sign in to GitHub
   - Grant AWS Amplify permissions
   - Select your repository: `YOUR_REPO_NAME`
   - Select branch: `main` (or `master`)
   - Click **"Next"**

4. **Configure Build Settings**
   - **App name**: `chatbot-frontend`
   - **Environment name**: `production`
   
   **Build settings** - Click **"Edit"** and paste this:

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

   - Click **"Save"**
   - Click **"Next"**

5. **Set Environment Variables**
   - Click **"Add environment variable"** for each:
   
   ```
   AUTH0_SECRET=generate_a_random_32_character_string_here
   AUTH0_BASE_URL=https://main.xxxxx.amplifyapp.com
   AUTH0_ISSUER_BASE_URL=https://your_domain.auth0.com
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   BACKEND_URL=http://YOUR_EC2_PUBLIC_IP:8000
   ```

   **To generate AUTH0_SECRET:**
   - On Mac/Linux: `openssl rand -hex 32`
   - Or use: https://generate-secret.vercel.app/32
   
   **For AUTH0_BASE_URL**: You'll get this after deployment, but you can update it later.

   - Click **"Save"** → **"Next"**

6. **Review and Deploy**
   - Review all settings
   - Click **"Save and deploy"**

7. **Wait for Deployment**
   - Amplify will:
     - Provision hosting
     - Install dependencies
     - Build your app
     - Deploy
   - This takes **5-10 minutes**
   - You'll see progress in real-time

8. **Get Your Frontend URL**
   - When deployment completes, you'll see: **"Deployed"**
   - Copy the URL: `https://main.xxxxx.amplifyapp.com`
   - **This is your frontend URL!**

**✅ Frontend deployed!**

---

### Step 16: Update Environment Variables

1. **Go back to Amplify Console**
   - Click on your app
   - Go to **"Environment variables"**
   - Click **"Manage variables"**

2. **Update AUTH0_BASE_URL**
   - Change `AUTH0_BASE_URL` to your actual Amplify URL
   - Click **"Save"**
   - Click **"Redeploy this version"**

---

### Step 17: Update Backend Environment Variable

**On EC2:**

```bash
# Connect to EC2 again
ssh -i chatbot-key.pem ubuntu@YOUR_PUBLIC_IP

# Edit .env file
cd ~/chatbot
nano .env
```

Update `AUTH0_NEXTJS_URL` to your Amplify URL:
```
AUTH0_NEXTJS_URL=https://main.xxxxx.amplifyapp.com
```

Save and exit (`Ctrl + X`, `Y`, `Enter`)

```bash
# Restart backend
pm2 restart chatbot
```

---

## PART 4: Configure Auth0 (5 minutes)

### Step 18: Update Auth0 Settings

1. **Go to Auth0 Dashboard**
   - Login at: https://manage.auth0.com
   - Go to **Applications** → Your Application

2. **Update URLs**
   - **Allowed Callback URLs**:
     ```
     https://main.xxxxx.amplifyapp.com/api/auth/callback, http://localhost:3000/api/auth/callback
     ```
   
   - **Allowed Logout URLs**:
     ```
     https://main.xxxxx.amplifyapp.com, http://localhost:3000
     ```
   
   - **Allowed Web Origins**:
     ```
     https://main.xxxxx.amplifyapp.com
     ```

3. **Save Changes**
   - Scroll down and click **"Save Changes"**

**✅ Auth0 configured!**

---

## PART 5: Final Testing (5 minutes)

### Step 19: Test Your Deployment

1. **Test Backend**
   - Open: `http://YOUR_EC2_IP:8000/api/health`
   - Should see: `{"status":"healthy"}`

2. **Test Frontend**
   - Open: `https://main.xxxxx.amplifyapp.com`
   - Should see your chatbot interface
   - Try logging in with Google
   - Try sending a message

3. **Check Logs** (if something doesn't work)

   **Backend logs:**
   ```bash
   ssh -i chatbot-key.pem ubuntu@YOUR_PUBLIC_IP
   pm2 logs chatbot
   ```

   **Frontend logs:**
   - Go to Amplify Console → Your app → Deployments → Click latest deployment → View logs

**✅ Everything should be working!**

---

## PART 6: Sharing Your App with Others 🌐

### Where People Can Access Your App

Once deployed, **anyone in the world** can access your chatbot at:

**🌍 Your Public Frontend URL:**
```
https://main.xxxxx.amplifyapp.com
```
*(Replace `xxxxx` with your actual Amplify app ID)*

**This is the URL you share with users!** They can:
- ✅ Open it in any web browser (Chrome, Safari, Firefox, etc.)
- ✅ Access it from anywhere (phone, tablet, computer)
- ✅ Use it 24/7 (as long as your AWS services are running)
- ✅ No installation needed - it's a web app!

### How to Share Your App

1. **Get Your Frontend URL**
   - Go to **AWS Amplify Console**
   - Click on your app: `chatbot-frontend`
   - Copy the URL shown at the top (e.g., `https://main.d123abc456.amplifyapp.com`)

2. **Share the URL**
   - **Email**: Send the URL to friends/colleagues
   - **Social Media**: Post it on Twitter, LinkedIn, etc.
   - **Website**: Add it to your portfolio or project page
   - **QR Code**: Generate a QR code for the URL (use https://qr-code-generator.com/)

3. **What Users Will See**
   - Your chatbot interface
   - Login page (they'll need to sign in with Google via Auth0)
   - After login, they can chat with your AI chatbot

### Important Notes

⚠️ **Backend URL is NOT for public access:**
- `http://YOUR_EC2_IP:8000` is your backend API
- **Don't share this URL** - it's only for your frontend to communicate with
- Users should only use the frontend URL (Amplify)

✅ **Your app is automatically public:**
- No special configuration needed
- Anyone with the URL can access it
- They just need to sign in with Google (via Auth0)

🔒 **Security:**
- Users must authenticate via Auth0
- Only people you've configured in Auth0 can sign in (or anyone if you set it up for public access)
- Your backend is protected and only accessible by your frontend

### Setting Up a Custom Domain (Optional)

If you want a custom URL like `https://my-chatbot.com` instead of `https://main.xxxxx.amplifyapp.com`:

1. **Buy a Domain** (from Namecheap, GoDaddy, Route 53, etc.)
2. **In AWS Amplify Console:**
   - Go to your app → **Domain management**
   - Click **"Add domain"**
   - Enter your domain name
   - Follow the DNS configuration steps
3. **Wait for SSL Certificate** (automatic, takes ~30 minutes)
4. **Your app will be available at your custom domain!**

---

## Troubleshooting

### SSH Connection Timeout (Operation Timed Out)

If you get `ssh: connect to host X.X.X.X port 22: Operation timed out`, follow these steps:

1. **Check Instance Status and Status Checks** ⚠️ **CRITICAL!**
   - Go to **EC2 Console** → **Instances**
   - Find your instance (look for IP `3.19.28.193` or check all instances)
   - **Check the "Instance state"**:
     - ✅ Should be **"Running"** (green)
     - ❌ If it's **"Stopped"** → Click **"Start instance"** and wait 1-2 minutes
     - ❌ If it's **"Terminated"** → You need to launch a new instance
   - **Check "Status check"** (very important!):
     - ✅ Should show **"2/2 checks passed"** (green)
     - ⚠️ If it shows **"2/3 checks passed"** or **"1/2 checks passed"**:
       - Click on the **"Status checks"** tab (below instance details)
       - See which check is failing:
         - **System status check**: Checks if AWS can reach your instance
         - **Instance status check**: Checks if your instance OS is responding
       - **If System status check is failing**:
         - This means AWS can't reach your instance (network/hardware issue)
         - **Solution**: Stop and start the instance (not reboot!)
         - EC2 Console → Select instance → **Instance state** → **Stop instance**
         - Wait 1-2 minutes → **Instance state** → **Start instance**
         - Wait 2-3 minutes for status checks to pass
       - **If Instance status check is failing**:
         - This means the OS inside your instance isn't responding
         - Could be: instance stuck, OS crashed, or resource exhaustion
         - **Solution**: Try rebooting first, then stop/start if needed
         - EC2 Console → Select instance → **Instance state** → **Reboot instance**
         - Wait 2-3 minutes
         - If still failing → **Stop instance** → Wait → **Start instance**
       - **Wait for all checks to pass** before trying SSH again!

2. **Check Public IP Address**
   - **Important**: EC2 instances get a NEW public IP every time they restart (unless you have an Elastic IP)
   - In EC2 Console → Select your instance → Check **"Public IPv4 address"**
   - If it's different from `3.19.28.193`, use the NEW IP address:
     ```bash
     ssh -i chatbot-key.pem ubuntu@NEW_IP_ADDRESS
     ```

3. **Check Security Group Rules** (Most Common Fix!)
   - EC2 Console → Select your instance → Click **"Security"** tab
   - Click on the security group name (e.g., `chatbot-backend-sg`)
   - Click **"Edit inbound rules"**
   - **Check SSH rule (port 22)**:
     - Should have **Type**: SSH
     - **Port**: 22
     - **Source**: Should be either:
       - `My IP` (your current IP address) - **This changes if your IP changed!**
       - `0.0.0.0/0` (allows from anywhere - less secure but works)
   - **If your IP changed**:
     - Click **"Add rule"** → Type: SSH → Port: 22 → Source: **My IP** → **Save rules**
     - Or change existing rule to `0.0.0.0/0` (temporarily, for testing)

4. **Get Your Current IP Address**
   - Visit: https://whatismyipaddress.com/
   - Copy your IP address
   - Make sure this IP is in your security group's SSH rule

5. **Check Network ACLs** (Less Common)
   - EC2 Console → **VPC** → **Network ACLs**
   - Find the ACL for your instance's subnet
   - Make sure inbound rules allow SSH (port 22) from your IP

6. **Try Elastic IP** (Prevents IP Changes)
   - EC2 Console → **Elastic IPs** → **Allocate Elastic IP address**
   - Click **"Allocate"**
   - Select the Elastic IP → **Actions** → **Associate Elastic IP address**
   - Select your instance → **Associate**
   - Now your IP won't change when you restart!

7. **Verify Key Pair Permissions** (Mac/Linux)
   ```bash
   chmod 400 ~/Downloads/chatbot-key.pem
   ```

8. **Test Connection with Verbose Output**
   ```bash
   ssh -v -i chatbot-key.pem ubuntu@3.19.28.193
   ```
   This shows detailed connection info to help diagnose the issue.

**Quick Fix Checklist:**
- ✅ Instance is "Running"
- ✅ **Status checks show "2/2 checks passed"** (if not, see step 1 above!)
- ✅ Using correct Public IP (check in console)
- ✅ Security group allows SSH from your current IP
- ✅ Key file has correct permissions (chmod 400)

### Backend Not Accessible

1. **Check Security Group**
   - EC2 Console → Instances → Select instance → Security tab
   - Make sure port 8000 is open to 0.0.0.0/0

2. **Check PM2 Status**
   ```bash
   pm2 status
   pm2 logs chatbot
   ```

3. **Check if Port is Listening**
   ```bash
   sudo netstat -tlnp | grep 8000
   ```

### Frontend Build Fails

1. **Check Build Logs**
   - Amplify Console → Deployments → Click failed deployment → View logs

2. **Common Issues**:
   - Missing environment variables
   - Wrong build directory
   - npm install fails

### Auth0 Not Working

1. **Check Callback URLs** match exactly
2. **Check Environment Variables** in Amplify
3. **Check Browser Console** for errors (F12)

### Database Issues

1. **Reinitialize Database**
   ```bash
   cd ~/chatbot
   source venv/bin/activate
   python initialize_db.py
   ```

---

## Cost Monitoring

### Set Up Billing Alerts

1. **AWS Console** → Search "Billing"
2. **Billing Preferences** → **"Receive Billing Alerts"**
3. **CloudWatch** → **"Alarms"** → **"Create alarm"**
4. Set threshold: $1.00
5. Get email notifications

**Free Tier Limits:**
- EC2: 750 hours/month (t2.micro)
- Amplify: 5GB storage, 15GB transfer/month
- **You won't be charged if you stay within free tier!**

---

## Summary

**What You've Deployed:**
- ✅ **Frontend (Public URL)**: `https://main.xxxxx.amplifyapp.com` 
  - **🌍 This is what you share with users!** Anyone can access your chatbot here.
- ✅ Backend (API): `http://YOUR_EC2_IP:8000` 
  - *Internal use only - don't share this URL*
- ✅ Database: SQLite on EC2
- ✅ Vector DB: ChromaDB on EC2

**Total Cost: $0/month** (Free tier for 12 months)

**How People Access Your App:**
1. Share your frontend URL: `https://main.xxxxx.amplifyapp.com`
2. Users open it in their browser
3. They sign in with Google (via Auth0)
4. They can chat with your AI chatbot!

**Next Steps:**
- Share your frontend URL with users
- Monitor your app usage
- Set up custom domain (optional - see Part 6)
- Set up automated backups
- Scale if needed

---

## Quick Reference

**🌍 Public URL (Share this with users)**: `https://main.xxxxx.amplifyapp.com`  
**EC2 Public IP**: `YOUR_PUBLIC_IP`  
**Backend URL** (Internal only): `http://YOUR_PUBLIC_IP:8000`

**Connect to EC2:**
```bash
ssh -i chatbot-key.pem ubuntu@YOUR_PUBLIC_IP
```

**Restart Backend:**
```bash
pm2 restart chatbot
```

**View Backend Logs:**
```bash
pm2 logs chatbot
```

---

**🎉 Congratulations! Your chatbot is now live on AWS!**

