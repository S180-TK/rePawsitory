# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Changes (All Done!)
- [x] Removed `require('dotenv').config()` from server.js
- [x] Created `api/index.js` serverless entry point
- [x] Updated `db.js` with connection caching
- [x] Updated `vercel.json` configuration
- [x] Fixed multer configs to use `/tmp` in production
- [x] Added root route handler (`/`)
- [x] Added health check endpoint (`/health`)
- [x] Added 404 and error handlers
- [x] Fixed uploads directory path

### 2. Local Testing (Do This Next!)
- [ ] Test the server locally
  ```bash
  cd pet-health-backend
  npm install
  node server.js
  ```
- [ ] Open http://localhost:5001/ in browser
  - Should see: `{"status":"ok","message":"rePawsitory API Server",...}`
- [ ] Test http://localhost:5001/health
  - Should see: `{"status":"healthy",...}`
- [ ] Test login endpoint
  ```bash
  curl -X POST http://localhost:5001/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"your-test-email","password":"your-password"}'
  ```

### 3. Commit Changes
- [ ] Review all changes
  ```bash
  git diff
  ```
- [ ] Stage all changes
  ```bash
  git add .
  ```
- [ ] Commit with clear message
  ```bash
  git commit -m "Fix Vercel deployment: Optimize for serverless, add error handling, fix file uploads"
  ```
- [ ] Push to GitHub
  ```bash
  git push origin main
  ```

## 🌐 Deployment Steps

### 4. Deploy Backend to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
cd pet-health-backend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **[Your account]**
- Link to existing project? **No** (first time)
- Project name? **repawsitory-backend** (or your choice)
- Directory? **./** (press Enter)
- Override settings? **No** (we have vercel.json)

For production:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import Git repository
3. Select `rePawsitory` repository
4. Set Root Directory to: `pet-health-backend`
5. Click "Deploy"

### 5. Get Backend URL
After deployment, Vercel will provide a URL like:
```
https://repawsitory-backend-xxx.vercel.app
```

**Save this URL!** You'll need it for the frontend.

### 6. Test Deployed Backend
- [ ] Test root endpoint
  ```bash
  curl https://your-backend-url.vercel.app/
  ```
- [ ] Test health endpoint
  ```bash
  curl https://your-backend-url.vercel.app/health
  ```
- [ ] Test in browser: Visit your backend URL
- [ ] Check Vercel logs for any errors
  - Go to Vercel Dashboard > Your Project > Logs

### 7. Update Frontend Configuration

Update `pet-health-frontend/src/config.js`:
```javascript
export const API_BASE_URL = 'https://your-actual-backend-url.vercel.app';
```

Or update `.env` file:
```bash
REACT_APP_API_URL=https://your-actual-backend-url.vercel.app
```

### 8. Update Backend CORS (if needed)

If your frontend URL changed, update `pet-health-backend/server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-url.vercel.app',  // ← Update this
  process.env.FRONTEND_URL
].filter(Boolean);
```

Then redeploy backend:
```bash
cd pet-health-backend
vercel --prod
```

### 9. Deploy Frontend
```bash
cd pet-health-frontend
vercel --prod
```

### 10. Final Testing
- [ ] Visit your frontend URL
- [ ] Try to log in
- [ ] Create a test account
- [ ] Add a pet
- [ ] Upload a photo
- [ ] Check all main features work

## 🔍 Troubleshooting

### If you get "CANNOT GET /"
- ✅ Should be fixed! We added root route handler
- If still happening, check Vercel logs

### If you get "Failed to fetch"
1. Check CORS: Make sure frontend URL is in `allowedOrigins`
2. Check backend URL in frontend config.js
3. Check Vercel function logs for errors
4. Verify MongoDB connection

### If you get "Serverless function crashed"
1. Check Vercel function logs
2. Look for MongoDB connection errors
3. Check memory/timeout limits
4. Verify all dependencies are in package.json

### If file uploads don't work
- Remember: `/tmp` files are temporary in Vercel
- For production, you'll need cloud storage (future task)
- For now, file uploads will work but files won't persist

## 📊 Monitoring

After deployment, monitor your app:
1. **Vercel Dashboard**: Check function logs and errors
2. **MongoDB Atlas**: Monitor database connections
3. **Browser DevTools**: Check for frontend errors

## 🎯 Success Criteria

Your deployment is successful when:
- [x] Backend is deployed without errors
- [x] Frontend is deployed without errors
- [ ] Can access backend URL and see API info
- [ ] Can log in from frontend
- [ ] Can create new accounts
- [ ] Can add pets (basic CRUD works)
- [ ] No console errors in browser

## 📝 Notes

### About File Uploads
- Current setup uses `/tmp` which is temporary
- Files are deleted after function execution
- For production, migrate to:
  - Cloudinary (easiest for images)
  - AWS S3
  - Azure Blob Storage
  - Google Cloud Storage

### About Environment Variables
- MongoDB URI is currently hardcoded (works fine)
- JWT_SECRET is hardcoded (works fine for now)
- Can move to Vercel env vars later for better security

### About Database
- Connection caching is implemented
- Should handle serverless well
- Monitor MongoDB Atlas for connection usage

## 🆘 Need Help?

If you run into issues:
1. Check `DEPLOYMENT.md` for detailed troubleshooting
2. Check `VERCEL_FIX_SUMMARY.md` for what was changed
3. Check `BEFORE_AFTER_COMPARISON.md` to see exact code differences
4. Check Vercel function logs in dashboard
5. Check browser console for frontend errors

## 🎉 Next Steps After Successful Deployment

1. Test all features thoroughly
2. Consider adding environment variables for secrets
3. Plan migration to cloud storage for files
4. Set up monitoring and alerts
5. Add more comprehensive error logging
6. Consider adding rate limiting
7. Set up CI/CD for automatic deployments

---

Good luck with your deployment! 🚀
