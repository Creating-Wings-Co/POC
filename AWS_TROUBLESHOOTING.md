# AWS Deployment Troubleshooting Guide

Common issues and solutions when deploying on AWS.

---

## 🔴 Backend Issues

### Issue: Can't Connect to EC2 via SSH

**Symptoms:**
- `Connection timeout` or `Connection refused`
- `Permission denied (publickey)`

**Solutions:**

1. **Check Security Group**
   ```bash
   # In AWS Console → EC2 → Instances → Your instance → Security tab
   # Make sure you have:
   - SSH (22) from Your IP
   ```

2. **Check Key File Permissions** (Mac/Linux)
   ```bash
   chmod 400 chatbot-key.pem
   ```

3. **Verify IP Address**
   - EC2 Console → Instances → Check "Public IPv4 address"
   - Make sure you're using the correct IP

4. **Check Instance Status**
   - Status should be "Running"
   - If "Stopped", click "Start instance"

5. **Try Different SSH Method**
   ```bash
   # Add verbose output to see what's wrong
   ssh -v -i chatbot-key.pem ubuntu@YOUR_IP
   ```

---

### Issue: Backend Not Accessible (Port 8000)

**Symptoms:**
- Can't access `http://IP:8000`
- Connection timeout
- "This site can't be reached"

**Solutions:**

1. **Check Security Group**
   ```bash
   # EC2 Console → Security Groups
   # Add inbound rule:
   - Type: Custom TCP
   - Port: 8000
   - Source: 0.0.0.0/0
   ```

2. **Check if Application is Running**
   ```bash
   ssh -i key.pem ubuntu@IP
   pm2 status
   # Should show "chatbot" as "online"
   ```

3. **Check if Port is Listening**
   ```bash
   sudo netstat -tlnp | grep 8000
   # Should show something like: 0.0.0.0:8000
   ```

4. **Check Firewall**
   ```bash
   sudo ufw status
   # If active, allow port 8000:
   sudo ufw allow 8000
   ```

5. **Restart Application**
   ```bash
   pm2 restart chatbot
   pm2 logs chatbot
   ```

6. **Check Application Logs**
   ```bash
   pm2 logs chatbot --lines 50
   # Look for errors
   ```

---

### Issue: PM2 Not Starting Application

**Symptoms:**
- `pm2 status` shows "errored" or "stopped"
- Application keeps crashing

**Solutions:**

1. **Check PM2 Logs**
   ```bash
   pm2 logs chatbot --err
   # Look for Python errors
   ```

2. **Check Virtual Environment**
   ```bash
   # Make sure venv is activated in PM2 command
   pm2 delete chatbot
   pm2 start "venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name chatbot
   ```

3. **Check Dependencies**
   ```bash
   source venv/bin/activate
   pip list
   # Make sure all packages are installed
   ```

4. **Check Environment Variables**
   ```bash
   cat .env
   # Make sure all required vars are set
   ```

5. **Test Manually**
   ```bash
   source venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000
   # If this works, PM2 should work too
   ```

---

### Issue: Database Errors

**Symptoms:**
- `Database not found` errors
- `Permission denied` on database file

**Solutions:**

1. **Check Database Path**
   ```bash
   cat .env | grep DATABASE_PATH
   # Should point to correct location
   ```

2. **Check Permissions**
   ```bash
   ls -la chatbot.db
   # Should be readable/writable
   chmod 644 chatbot.db
   ```

3. **Reinitialize Database**
   ```bash
   source venv/bin/activate
   python initialize_db.py
   ```

4. **Check Directory Exists**
   ```bash
   mkdir -p vector_db DATABSE
   ```

---

### Issue: Vector Database Empty

**Symptoms:**
- No search results
- "No documents found"

**Solutions:**

1. **Check if Database Initialized**
   ```bash
   source venv/bin/activate
   python initialize_db.py
   ```

2. **Check DATABSE Folder**
   ```bash
   ls -la DATABSE/
   # Should show your PDF/DOCX files
   ```

3. **Check Vector DB Path**
   ```bash
   ls -la vector_db/
   # Should contain chroma.sqlite3
   ```

4. **Re-run Initialization**
   ```bash
   # Delete old vector DB
   rm -rf vector_db/*
   # Reinitialize
   python initialize_db.py
   ```

---

## 🟡 Frontend Issues

### Issue: Amplify Build Fails

**Symptoms:**
- Build status shows "Failed"
- Error in build logs

**Solutions:**

1. **Check Build Logs**
   - Amplify Console → Your app → Deployments → Click failed build → View logs
   - Look for specific error messages

2. **Common Errors:**

   **"npm install" fails:**
   ```yaml
   # Check amplify.yml
   # Make sure you're in the right directory:
   preBuild:
     commands:
       - cd auth0-nextjs
       - npm install
   ```

   **"Module not found":**
   - Check if all dependencies are in package.json
   - Make sure node_modules is in .gitignore

   **"Build directory not found":**
   ```yaml
   # Check amplify.yml artifacts:
   artifacts:
     baseDirectory: auth0-nextjs/.next
   ```

3. **Check Environment Variables**
   - Amplify Console → Environment variables
   - Make sure all required vars are set

4. **Clear Cache and Rebuild**
   - Amplify Console → App settings → Build settings
   - Click "Clear cache and deploy"

---

### Issue: Frontend Can't Connect to Backend

