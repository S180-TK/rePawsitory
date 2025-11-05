const mongoose = require('mongoose');
const { User } = require('./models');
const { connectToDatabase } = require('./db');

async function createTestUser() {
  try {
    // Connect to database
    await connectToDatabase();

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123', // Will be hashed automatically
      role: 'pet_owner',
      // Add vet-specific fields if role is veterinarian
      // clinic: 'Test Clinic',
      // license: 'VET123',
      // specialization: 'General Practice'
    });

    // Save user
    await testUser.save();
    console.log('Test user created successfully:', {
      name: testUser.name,
      email: testUser.email,
      role: testUser.role
    });

    // Create test vet
    const testVet = new User({
      name: 'Test Vet',
      email: 'vet@example.com',
      password: 'password123',
      role: 'veterinarian',
      clinic: 'Test Clinic',
      license: 'VET123',
      specialization: 'General Practice'
    });

    // Save vet
    await testVet.save();
    console.log('Test vet created successfully:', {
      name: testVet.name,
      email: testVet.email,
      role: testVet.role
    });

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
  }
}

// Run the function
createTestUser();