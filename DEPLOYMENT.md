# Deploying rePawsitory to Vercel

This project is configured as a monorepo with both frontend and backend deployed together on Vercel.

## Architecture

- **Frontend**: React app in `pet-health-frontend/` (served at root `/`)
- **Backend**: Express API in `pet-health-backend/` (served at `/api/*` and `/pets/*`)

## Environment Variables

Before deploying, configure these environment variables in Vercel:

### Backend Variables (Required)
```
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
```

### Optional Variables
```
FRONTEND_URL=https://your-app.vercel.app
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: Other
   - Root Directory: Leave as `./` (monorepo setup)
   - Build Command: `cd pet-health-frontend && npm install && npm run build`
   - Output Directory: `pet-health-frontend/build`
   - Install Command: `npm install --prefix pet-health-backend && npm install --prefix pet-health-frontend`

3. **Add Environment Variables**
   - Add the required environment variables listed above

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## How It Works

The root `vercel.json` configures:
- Backend routes (`/api/*`, `/pets/*`, `/uploads/*`) → Express server
- All other routes → React frontend
- Frontend uses client-side routing for React Router

## Testing Deployment

After deployment, test these endpoints:

1. **Backend Health Check**: `https://your-app.vercel.app/api`
2. **Frontend**: `https://your-app.vercel.app`
3. **Login**: Try logging in through the UI

## Troubleshooting

### "CANNOT GET /" Error
- Fixed: Added health check endpoint to server.js
- The backend now responds to GET / requests

### "Failed to fetch" on Login
- Fixed: CORS is configured to allow your Vercel domain
- API calls use relative URLs in production (same domain)

### Build Failures
- Ensure all dependencies are in package.json files
- Check that MongoDB connection string is valid
- Verify JWT_SECRET is set in Vercel environment variables

### Still Having Issues?

1. Check Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Test backend endpoint directly: `/api` should return API info
4. Check browser console for CORS errors

## Local Development

```bash
# Backend
cd pet-health-backend
npm install
npm start

# Frontend (in another terminal)
cd pet-health-frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000` and proxy API requests to `http://localhost:5001`.
