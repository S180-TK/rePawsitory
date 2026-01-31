const mongoose = require('mongoose');

// Use environment variable for MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rePawsitory';

function connectToDatabase() {
  return mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log(`✅ Connected to MongoDB`);
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      // Don't throw - let the app start even if DB connection fails initially
      // Mongoose will retry automatically
    });
}

// Connect immediately
connectToDatabase();

module.exports = { connectToDatabase };


