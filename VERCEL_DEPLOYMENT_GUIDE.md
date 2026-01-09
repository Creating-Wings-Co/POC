# Vercel Deployment Guide for Creating Wings Frontend

This guide will help you deploy your React frontend to Vercel and connect it to your AWS backend.

## Architecture Overview

```
User → Vercel Frontend → Auth0 Authentication → AWS Backend (ALB)
```

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
2. **GitHub Repository**: Your code should be in GitHub (already done)
3. **AWS Backend**: Your backend should be running on AWS ALB (already done)
4. **Auth0 Application**: Your Auth0 app should be configured (already done)

## Step 1: Prepare Your Frontend

Your frontend is already set up correctly! The `vercel.json` file has been created for proper routing.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub (recommended for easy integration)

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `Creating-Wings-Co/POC`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Create React App (auto-detected)
   - **Root Directory**: `frontend` (IMPORTANT!)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `build` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   REACT_APP_AUTH0_DOMAIN=dev-tjw54sc82n0it8fg.us.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=W0rf1AA3vvHANaH74KD2UvNhXDN4axSL
   REACT_APP_AUTH0_AUDIENCE=https://chatbot/
   REACT_APP_FASTAPI_URL=http://chatbot-backend-alb-43165662.us-east-2.elb.amazonaws.com
   ```
   
   **Note**: Replace `REACT_APP_FASTAPI_URL` with your actual ALB DNS name.
   
   **Important**: If your backend uses HTTPS, use `https://` instead of `http://`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-2 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: `creating-wings-frontend` (or your choice)
   - Directory: `./` (current directory)
   - Override settings? **No**

5. **Set Environment Variables**
   ```bash
   vercel env add REACT_APP_AUTH0_DOMAIN
   vercel env add REACT_APP_AUTH0_CLIENT_ID
   vercel env add REACT_APP_AUTH0_AUDIENCE
   vercel env add REACT_APP_FASTAPI_URL
   ```
   
   Enter values when prompted.

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Update Auth0 Callback URLs

After deployment, Vercel will give you a URL like:
- `https://your-app-name.vercel.app`

1. **Go to Auth0 Dashboard**
   - Visit [manage.auth0.com](https://manage.auth0.com)
   - Go to Applications → Your Application

2. **Update Allowed Callback URLs**
   Add your Vercel URL:
   ```
   https://your-app-name.vercel.app/callback,http://localhost:3000/callback
   ```

3. **Update Allowed Logout URLs**
   Add:
   ```
   https://your-app-name.vercel.app,http://localhost:3000
   ```

4. **Update Allowed Web Origins**
   Add:
   ```
   https://your-app-name.vercel.app
   ```

5. **Save Changes**

## Step 4: Update Environment Variables in Vercel

If you need to update environment variables later:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `REACT_APP_FASTAPI_URL` with your backend URL
3. Redeploy (Vercel will auto-redeploy on next push, or click "Redeploy")

## Step 5: Test the Flow

1. **Visit Your Vercel URL**
   - Example: `https://your-app-name.vercel.app`

2. **Test Registration Flow**
   - Click "Register"
   - Fill in registration form
   - Click "Continue with Google"
   - Complete Auth0 authentication
   - Should redirect to backend chatbot

3. **Test Login Flow**
   - Click "Sign In"
   - Click "Continue with Google"
   - Complete Auth0 authentication
   - Should redirect to backend chatbot

## Troubleshooting

### Issue: "Callback URL mismatch"
**Solution**: Make sure your Vercel URL is added to Auth0's Allowed Callback URLs exactly as shown (with `/callback`)

### Issue: "Mixed Content Error" (HTTPS frontend → HTTP backend)
**Solution**: Set up HTTPS on your ALB. See `ALB_HTTPS_SETUP.md` for instructions.

### Issue: Frontend shows blank page
**Solution**: 
- Check browser console for errors
- Verify environment variables are set correctly
- Check Vercel build logs for errors

### Issue: Redirect loop after authentication
**Solution**:
- Verify `REACT_APP_FASTAPI_URL` is correct
- Check that backend is accessible from internet
- Verify Auth0 callback URL matches exactly

### Issue: Build fails on Vercel
**Solution**:
- Check that "Root Directory" is set to `frontend`
- Verify `package.json` exists in `frontend/` directory
- Check build logs for specific errors

## Custom Domain (Optional)

If you want to use a custom domain:

1. **In Vercel Dashboard**
   - Go to Project → Settings → Domains
   - Add your domain (e.g., `app.creatingwings.org`)

2. **Update DNS**
   - Add CNAME record pointing to Vercel
   - Vercel will provide the exact CNAME value

3. **Update Auth0**
   - Add new domain to Allowed Callback URLs
   - Add to Allowed Logout URLs
   - Add to Allowed Web Origins

## Benefits of Vercel vs AWS Amplify

✅ **Faster deployments** (usually < 1 minute)
✅ **Better developer experience** (automatic preview deployments)
✅ **Free tier** includes more features
✅ **Better React support** (built by Next.js team)
✅ **Automatic HTTPS** (no certificate setup needed)
✅ **Global CDN** (faster loading worldwide)
✅ **Easy environment variable management**

## Next Steps

1. Deploy to Vercel using steps above
2. Update Auth0 callback URLs
3. Test the complete flow
4. (Optional) Set up custom domain
5. (Optional) Set up HTTPS on ALB for secure backend communication

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Verify Auth0 configuration matches Vercel URL