**Symptoms:**
- "Network error" in browser console
- CORS errors
- 404 errors on API calls

**Solutions:**

1. **Check BACKEND_URL**
   - Amplify Console → Environment variables
   - `BACKEND_URL` should be: `http://YOUR_EC2_IP:8000`
   - Make sure it's correct (no trailing slash)

2. **Check CORS Settings**
   ```python
   # In main.py, make sure CORS allows your Amplify domain:
   allow_origins=["*"]  # Or specific domain
   ```

3. **Check Backend is Running**
   ```bash
   # Test backend directly:
   curl http://YOUR_EC2_IP:8000/api/health
   ```

4. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check Network tab for failed requests
   - Look at error messages

---

### Issue: Auth0 Login Not Working

**Symptoms:**
- Login button doesn't work
- "Invalid callback URL" error
- Redirect loops

**Solutions:**

1. **Check Auth0 Settings**
   - Auth0 Dashboard → Applications → Your app
   - **Allowed Callback URLs** must include:
     ```
     https://main.xxxxx.amplifyapp.com/api/auth/callback
     ```

2. **Check Environment Variables**
   - Amplify Console → Environment variables
   - Verify:
     - `AUTH0_ISSUER_BASE_URL`
     - `AUTH0_CLIENT_ID`
     - `AUTH0_CLIENT_SECRET`
     - `AUTH0_BASE_URL` (must match Amplify URL)

3. **Check AUTH0_SECRET**
   - Must be 32+ characters
   - Generate new one if needed:
     ```bash
     openssl rand -hex 32
     ```

4. **Clear Browser Cache**
   - Clear cookies and cache
   - Try incognito/private window

5. **Check Browser Console**
   - Look for JavaScript errors
   - Check Network tab for failed requests

---

## 🟢 General Issues

### Issue: High AWS Costs

**Symptoms:**
- Unexpected charges on AWS bill

**Solutions:**

1. **Check Billing Dashboard**
   - AWS Console → Billing → Cost Explorer
   - See what's being charged

2. **Common Causes:**
   - EC2 instance running 24/7 (after free tier)
   - Data transfer over free tier limits
   - Using non-free tier services

3. **Set Up Billing Alerts**
   - CloudWatch → Billing → Create alarm
   - Set threshold: $1.00
   - Get email notifications

4. **Stop Instance When Not Using**
   ```bash
   # EC2 Console → Instances → Select → Stop
   # This stops charges (but IP will change)
   ```

---

### Issue: Lost SSH Key

**Symptoms:**
- Can't connect to EC2
- Lost .pem file

**Solutions:**

1. **Create New Key Pair**
   - EC2 Console → Key Pairs → Create key pair
   - Download new .pem file

2. **Add New Key to Instance**
   - EC2 Console → Instances → Select instance
   - Actions → Security → Modify IAM role
   - Or: Stop instance → Change key pair → Start

3. **Alternative: Use Session Manager**
   - EC2 Console → Instances → Connect
   - Use "Session Manager" (no key needed)
   - Requires IAM role setup

---

### Issue: Instance Stopped Unexpectedly

**Symptoms:**
- EC2 instance shows "Stopped"
- Can't access backend

**Solutions:**

1. **Check Why It Stopped**
   - EC2 Console → Instances → Select → Status checks
   - Look for error messages

2. **Common Causes:**
   - Reached free tier limit (750 hours)
   - Manual stop
   - System failure

3. **Start Instance**
   - EC2 Console → Instances → Select → Start
   - Wait 1-2 minutes
   - **Note**: Public IP will change!

4. **Update Frontend URL**
   - Get new IP address
   - Update Amplify environment variable: `BACKEND_URL`
   - Redeploy frontend

---

## 🔵 Performance Issues

### Issue: Slow Response Times

**Symptoms:**
- Chat responses take too long
- Timeout errors

**Solutions:**

1. **Check EC2 Instance Type**
   - t2.micro is limited (1 vCPU, 1GB RAM)
   - Consider upgrading to t3.small (costs money)

2. **Check PM2 Logs**
   ```bash
   pm2 logs chatbot
   # Look for slow queries or errors
   ```

3. **Optimize Database**
   ```bash
   # Check database size
   ls -lh chatbot.db
   # If very large, consider cleanup
   ```

4. **Check Network**
   - Test backend directly: `curl http://IP:8000/api/health`
   - If slow, might be network issue

---

## 📞 Getting Help

### AWS Support

1. **AWS Documentation**
   - https://docs.aws.amazon.com

2. **AWS Forums**
   - https://forums.aws.amazon.com

3. **AWS Support** (Free tier includes basic support)
   - AWS Console → Support Center

### Check Logs

**Backend Logs:**
```bash
pm2 logs chatbot --lines 100
```

**Frontend Logs:**
- Amplify Console → Deployments → Click deployment → View logs

**System Logs:**
```bash
# On EC2
sudo journalctl -u your-service
# Or
dmesg | tail
```

---

## ✅ Quick Health Check

Run these commands to verify everything:

```bash
# 1. Check EC2 connection
ssh -i key.pem ubuntu@IP

# 2. Check backend status
pm2 status

# 3. Check backend health
curl http://IP:8000/api/health

# 4. Check frontend
curl https://main.xxxxx.amplifyapp.com

# 5. Check database
ls -lh chatbot.db

# 6. Check vector DB
ls -lh vector_db/
```

All should return success! ✅

