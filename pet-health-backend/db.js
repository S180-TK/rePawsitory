const mongoose = require('mongoose');

// IMPORTANT: Use environment variable for MongoDB connection
// Never hardcode credentials in code!
const MONGO_URI = process.env.MONGODB_URI || 
  `mongodb+srv://mattfuentes_db_user:${process.env.MONGODB_PASSWORD || 'YOUR_PASSWORD_HERE'}@repawsitory0.fbqvhjj.mongodb.net/?appName=rePawsitory0`;

// Cache the connection for serverless environments
let cachedConnection = null;
let cachedConnectionPromise = null;

async function connectToDatabase() {
  // Return cached connection if available (for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  if (cachedConnectionPromise) {
    console.log('Waiting for existing MongoDB connection');
    return cachedConnectionPromise;
  }

  cachedConnectionPromise = (async () => {
    console.log('Attempting MongoDB connection...');
    console.log('Using URI:', MONGO_URI ? `${MONGO_URI.split('@')[0].split('//')[1].split(':')[0]}@${MONGO_URI.split('@')[1]}` : 'NOT SET');
    
    const connection = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Optimize for serverless
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log(`Connected to MongoDB at ${MONGO_URI.split('@')[1]}`);
    cachedConnection = connection;
    return connection;
  })();

  try {
    return await cachedConnectionPromise;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    cachedConnection = null;
    throw err;
  } finally {
    cachedConnectionPromise = null;
  }
}

module.exports = { connectToDatabase };

