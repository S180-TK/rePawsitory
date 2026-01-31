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

// Login route - all imports done inside to avoid startup crashes
app.post('/api/login', async (req, res) => {
  try {
    // Import everything inside the handler
    const jwt = require('jsonwebtoken');
    require('./db');
    const { User } = require('./models');
    
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if veterinarian is approved
    if (user.role === 'veterinarian' && !user.isApproved) {
      return res.status(403).json({ error: 'Your account is pending approval by an administrator.' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Map backend roles to frontend roles
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

// Export for Vercel (serverless)
module.exports = app;

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}
