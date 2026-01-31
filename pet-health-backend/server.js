// server/server.js
const express = require("express");
const cors = require("cors");
const app = express();

// CORS configuration - Allow all origins in production (can be restricted later)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Body parser middleware
app.use(express.json());

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

// Import DB connection
require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const petRoutes = require('./routes/pets');
const medicalRecordRoutes = require('./routes/medicalRecords');
const petAccessRoutes = require('./routes/petAccess');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/pet-access', petAccessRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Export for Vercel (serverless)
module.exports = app;

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}
