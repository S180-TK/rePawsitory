# 🔧 Vercel Environment Variables Setup - Visual Guide

## Step-by-Step Instructions

### Step 1: Access Vercel Dashboard
```
1. Open browser and go to: https://vercel.com
2. Log in to your account
3. You'll see your projects dashboard
```

### Step 2: Select Your Backend Project
```
1. Look for your backend project (e.g., "repawsitory-backend")
2. Click on it to open
```

### Step 3: Navigate to Settings
```
1. At the top of the page, you'll see tabs: Overview, Deployments, Analytics, Settings, etc.
2. Click on "Settings" tab
```

### Step 4: Go to Environment Variables
```
1. On the left sidebar, you'll see: General, Domains, Environment Variables, etc.
2. Click "Environment Variables"
```

### Step 5: Add MONGODB_URI Variable

```
┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Add New                                                     │
│  ┌──────────────────────────────────────────────┐           │
│  │ Name:                                         │           │
│  │ MONGODB_URI                                   │           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │ Value:                                        │           │
│  │ mongodb+srv://mattfuentes_db_user:WbMxrXce...│           │
│  └──────────────────────────────────────────────┘           │
│                                                              │
│  Environment:                                                │
│  ☑ Production   ☑ Preview   ☑ Development                  │
│                                                              │
│  [Save]                                                      │
└─────────────────────────────────────────────────────────────┘
```

**Exact values to enter:**

**Name:** 
```
MONGODB_URI
```

**Value:**
```
mongodb+srv://mattfuentes_db_user:***REMOVED***@repawsitory0.fbqvhjj.mongodb.net/?appName=rePawsitory0
```

**Environment:** Select all three checkboxes
- ✅ Production
- ✅ Preview  
- ✅ Development

Click **Save**

---

### Step 6: Add MONGODB_PASSWORD Variable

Click "Add New" again:

**Name:**
```
MONGODB_PASSWORD
```

**Value:**
```
***REMOVED***
```

**Environment:** Select all three
- ✅ Production
- ✅ Preview
- ✅ Development

Click **Save**

---

### Step 7: Add JWT_SECRET Variable (Recommended)

Click "Add New" again:

**Name:**
```
JWT_SECRET
```

**Value:** (Use a strong random string - here's a suggestion)
```
rePawsitory-jwt-secret-2026-super-secure-random-string-change-this-123456789
```

**Environment:** Select all three
- ✅ Production
- ✅ Preview
- ✅ Development

Click **Save**

---

### Step 8: Verify Variables Are Saved

After saving all three, you should see them listed:

```
┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MONGODB_URI              Production, Preview, Development  │
│  mongodb+srv://...        [Edit] [Delete]                   │
│                                                              │
│  MONGODB_PASSWORD         Production, Preview, Development  │
│  WbMx...                  [Edit] [Delete]                   │
│                                                              │
│  JWT_SECRET               Production, Preview, Development  │
│  reP...                   [Edit] [Delete]                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

✅ All three variables should be visible (values will be partially hidden)

---

### Step 9: Redeploy Your Application

**Option A: Using Vercel Dashboard**
```
1. Click on "Deployments" tab at the top
2. Find your most recent deployment
3. Click the three dots "..." on the right
4. Select "Redeploy"
5. Confirm the redeployment
```

**Option B: Using Vercel CLI** (Recommended)
```bash
cd pet-health-backend
vercel --prod
```

---

### Step 10: Verify Deployment Works

After redeployment completes:

**Test 1: Check the deployment URL**
```bash
curl https://your-backend-project.vercel.app/
```

Should return:
```json
{
  "status": "ok",
  "message": "rePawsitory API Server",
  "timestamp": "2026-02-02T...",
  "endpoints": {...}
}
```

**Test 2: Check health endpoint**
```bash
curl https://your-backend-project.vercel.app/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-02T..."
}
```

**Test 3: Check logs for MongoDB connection**
```
1. Go to Vercel Dashboard
2. Click on your project
3. Click "Deployments" tab
4. Click on the latest deployment
5. Scroll down to "Function Logs"
6. Look for: "✅ Connected to MongoDB" or "✅ Using cached MongoDB connection"
```

---

## 🎯 Quick Reference Card

### Variables to Add:

| Variable Name | Value | Environment |
|--------------|--------|-------------|
| `MONGODB_URI` | `mongodb+srv://mattfuentes_db_user:***REMOVED***@repawsitory0.fbqvhjj.mongodb.net/?appName=rePawsitory0` | All 3 |
| `MONGODB_PASSWORD` | `***REMOVED***` | All 3 |
| `JWT_SECRET` | `[your-random-secret]` | All 3 |

### After Adding:
1. ✅ Save each variable
2. ✅ Verify all three are listed
3. ✅ Redeploy: `vercel --prod`
4. ✅ Test the endpoints
5. ✅ Check function logs

---

## ⚠️ Important Notes

### Security Tips:
- The values will be partially hidden in the dashboard (this is normal)
- To view/edit a variable, click "Edit" next to it
- To delete a variable, click "Delete" (be careful!)
- Variables are encrypted at rest by Vercel

### Environment Selection:
- **Production**: Live site (vercel --prod)
- **Preview**: Pull request/branch deployments
- **Development**: Local development with Vercel CLI
- Select all three unless you have a specific reason not to

### After Adding Variables:
- **MUST REDEPLOY** for changes to take effect
- Existing deployments won't have the new variables
- New deployments will automatically include them

---

## 🐛 Troubleshooting

### "Environment variable not found" error
- Make sure you saved the variable
- Make sure you selected the right environment
- Redeploy after adding variables

### MongoDB connection fails after setting variables
- Double-check the connection string is correct (no typos)
- Make sure password doesn't have special characters that need encoding
- Check MongoDB Atlas network access allows Vercel (0.0.0.0/0)

### Variables not showing up in deployment
- Make sure you redeployed AFTER adding variables
- Old deployments won't have new variables
- Check you're looking at the latest deployment

---

## 📱 Screenshots Guide

### Where to Click:

1. **Dashboard** → Your project name
2. **Settings** (top tab)
3. **Environment Variables** (left sidebar)
4. **Add New** button
5. Fill in Name, Value, select Environments
6. **Save** button
7. Repeat for each variable
8. **Deployments** tab → **Redeploy**

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ Variables are listed in Vercel Dashboard
- ✅ Redeployment completes without errors
- ✅ Backend URL returns API info (not error)
- ✅ Health endpoint returns healthy status
- ✅ Function logs show "Connected to MongoDB"
- ✅ Frontend can connect to backend

---

## 🎉 You're Done!

Once all three variables are set and you've redeployed, your backend will:
- Connect to MongoDB using the new password
- Be secure (no hardcoded credentials)
- Work in production just like locally

**Next:** Update your frontend to use the backend URL and deploy it!

See [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) for complete deployment guide.
