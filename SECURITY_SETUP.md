# 🔒 SECURITY: Setting Up Environment Variables

## ⚠️ CRITICAL: Your Password Has Been Secured!

Your new password `***REMOVED***` has been:
- ✅ Added to `.env` file (for local development)
- ✅ `.env` is in `.gitignore` (won't be committed)
- ✅ Removed from db.js (no longer hardcoded)

## 🚨 IMPORTANT: Set Environment Variables in Vercel

Your password is now secure locally, but you MUST set it in Vercel for production:

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your backend project (repawsitory-backend or whatever you named it)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add These Variables

Add each of these (click "Add" for each one):

**Variable 1:**
- Name: `MONGODB_URI`
- Value: `mongodb+srv://mattfuentes_db_user:***REMOVED***@repawsitory0.fbqvhjj.mongodb.net/?appName=rePawsitory0`
- Environment: Select all (Production, Preview, Development)

**Variable 2:**
- Name: `MONGODB_PASSWORD`
- Value: `***REMOVED***`
- Environment: Select all (Production, Preview, Development)

**Variable 3 (Recommended):**
- Name: `JWT_SECRET`
- Value: `your-random-secret-key-make-it-long-and-random-123456`
- Environment: Select all (Production, Preview, Development)

### Step 3: Redeploy
After adding environment variables, redeploy your backend:
```bash
cd pet-health-backend
vercel --prod
```

Or in Vercel Dashboard:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

## 🛡️ Security Improvements Made

### 1. ✅ Password Removed from Code
**Before:**
```javascript
const MONGO_URI = 'mongodb+srv://user:PLAINTEXT_PASSWORD@host...';
```

**After:**
```javascript
const MONGO_URI = process.env.MONGODB_URI || 
  `mongodb+srv://user:${process.env.MONGODB_PASSWORD}@host...`;
```

### 2. ✅ .env File Protected
- Created `.env` file with your credentials (LOCAL ONLY)
- Updated `.gitignore` to NEVER commit `.env` files
- Created `.env.example` as a template (safe to commit)

### 3. ✅ JWT Secret Now Configurable
- Changed from hardcoded to environment variable
- More secure for production

### 4. ✅ Dotenv Package Added
- Installed for local development
- Only loads in development (not production)
- Vercel injects env vars directly in production

## 📋 Quick Checklist

Before deploying, verify:

- [ ] Environment variables added in Vercel Dashboard
- [ ] `.env` file is in `.gitignore` (already done)
- [ ] No passwords visible in git history (we'll clean this next if needed)
- [ ] Test locally: `node server.js` (should connect to MongoDB)
- [ ] Redeploy to Vercel after setting env vars

## 🔄 Testing Locally

Your `.env` file is already set up with the new password. Test it:

```bash
cd pet-health-backend
node server.js
```

Should see: `✅ Connected to MongoDB`

## 🧹 Cleaning Git History (Optional but Recommended)

Your old password is still in git history. To remove it completely:

### Option 1: Simple (Create New Commit)
Just commit these changes. The old password will be in history but the new one is safe:
```bash
git add .
git commit -m "Security: Move credentials to environment variables"
git push origin main
```

### Option 2: Advanced (Clean History)
If you want to completely remove the old password from git history:

**⚠️ WARNING: This rewrites history. Only do if you're the sole developer or coordinate with your team!**

```bash
# Create a backup first!
git branch backup-before-cleanup

# Use BFG Repo Cleaner or git filter-branch
# This is advanced - only do if you understand git history rewriting
```

For most cases, **Option 1 is fine** - the old password is already changed in MongoDB, so it's useless even if someone finds it in git history.

## 🔐 Best Practices Going Forward

### DO ✅
- Always use environment variables for secrets
- Keep `.env` file in `.gitignore`
- Use different passwords for dev/staging/prod
- Rotate passwords periodically
- Use strong, random passwords

### DON'T ❌
- Never hardcode passwords in source code
- Never commit `.env` files
- Never share passwords in chat/email (use password managers)
- Never use simple/guessable passwords

## 📱 Testing the Deployment

After setting env vars in Vercel and redeploying:

1. **Test backend connection:**
   ```bash
   curl https://your-backend.vercel.app/health
   ```

2. **Check Vercel logs:**
   - Vercel Dashboard → Your Project → Deployments → Latest → Function Logs
   - Should see: `✅ Connected to MongoDB` or `✅ Using cached MongoDB connection`

3. **Test login from frontend:**
   - Should work without any changes to frontend code

## 🆘 Troubleshooting

### "MongoDB connection error" in Vercel logs
- Double-check environment variables are set correctly in Vercel
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding env vars

### Still seeing old password somewhere
- Check you committed and pushed the changes
- Check `.gitignore` includes `.env`
- Run `git status` - `.env` should NOT appear in the list

### Local development not working
- Make sure `.env` file exists in `pet-health-backend/` directory
- Check the password in `.env` is correct
- Run `npm install` to ensure dotenv is installed

## 🎯 Summary

Your credentials are now secure! Here's what changed:

| Before | After |
|--------|-------|
| ❌ Password hardcoded in db.js | ✅ Using environment variables |
| ❌ Password in git commits | ✅ .env file ignored by git |
| ❌ Anyone can see password | ✅ Only in .env (not committed) |
| ❌ Same password in code and prod | ✅ Different configs per environment |

**Next steps:**
1. Set environment variables in Vercel (see Step 1-2 above)
2. Redeploy your backend
3. Test everything works
4. Never commit the `.env` file!

Your new password is safe! 🎉🔒
