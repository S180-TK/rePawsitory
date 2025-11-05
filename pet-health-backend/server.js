// server/server.js
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require('mongoose');
const { User, Pet, MedicalRecord, PetAccess } = require('./models');
const { connectToDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const { auth, checkRole } = require('./middleware/auth');

app.use(cors()); // allow React frontend to access this API
app.use(express.json());

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

// Connect to MongoDB
connectToDatabase();

  
// Endpoint to send data to frontend
app.get("/pets", async (req, res) => {
  try {
    const pets = await Pet.find().lean();
    return res.json(pets);
  } catch (err) {
    console.error('Error fetching pets:', err);
    return res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// Endpoint to add a new pet
app.post("/pets", async (req, res) => {
  try {
    const { name, species, breed, age, photo } = req.body || {};

    if (!name || !species) {
      return res.status(400).json({ error: "'name' and 'species' are required" });
    }

    const pet = new Pet({
      name,
      species,
      breed: breed || "",
      age: typeof age === "number" ? age : Number(age) || 0,
      photo: photo || "",
    });

    const saved = await pet.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating pet:', err);
    return res.status(500).json({ error: 'Failed to create pet' });
  }
});

// Start server
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
