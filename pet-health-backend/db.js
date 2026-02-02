const mongoose = require('mongoose');

// IMPORTANT: Use environment variable for MongoDB connection
// Never hardcode credentials in code!
const MONGO_URI = process.env.MONGODB_URI || 
  `mongodb+srv://mattfuentes_db_user:${process.env.MONGODB_PASSWORD || 'YOUR_PASSWORD_HERE'}@repawsitory0.fbqvhjj.mongodb.net/?appName=rePawsitory0`;

// Cache the connection for serverless environments
let cachedConnection = null;

async function connectToDatabase() {
  // Return cached connection if available (for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Optimize for serverless
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log(`✅ Connected to MongoDB at ${MONGO_URI.split('@')[1]}`);
    cachedConnection = connection;
    return connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    cachedConnection = null;
    throw err;
  }
}

module.exports = { connectToDatabase };


