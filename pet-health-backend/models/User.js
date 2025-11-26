const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['pet_owner', 'veterinarian', 'admin'],
    default: 'pet_owner'
  },
  // Vet-specific fields
  clinic: {
    type: String,
    required: function() { return this.role === 'veterinarian'; }
  },
  license: {
    type: String,
    required: function() { return this.role === 'veterinarian'; }
  },
  specialization: {
    type: String,
    required: function() { return this.role === 'veterinarian'; }
  },
  // Veterinarian approval status
  isApproved: {
    type: Boolean,
    default: function() { return this.role !== 'veterinarian'; } // Auto-approve non-vets
  },
  // Contact information
  phone: {
    type: String,
    trim: true
  },
  // Address information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // Profile completion
  profileCompleted: { type: Boolean, default: false },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if profile is complete
userSchema.methods.isProfileComplete = function() {
  // Check basic required fields
  if (!this.phone || !this.address || !this.address.city || !this.address.country) {
    return false;
  }
  
  // Check vet-specific fields if user is a veterinarian
  if (this.role === 'veterinarian') {
    if (!this.clinic || !this.license || !this.specialization) {
      return false;
    }
  }
  
  return true;
};

const User = mongoose.model('User', userSchema);
module.exports = User;