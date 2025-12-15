const mongoose = require('mongoose');

// Use environment variable for MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repawsitory';

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
    });
}

module.exports = { connectToDatabase };


