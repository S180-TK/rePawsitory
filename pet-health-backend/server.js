// server/server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
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
  'https://repawsitory-l57dzzmyf-s180-tks-projects.vercel.app', // Your actual frontend URL
  'https://repawsitory.vercel.app', // Alternative domain
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // For development, allow all origins. Change to false in production.
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api', authRoutes);                    // Authentication routes (login, signup)
app.use('/api', userRoutes);                    // User profile routes
app.use('/pets', petRoutes);                    // Pet CRUD routes
app.use('/api', medicalRecordRoutes);           // Medical record routes
app.use('/api', petAccessRoutes);               // Pet access management routes (/api/vet/patients, /api/pet-access/*)
app.use('/api/upload', uploadRoutes);           // File upload routes
app.use('/api', adminRoutes);                   // Admin routes

// Connect to MongoDB
connectToDatabase();

// Export for Vercel (serverless)
module.exports = app;

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}
