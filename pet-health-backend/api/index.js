// api/index.js - Vercel serverless function
const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

// Health check
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
    endpoints: ['/api/login']
  });
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    require('../db');
    const { User } = require('../models');
    
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role === 'veterinarian' && !user.isApproved) {
      return res.status(403).json({ error: 'Your account is pending approval by an administrator.' });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const frontendRole = user.role === 'pet_owner' ? 'owner' : 
                        user.role === 'veterinarian' ? 'vet' : user.role;

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: frontendRole
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Export handler for Vercel
module.exports = app;
