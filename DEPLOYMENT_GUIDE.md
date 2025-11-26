# Deployment Guide for rePawsitory

## Backend Deployment (Render) - ✅ COMPLETED

Your backend is already deployed at: **https://repawsitory.onrender.com**

## Frontend Deployment (Vercel)

### Step 1: Push your code to GitHub
```bash
git add .
git commit -m "Configure API for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. Click **"Add New..."** → **"Project"**

3. Import your `rePawsitory` repository

4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `pet-health-frontend`
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `build` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

5. **Environment Variables** (Optional):
   - You don't need to set any environment variables since the backend URL is already configured in `config.js`
   - If you want to override it: Add `REACT_APP_API_URL` = `https://repawsitory.onrender.com`

6. Click **"Deploy"**

### Step 3: Update Backend CORS (if needed)

Once you get your Vercel URL (e.g., `https://repawsitory.vercel.app`):

1. Open `pet-health-backend/server.js`
2. Update line 18 with your actual Vercel URL:
   ```javascript
   'https://your-actual-vercel-url.vercel.app',
   ```
3. Push changes to GitHub
4. Render will automatically redeploy your backend

## Configuration Files

### Frontend (`pet-health-frontend/src/config.js`)
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://repawsitory.onrender.com';
```
- Uses Render backend by default
- Can be overridden with environment variable for local development

### Backend (`pet-health-backend/server.js`)
```javascript
const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'https://repawsitory.vercel.app',  // Production frontend
  process.env.FRONTEND_URL           // Optional env variable
];
```

## Local Development Setup

### Running locally with deployed backend:
1. Frontend: `npm start` in `pet-health-frontend`
2. It will use the deployed backend at `https://repawsitory.onrender.com`

### Running fully local (backend + frontend):
1. Create `.env` in `pet-health-frontend`:
   ```
   REACT_APP_API_URL=http://localhost:5001
   ```
2. Backend: `npm start` in `pet-health-backend`
3. Frontend: `npm start` in `pet-health-frontend`

## Troubleshooting

### Issue: API calls failing from Vercel
**Solution**: 
1. Check browser console for CORS errors
2. Verify your Vercel URL is added to backend's `allowedOrigins`
3. Redeploy backend after updating CORS settings

### Issue: Images/files not loading
**Solution**: 
- All file URLs use `API_BASE_URL` from config.js
- Files are served from: `https://repawsitory.onrender.com/uploads/...`

### Issue: Free tier Render backend is slow
**Solution**: 
- Free tier spins down after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- Consider upgrading to paid tier for production use

## URLs After Deployment

- **Backend API**: https://repawsitory.onrender.com
- **Frontend**: https://your-app.vercel.app (you'll get this after deploying)
- **Local Frontend**: http://localhost:3000
- **Local Backend**: http://localhost:5001

## Notes

✅ All API calls updated to use `API_BASE_URL`  
✅ Backend deployed to Render  
✅ CORS configured for Vercel  
✅ Environment variables configured  
✅ Ready for Vercel deployment!
