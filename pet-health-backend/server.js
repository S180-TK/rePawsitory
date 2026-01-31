// server/server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// CORS configuration - Allow all origins in production (can be restricted later)
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (must be before route imports)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Pet Health API is running',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Pet Health API',
    endpoints: ['/api/auth', '/api/users', '/pets', '/api/medical-records', '/api/pet-access', '/api/upload', '/api/admin']
  });
});

// Import and connect DB
try {
  const { connectToDatabase } = require('./db');
  console.log('DB module loaded');
} catch (error) {
  console.error('Error loading DB module:', error);
}

// Import routes with error handling
try {
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const petRoutes = require('./routes/pets');
  const medicalRecordRoutes = require('./routes/medicalRecords');
  const petAccessRoutes = require('./routes/petAccess');
  const uploadRoutes = require('./routes/uploads');
  const adminRoutes = require('./routes/admin');

  // Mount routes
  app.use('/api', authRoutes);                    // Authentication routes (login, signup)
  app.use('/api', userRoutes);                    // User profile routes
  app.use('/pets', petRoutes);                    // Pet CRUD routes
  app.use('/api', medicalRecordRoutes);           // Medical record routes
  app.use('/api', petAccessRoutes);               // Pet access management routes (/api/vet/patients, /api/pet-access/*)
  app.use('/api/upload', uploadRoutes);           // File upload routes
  app.use('/api', adminRoutes);                   // Admin routes
  
  console.log('All routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Don't wait for DB connection - it will connect automatically
// The db.js file handles connection on import

// Export for Vercel (serverless)
module.exports = app;

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}
