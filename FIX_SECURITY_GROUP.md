# Fix Security Group - SSH Connection Timeout

Your SSH is hanging at "Connecting to..." which means the security group is blocking port 22.

## Quick Fix (2 minutes)

### Step 1: Open EC2 Console
1. Go to: https://console.aws.amazon.com/ec2
2. Make sure you're in the correct region (top right)
3. Click **"Instances"** in the left sidebar

### Step 2: Select Your Instance
1. Find the instance with IP `3.19.28.193`
2. **Click on the instance** (select the row)
3. Look at the bottom panel

### Step 3: Open Security Tab
1. Click **"Security"** tab (bottom panel)
2. You'll see "Security groups" section
3. **Click on the security group name** (it's a blue clickable link)
   - Example: `sg-xxxxxxxxx (chatbot-backend-sg)`

### Step 4: Edit Inbound Rules
1. Click **"Inbound rules"** tab
2. Click **"Edit inbound rules"** button

### Step 5: Add SSH Rule
1. Click **"Add rule"** button
2. Configure the new rule:
   - **Type**: Select **"SSH"** from dropdown
   - **Protocol**: Should auto-fill as **TCP**
   - **Port range**: Should auto-fill as **22**
   - **Source**: 
     - **Option 1** (Recommended for testing): Select **"Anywhere-IPv4"**
       - This sets it to `0.0.0.0/0`
     - **Option 2** (More secure): Select **"My IP"**
       - This auto-fills your current IP
   - **Description**: `Allow SSH access`

3. Click **"Save rules"** button

### Step 6: Try Connecting Again
Wait 10-20 seconds for the security group to update, then try:

```bash
ssh -i ~/Downloads/chatbot-key.pem ubuntu@3.19.28.193
```

---

## Visual Guide

```
EC2 Console
    │
    ├─► Instances (left sidebar)
    │     │
    │     └─► Click your instance
    │           │
    │           └─► Security tab (bottom)
    │                 │
    │                 └─► Click security group name
    │                       │
    │                       └─► Inbound rules tab
    │                             │
    │                             └─► Edit inbound rules
    │                                   │
    │                                   └─► Add rule
    │                                         │
    │                                         └─► Type: SSH
    │                                               Port: 22
    │                                               Source: Anywhere-IPv4
    │                                               Save
```

---

## What You Should See

**Before (Missing Rule):**
```
Inbound rules:
(empty or no SSH rule)
```

**After (Correct):**
```
Inbound rules:
Type        Protocol    Port Range    Source              Description
SSH         TCP         22            0.0.0.0/0          Allow SSH access
```

---

## Still Not Working?

### Check 1: Instance Status
- EC2 Console → Instances
- Check **"Instance state"** column
- Must be **"Running"** (green)
- If "Stopped", click Actions → Start instance

### Check 2: IP Address
- EC2 Console → Instances
- Check **"Public IPv4 address"** column
- Make sure it's still `3.19.28.193`
- If it changed, use the new IP

### Check 3: Try EC2 Instance Connect
If SSH still doesn't work, use browser-based terminal:

1. EC2 Console → Select instance
2. Click **"Connect"** button (top right)
3. Choose **"EC2 Instance Connect"** tab
4. Click **"Connect"**
5. Opens terminal in browser (no SSH needed!)

---

## Security Note

**Anywhere-IPv4 (0.0.0.0/0)** allows SSH from anywhere. This is fine for:
- Testing/development
- Learning purposes
- Free tier instances

For production, use **"My IP"** for better security.

---

## Success!

Once the security group is fixed, you should see:

```
Welcome to Ubuntu 22.04.3 LTS...
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

Then you can continue with the deployment guide!

