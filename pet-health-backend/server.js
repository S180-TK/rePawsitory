// server/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const mongoose = require('mongoose');
const { User, Pet, MedicalRecord, PetAccess } = require('./models');
const { connectToDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const { auth, checkRole } = require('./middleware/auth');
const upload = require('./config/multer');

app.use(cors()); // allow React frontend to access this API
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use authentication routes
app.use('/api', authRoutes);

// Protected route example
app.get('/api/profile', auth, async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.json({
      message: 'Profile accessed successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected route with role check
app.get('/api/vet-only', auth, checkRole(['veterinarian']), (req, res) => {
  res.json({ message: 'Welcome, veterinarian!' });
});

// Image upload endpoint
app.post('/api/upload/pet-image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the URL path to the uploaded image
    const imageUrl = `/uploads/pets/${req.file.filename}`;
    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Connect to MongoDB
connectToDatabase();

  
// Endpoint to send data to frontend (protected)
app.get("/pets", auth, async (req, res) => {
  try {
    console.log('Fetching pets for user:', req.user._id);
    // Get pets for the authenticated user
    const pets = await Pet.find({ owner: req.user._id }).lean();
    console.log('Found pets:', pets.length);
    return res.json(pets);
  } catch (err) {
    console.error('Error fetching pets:', err);
    return res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// Endpoint to add a new pet (protected)
app.post("/pets", auth, async (req, res) => {
  try {
    const { 
      name, 
      species, 
      breed, 
      dateOfBirth, 
      gender,
      weight,
      color,
      microchipId,
      photoUrl,
      allergies,
      chronicConditions,
      emergencyContact
    } = req.body || {};

    // Validate required fields
    if (!name || !species || !dateOfBirth || !gender) {
      return res.status(400).json({ 
        error: 'Name, species, date of birth, and gender are required' 
      });
    }

    // Create pet with owner from authenticated user
    const pet = new Pet({
      owner: req.user._id, // Set owner from authenticated user
      name: name.trim(),
      species: species.trim(),
      breed: breed || '',
      dateOfBirth: new Date(dateOfBirth),
      gender,
      weight: weight || undefined,
      color: color || '',
      microchipId: microchipId || undefined,
      photoUrl: photoUrl || '',
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      emergencyContact: emergencyContact || undefined
    });

    const saved = await pet.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating pet:', err);
    return res.status(500).json({ 
      error: 'Failed to create pet',
      details: err.message 
    });
  }
});

// Start server
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
