# AWS Quick Start - 10 Minutes

## Fastest AWS Deployment

### Step 1: Launch EC2 Instance (3 min)

1. **AWS Console** → EC2 → Launch Instance
2. **Settings**:
   - Name: `chatbot-backend`
   - AMI: Ubuntu 22.04 LTS
   - Instance: t2.micro (Free tier)
   - Key pair: Create new
   - Security Group: Add rule → Custom TCP → Port 8000 → Source: 0.0.0.0/0
3. **Launch** → Download .pem file

### Step 2: Connect & Setup (5 min)

```bash
# Connect
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Run setup script
curl -sSL https://raw.githubusercontent.com/YOUR_REPO/main/ec2-setup.sh | bash

# Or manually:
sudo apt update && sudo apt install -y python3.11 python3-pip git gcc g++ build-essential
sudo npm install -g pm2
git clone YOUR_REPO_URL
cd YOUR_REPO
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 3: Configure (2 min)

```bash
# Create .env
nano .env
# Add all environment variables

# Initialize database
python initialize_db.py

# Start with PM2
pm2 start "venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name chatbot
pm2 save
pm2 startup
```

### Step 4: Deploy Frontend on Amplify (5 min)

1. **AWS Console** → Amplify → New app → Host web app
2. **Connect GitHub** → Select repo
3. **Build settings**: Use provided `amplify.yml`
4. **Environment variables**: Add all Auth0 vars + `BACKEND_URL=http://YOUR_EC2_IP:8000`
5. **Deploy** → Wait 5 minutes

### Step 5: Update Auth0

- Callback: `https://main.xxxxx.amplifyapp.com/api/auth/callback`
- Logout: `https://main.xxxxx.amplifyapp.com`
- Web Origins: `https://main.xxxxx.amplifyapp.com`

**Done!** 🎉

Your app:
- Frontend: `https://main.xxxxx.amplifyapp.com`
- Backend: `http://YOUR_EC2_IP:8000`

---

## Cost: $0/month (Free tier for 12 months)

- EC2: 750 hours/month free
- Amplify: 5GB storage, 15GB transfer free
- Total: **FREE** ✅

