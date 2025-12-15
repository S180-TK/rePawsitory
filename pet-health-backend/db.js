const mongoose = require('mongoose');


const MONGO_URI = 'mongodb+srv://mattfuentes_db_user:RVOCW6b97JJt5ipw@repawsitory0.fbqvhjj.mongodb.net/?appName=rePawsitory0'
function connectToDatabase() {
  return mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log(`✅ Connected to MongoDB at ${MONGO_URI}`);
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
}

module.exports = { connectToDatabase };


