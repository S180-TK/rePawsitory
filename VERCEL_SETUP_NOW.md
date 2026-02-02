# 🚀 VERCEL SETUP - Final Steps

## ✅ What We Just Did

1. **Cleaned git history** - All old passwords (RVOCW6b97JJt5ipw, WbMxrXce2IZWjffs, 90LHSMLavN1l1KaA) are GONE
2. **Force pushed** clean history to GitHub
3. **Updated local .env** with new password: `kYAk9tZpPOLdPa0x`

## 🔧 VERCEL Environment Variables Setup

Go to your Vercel project dashboard and set these **EXACT** environment variables:

### Backend Environment Variables

```
MONGODB_URI=mongodb+srv://mattfuentes_db_user:kYAk9tZpPOLdPa0x@repawsitory0.fbqvhjj.mongodb.net/?appName=rePawsitory0
MONGODB_PASSWORD=kYAk9tZpPOLdPa0x
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=production
```

### Important Notes:

1. **Set for Production environment** in Vercel
2. After setting variables, **Redeploy** your backend
3. Do NOT commit .env file (it's already in .gitignore)

## 🎯 Quick Vercel Setup Commands

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/dashboard
2. Select your backend project
3. Settings → Environment Variables
4. Add each variable above
5. Save and Redeploy

### Option 2: Via Vercel CLI
```bash
cd pet-health-backend
vercel env add MONGODB_URI production
# Enter: mongodb+srv://mattfuentes_db_user:kYAk9tZpPOLdPa0x@repawsitory0.fbqvhjj.mongodb.net/?appName=rePawsitory0

vercel env add MONGODB_PASSWORD production
# Enter: kYAk9tZpPOLdPa0x

vercel env add JWT_SECRET production
# Enter: your-secret-key-change-this-in-production

vercel env add NODE_ENV production
# Enter: production

vercel --prod
```

## 🔒 Final Security Step (IMPORTANT!)

To completely purge old commits from GitHub's cache:

1. Go to: https://github.com/S180-TK/rePawsitory/settings
2. Scroll to "Danger Zone"
3. Click "Change repository visibility" → Make it **Private**
4. Wait 10 seconds
5. Click "Change repository visibility" → Make it **Public** again

This forces GitHub to purge cached data.

## ✅ Verification Checklist

- [ ] Vercel environment variables set
- [ ] Backend redeployed on Vercel
- [ ] Backend health check passes: https://your-backend.vercel.app/health
- [ ] Frontend can connect to backend
- [ ] MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0)
- [ ] GitHub repo visibility toggled to purge cache

## 🎉 You're Done!

Your passwords are secure, history is clean, and you're ready to deploy to Vercel!
