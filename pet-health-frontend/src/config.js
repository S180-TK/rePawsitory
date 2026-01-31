// API Configuration
// In production, use the backend Vercel deployment
// In development, use local backend
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

export const API_BASE_URL = isDevelopment 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:5001')
  : (process.env.REACT_APP_API_URL || 'https://repawsitory-backend.vercel.app'); // You'll need to update this with your actual backend URL

// For local development, you can set REACT_APP_API_URL=http://localhost:5001 in .env file
