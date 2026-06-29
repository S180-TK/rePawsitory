// API Configuration
// Change this to your deployed backend URL when deploying to production
const rawApiBaseUrl = process.env.REACT_APP_API_URL || 'https://pet-health-backend.vercel.app';
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

export const getFileUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
};

// For local development, you can set REACT_APP_API_URL=http://localhost:5001 in .env file
