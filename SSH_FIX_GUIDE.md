# Fix SSH Connection Timeout - Step by Step

You're getting: `ssh: connect to host 3.19.28.193 port 22: Operation timed out`

Let's fix this step by step.

---

## Step 1: Check Instance Status

1. **Go to AWS Console**
   - Open: https://console.aws.amazon.com/ec2
   - Click **"Instances"** in left sidebar

2. **Find Your Instance**
   - Look for instance with IP `3.19.28.193`
   - Check the **"Instance state"** column

3. **What to Check:**
   - ✅ Should say **"Running"** (green)
   - ❌ If it says "Stopped" → Click instance → Actions → Start instance
   - ❌ If it says "Pending" → Wait 1-2 minutes

**If instance is stopped:**
- Select instance → Click **"Actions"** → **"Start instance"**
- Wait 2-3 minutes for it to start
- **IMPORTANT**: IP address will change! Get new IP

---

## Step 2: Verify IP Address

1. **Check Current IP**
   - In EC2 Console → Instances
   - Find your instance
   - Look at **"Public IPv4 address"** column
   - **Is it still `3.19.28.193`?**

2. **If IP Changed:**
   - EC2 instances get new IP when stopped/started
   - Copy the NEW IP address
   - Use the new IP in your SSH command

---

## Step 3: Check Security Group (MOST COMMON ISSUE)

This is usually the problem! Let's fix it:

1. **Select Your Instance**
   - Click on the instance name/ID

2. **Go to Security Tab**
   - Click **"Security"** tab (bottom panel)
   - Click on the security group name (blue link)

3. **Check Inbound Rules**
   - Click **"Inbound rules"** tab
   - Look for SSH rule

4. **What Should Be There:**
   ```
   Type: SSH
   Protocol: TCP
   Port: 22
   Source: My IP (or your specific IP)
   ```

5. **If SSH Rule is Missing or Wrong:**

   **Option A: Add SSH Rule**
   - Click **"Edit inbound rules"**
   - Click **"Add rule"**
   - Configure:
     - **Type**: SSH
     - **Protocol**: TCP
     - **Port**: 22
     - **Source**: 
       - Choose **"My IP"** (auto-fills your IP)
       - OR **"Anywhere-IPv4"** (0.0.0.0/0) - less secure but works
   - Click **"Save rules"**

   **Option B: If Rule Exists but Wrong Source**
   - Click **"Edit inbound rules"**
   - Click the edit icon (pencil) on SSH rule
   - Change Source to **"My IP"** or **"Anywhere-IPv4"**
   - Click **"Save rules"**

---

## Step 4: Verify Key File

1. **Check Key File Location**
   ```bash
   # On your Mac, check if file exists
   ls -la ~/Downloads/chatbot-key.pem
   # Or wherever you saved it
   ```

2. **Check Permissions** (Mac/Linux)
   ```bash
   chmod 400 ~/Downloads/chatbot-key.pem
   ```

3. **Verify Key Name Matches**
   - EC2 Console → Instances → Your instance
   - Check **"Key pair name"** column
   - Make sure your `.pem` file matches this name

---

## Step 5: Test Connection Again

1. **Get Correct IP**
   ```bash
   # In EC2 Console, copy the Public IPv4 address
   # It might be different from 3.19.28.193
   ```

2. **Try SSH Again**
   ```bash
   ssh -i ~/Downloads/chatbot-key.pem ubuntu@NEW_IP_ADDRESS
   ```

3. **If Still Failing, Try Verbose Mode**
   ```bash
   ssh -v -i ~/Downloads/chatbot-key.pem ubuntu@NEW_IP_ADDRESS
   ```
   - This shows detailed connection info
   - Look for where it's failing

---

## Step 6: Alternative Connection Methods

### Option A: Use EC2 Instance Connect (No Key Needed!)

1. **In EC2 Console**
   - Select your instance
   - Click **"Connect"** button (top right)

2. **Choose "EC2 Instance Connect"**
   - Click **"Connect"**
   - Opens browser-based terminal
   - No SSH key needed!

### Option B: Use Session Manager (Requires Setup)

1. **Install SSM Plugin** (one-time setup)
   ```bash
   # On Mac
   brew install --cask session-manager-plugin
   ```

2. **Connect via Session Manager**
   - EC2 Console → Instances → Select → Connect
   - Choose "Session Manager" tab
   - Click "Connect"

---

## Step 7: Common Issues & Solutions

### Issue: "Permission denied (publickey)"

**Solution:**
```bash
# Fix key permissions
chmod 400 ~/Downloads/chatbot-key.pem

# Try with explicit key
ssh -i ~/Downloads/chatbot-key.pem ubuntu@IP_ADDRESS

# If still fails, check username:
# Ubuntu: ubuntu
# Amazon Linux: ec2-user
# Debian: admin
```

### Issue: "Connection refused" (not timeout)

**Solution:**
- Instance might be starting up
- Wait 2-3 minutes and try again
- Check instance status is "Running"

### Issue: "Host key verification failed"

**Solution:**
```bash
# Remove old host key
ssh-keygen -R 3.19.28.193

# Try connecting again
```

### Issue: Firewall Blocking

**Solution:**
- Check if you're on a corporate network/firewall
- Try from different network (mobile hotspot)
- Or use EC2 Instance Connect (browser-based)

---

## Quick Diagnostic Commands

Run these to diagnose:

```bash
# 1. Check if you can reach the IP
ping 3.19.28.193

# 2. Check if port 22 is open
nc -zv 3.19.28.193 22

# 3. Try with verbose output
ssh -v -i ~/Downloads/chatbot-key.pem ubuntu@3.19.28.193
```

---

## Most Likely Fix

**90% of the time, it's the Security Group!**

1. Go to EC2 Console → Your instance → Security tab
2. Click security group name
3. Edit inbound rules
4. Add SSH rule: Port 22, Source: Anywhere-IPv4 (0.0.0.0/0)
5. Save rules
6. Try connecting again

---

## Still Not Working?

1. **Double-check:**
   - [ ] Instance is "Running"
   - [ ] Using correct IP address (check EC2 console)
   - [ ] Security group allows SSH (port 22)
   - [ ] Key file permissions correct (chmod 400)
   - [ ] Using correct username (ubuntu for Ubuntu)

2. **Try EC2 Instance Connect:**
   - EC2 Console → Select instance → Connect → EC2 Instance Connect
   - This bypasses SSH completely

3. **Check AWS Status:**
   - https://status.aws.amazon.com
   - Make sure EC2 service is operational

---

## Success Checklist

After fixing, you should be able to:
- [ ] Connect via SSH
- [ ] See Ubuntu welcome message
- [ ] Run commands on the server

Once connected, continue with the deployment guide!

---

## Next Steps After Connecting

Once you're connected, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Continue with setup from AWS_COMPLETE_GUIDE.md
```

Good luck! 🚀

