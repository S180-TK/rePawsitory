// Vercel serverless function entry point
const app = require('../server');
const { connectToDatabase } = require('../db');

// Ensure database connection before handling request
module.exports = async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log(`📨 Incoming: ${req.method} ${req.path}`);
    
    // Connect to database (will use cached connection if available)
    await connectToDatabase();
    
    // Call Express app as middleware
    app.handle(req, res);
  } catch (error) {
    console.error('❌ Serverless function error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message 
    }));
  }
};
