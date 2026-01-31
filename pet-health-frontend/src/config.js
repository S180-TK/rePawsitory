// API Configuration
// In production (Vercel), use the same domain as frontend since backend is served from /api
// In development, use local backend
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

export const API_BASE_URL = isDevelopment 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:5001')
  : ''; // Empty string uses same domain in production

// For local development, you can set REACT_APP_API_URL=http://localhost:5001 in .env file
