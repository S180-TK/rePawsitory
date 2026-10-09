// API Configuration
// Change this to your deployed backend URL when deploying to production
const rawApiBaseUrl = process.env.REACT_APP_API_URL || 'https://pet-health-backend.vercel.app';
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

export const getFileUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return '';
  const value = url.trim();
  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).hostname ? value : '';
    } catch {
      return '';
    }
  }
  // Unsupported schemes should show the placeholder rather than a malformed URL.
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//')) return '';
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
};

// For local development, you can set REACT_APP_API_URL=http://localhost:5001 in .env file
