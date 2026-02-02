# Vercel Deployment Guide for rePawsitory Backend

## Overview
This guide explains how to deploy the rePawsitory backend to Vercel.

## Key Changes Made for Vercel Compatibility

### 1. Serverless Function Entry Point
- Created `api/index.js` as the Vercel serverless function entry point
- Ensures database connection is established before handling requests
- Properly exports the Express app for serverless execution

### 2. Database Connection Caching
- Updated `db.js` to cache MongoDB connections between serverless function invocations
- Prevents connection exhaustion and improves performance
- Optimized connection pool settings for serverless environment

### 3. File Upload Configuration
- Modified multer configs to use `/tmp` directory in production (Vercel requirement)
- `/tmp` is the only writable directory in Vercel's serverless environment
- Note: Files in `/tmp` are ephemeral and will be deleted after function execution
  - For production, consider migrating to cloud storage (S3, Cloudinary, etc.)

### 4. Error Handling
- Added comprehensive error handlers in server.js
- Root route (`/`) now returns API info instead of 404
- Health check endpoint at `/health`
- 404 handler for undefined routes
- Global error handler for uncaught errors

### 5. CORS Configuration
- Configured to allow your frontend URLs
- Update `allowedOrigins` in server.js with your actual Vercel frontend URL

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Deploy from Backend Directory
```bash
cd pet-health-backend
vercel
```

### 3. Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time) or Yes (subsequent deploys)
- **What's your project's name?** repawsitory-backend (or your preferred name)
- **In which directory is your code located?** ./ (current directory)
- **Want to override settings?** No (vercel.json is already configured)

### 4. For production deployment:
```bash
vercel --prod
```

## Environment Variables

You may want to add these environment variables in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add:
   - `NODE_ENV` = `production` (already set in vercel.json)
   - `JWT_SECRET` = (your secure JWT secret key)
   - `MONGODB_URI` = (your MongoDB connection string, if you want to use env var instead of hardcoded)

## Frontend Configuration

Update your frontend's `config.js` or `.env` file with the Vercel backend URL:

```javascript
export const API_BASE_URL = 'https://your-backend-project.vercel.app';
```

Or in `.env`:
```
REACT_APP_API_URL=https://your-backend-project.vercel.app
```

## Testing the Deployment

### 1. Test root endpoint:
```bash
curl https://your-backend-project.vercel.app/
```
Should return:
```json
{
  "status": "ok",
  "message": "rePawsitory API Server",
  "timestamp": "...",
  "endpoints": { ... }
}
```

### 2. Test health endpoint:
```bash
curl https://your-backend-project.vercel.app/health
```

### 3. Test login endpoint:
```bash
curl -X POST https://your-backend-project.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'
```

## Common Issues and Solutions

### Issue: "CANNOT GET /"
**Solution:** Make sure you're accessing the correct URL and the root route handler is in place (already fixed in server.js)

### Issue: "Failed to fetch" or "Unexpected end of JSON input"
**Solutions:**
1. Check CORS configuration - ensure your frontend URL is in `allowedOrigins`
2. Verify the API endpoint URL in frontend config.js
3. Check Vercel deployment logs for errors
4. Ensure MongoDB connection is working (check Vercel function logs)

### Issue: "Serverless function crashed"
**Solutions:**
1. Check Vercel function logs in dashboard
2. Verify MongoDB connection string is correct
3. Ensure all dependencies are in package.json
4. Check for memory/timeout issues (adjusted in vercel.json)

### Issue: File uploads not working
**Note:** Files uploaded to `/tmp` in Vercel are ephemeral and will be deleted
**Solutions:**
1. For development, test locally
2. For production, implement cloud storage (S3, Cloudinary, etc.)
3. Consider storing file URLs in database instead of serving files directly

## Important Notes

1. **Stateless Functions:** Each Vercel serverless function execution is independent
   - Database connections are cached but may be recreated
   - File system writes go to `/tmp` and are temporary

2. **Function Timeout:** Set to 30 seconds (max for free tier is 10s, upgrade may be needed)

3. **Cold Starts:** First request after inactivity may be slower due to cold start

4. **File Storage:** For production, migrate to cloud storage service:
   - AWS S3
   - Cloudinary
   - Azure Blob Storage
   - Google Cloud Storage

## Monitoring

Monitor your deployment:
1. Vercel Dashboard > Your Project > Deployments
2. View function logs in real-time
3. Check for errors and performance metrics

## Rollback

If deployment has issues, rollback to previous version:
1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
