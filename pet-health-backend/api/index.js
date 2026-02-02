// Vercel serverless function entry point
const app = require('../server');
const { connectToDatabase } = require('../db');

// Ensure database connection before handling request
module.exports = async (req, res) => {
  try {
    // Connect to database (will use cached connection if available)
    await connectToDatabase();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};
