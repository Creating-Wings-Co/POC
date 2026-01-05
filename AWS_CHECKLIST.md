# AWS Deployment Checklist

Use this checklist to track your progress. Check off each item as you complete it.

## Pre-Deployment
- [ ] AWS account created
- [ ] Credit card added (won't be charged for free tier)
- [ ] GitHub account ready
- [ ] Code pushed to GitHub
- [ ] Google Gemini API key ready
- [ ] Auth0 credentials ready (domain, client ID, secret, audience)

## Part 1: AWS Account Setup
- [ ] AWS account created and verified
- [ ] Signed into AWS Console
- [ ] Selected region (us-east-1 recommended)
- [ ] Billing alerts set up (optional but recommended)

## Part 2: EC2 Backend Setup
- [ ] EC2 instance launched (t2.micro, Ubuntu 22.04)
- [ ] Key pair created and downloaded (.pem file saved safely)
- [ ] Security group configured (SSH + port 8000)
- [ ] Instance is running
- [ ] Public IP address noted
- [ ] Connected to EC2 via SSH
- [ ] System updated (`sudo apt update`)
- [ ] Python 3.11 installed
- [ ] Build tools installed (gcc, g++)
- [ ] Node.js and PM2 installed
- [ ] Repository cloned or code uploaded
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] .env file created with all variables
- [ ] DATABSE folder created
- [ ] Knowledge base files uploaded
- [ ] Database initialized (`python initialize_db.py`)
- [ ] Backend tested locally (`uvicorn main:app`)
- [ ] PM2 configured and backend running
- [ ] Backend accessible at http://YOUR_IP:8000/api/health

## Part 3: Amplify Frontend Setup
- [ ] AWS Amplify console opened
- [ ] New app created
- [ ] GitHub repository connected
- [ ] Build settings configured (amplify.yml)
- [ ] Environment variables added:
  - [ ] AUTH0_SECRET
  - [ ] AUTH0_BASE_URL (update after deployment)
  - [ ] AUTH0_ISSUER_BASE_URL
  - [ ] AUTH0_CLIENT_ID
  - [ ] AUTH0_CLIENT_SECRET
  - [ ] BACKEND_URL (EC2 IP:8000)
- [ ] App deployed successfully
- [ ] Frontend URL noted
- [ ] AUTH0_BASE_URL updated in Amplify
- [ ] Frontend redeployed with correct URL

## Part 4: Auth0 Configuration
- [ ] Auth0 dashboard opened
- [ ] Application settings updated:
  - [ ] Allowed Callback URLs
  - [ ] Allowed Logout URLs
  - [ ] Allowed Web Origins
- [ ] Changes saved

## Part 5: Backend Configuration Update
- [ ] Connected to EC2
- [ ] .env file updated with Amplify URL
- [ ] Backend restarted (`pm2 restart chatbot`)

## Part 6: Testing
- [ ] Backend health check works (http://IP:8000/api/health)
- [ ] Frontend loads (https://amplify-url.amplifyapp.com)
- [ ] Login with Google works
- [ ] Chat functionality works
- [ ] Messages are being saved
- [ ] No errors in browser console
- [ ] Backend logs look good (`pm2 logs chatbot`)

## Post-Deployment
- [ ] Bookmarked AWS Console
- [ ] Bookmarked Amplify URL
- [ ] Saved EC2 connection command
- [ ] Documented all URLs and credentials (securely)
- [ ] Set up billing alerts
- [ ] Tested from different devices/browsers

## Optional Enhancements
- [ ] Custom domain configured
- [ ] SSL certificate set up (HTTPS for backend)
- [ ] Automated backups configured
- [ ] Monitoring set up (CloudWatch)
- [ ] Auto-scaling configured (if needed)

---

## Quick Commands Reference

**Connect to EC2:**
```bash
ssh -i chatbot-key.pem ubuntu@YOUR_PUBLIC_IP
```

**Check Backend Status:**
```bash
pm2 status
pm2 logs chatbot
```

**Restart Backend:**
```bash
pm2 restart chatbot
```

**View Backend Logs:**
```bash
pm2 logs chatbot --lines 100
```

**Update Code on EC2:**
```bash
cd ~/chatbot
git pull
source venv/bin/activate
pm2 restart chatbot
```

---

## Important URLs to Save

- **AWS Console**: https://console.aws.amazon.com
- **EC2 Console**: https://console.aws.amazon.com/ec2
- **Amplify Console**: https://console.aws.amazon.com/amplify
- **Backend URL**: http://YOUR_EC2_IP:8000
- **Frontend URL**: https://main.xxxxx.amplifyapp.com
- **Auth0 Dashboard**: https://manage.auth0.com

---

## Support Resources

- **AWS Documentation**: https://docs.aws.amazon.com
- **EC2 User Guide**: https://docs.aws.amazon.com/ec2
- **Amplify Docs**: https://docs.aws.amazon.com/amplify
- **AWS Support**: Free tier includes basic support

---

**Total Estimated Time**: 1-2 hours  
**Total Cost**: $0/month (Free tier)

