const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    default: '',
    trim: true
  },
  age: {
    type: Number,
    default: 0,
    min: 0
  },
  photo: {
    type: String,
    default: ''
    // Note: trim: true removed to preserve base64 image data integrity
    // MongoDB String fields can store up to 16MB, sufficient for base64 images
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Pet', petSchema);

