// server/server.js
// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (err) {
    // dotenv not installed, using environment variables from system
  }
}

const express = require("express");
const path = require("path");
const app = express();
const { connectToDatabase } = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const petRoutes = require('./routes/pets');
const medicalRecordRoutes = require('./routes/medicalRecords');
const petAccessRoutes = require('./routes/petAccess');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://repawsitory.vercel.app',
  'https://pet-health-frontend-9wu3m0db8-s180-tks-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Simple CORS middleware that works better with Vercel serverless
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all Vercel deployments, localhost, and configured origins
  if (!origin || origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Max-Age', '3600');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Body parser middleware
app.use(express.json());

// Serve static files from uploads directory
// In production (Vercel), use /tmp; in development, use local uploads folder
const uploadsPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads'
  : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Mount routes
app.use('/api', authRoutes);                    // Authentication routes (login, signup)
app.use('/api', userRoutes);                    // User profile routes
app.use('/pets', petRoutes);                    // Pet CRUD routes
app.use('/api', medicalRecordRoutes);           // Medical record routes
app.use('/api', petAccessRoutes);               // Pet access management routes (/api/vet/patients, /api/pet-access/*)
app.use('/api/upload', uploadRoutes);           // File upload routes
app.use('/api', adminRoutes);                   // Admin routes

// Root route handler
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'rePawsitory API Server',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/login, /api/signup',
      users: '/api/users/*',
      pets: '/pets/*',
      medical: '/api/medical-records/*',
      access: '/api/pet-access/*',
      upload: '/api/upload/*'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: ['/api', '/pets', '/health']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Connect to MongoDB
connectToDatabase();

// Export for Vercel (serverless)
module.exports = app;

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}
