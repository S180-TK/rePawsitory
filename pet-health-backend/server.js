// server/server.js
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

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
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

// Connect to MongoDB
connectToDatabase();

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
