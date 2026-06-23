// API Configuration
// Change this to your deployed backend URL when deploying to production
const rawApiBaseUrl = process.env.REACT_APP_API_URL || 'https://pet-health-backend.vercel.app';
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

// For local development, you can set REACT_APP_API_URL=http://localhost:5001 in .env file
