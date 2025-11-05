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
const uploadMedicalRecord = require('./config/multerMedicalRecords');

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        clinic: req.user.clinic,
        license: req.user.license,
        specialization: req.user.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile endpoint
app.put('/api/profile/update', auth, async (req, res) => {
  try {
    const { name, phone, address, clinic, license, specialization } = req.body;
    
    // Update user data
    const updateData = {
      name,
      phone,
      address
    };

    // Add vet-specific fields if user is a veterinarian
    if (req.user.role === 'veterinarian') {
      if (clinic) updateData.clinic = clinic;
      if (license) updateData.license = license;
      if (specialization) updateData.specialization = specialization;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Protected route with role check
app.get('/api/vet-only', auth, checkRole(['veterinarian']), (req, res) => {
  res.json({ message: 'Welcome, veterinarian!' });
});

// Medical record file upload endpoint (supports multiple files)
app.post('/api/upload/medical-record', auth, uploadMedicalRecord.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    // Return the URLs for all uploaded files
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      fileUrl: `/uploads/medical-records/${file.filename}`,
      fileType: file.mimetype
    }));

    res.json({ 
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Image upload endpoint for pets
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

// Get patients for veterinarian
app.get('/api/vet/patients', auth, checkRole(['veterinarian']), async (req, res) => {
  try {
    // Find all pets this vet has access to
    const petAccesses = await PetAccess.find({
      veterinarian: req.user._id,
      isRevoked: false
    }).populate({
      path: 'pet',
      populate: {
        path: 'owner',
        select: 'name email'
      }
    });

    // Extract and format pet data with owner info
    const patients = petAccesses
      .filter(access => access.pet) // Filter out any null pets
      .map(access => ({
        _id: access.pet._id,
        name: access.pet.name,
        species: access.pet.species,
        breed: access.pet.breed,
        dateOfBirth: access.pet.dateOfBirth,
        gender: access.pet.gender,
        weight: access.pet.weight,
        color: access.pet.color,
        microchipId: access.pet.microchipId,
        photoUrl: access.pet.photoUrl,
        allergies: access.pet.allergies,
        chronicConditions: access.pet.chronicConditions,
        owner: {
          _id: access.pet.owner._id,
          name: access.pet.owner.name,
          email: access.pet.owner.email
        },
        accessLevel: access.accessLevel,
        permissions: access.permissions
      }));

    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get all veterinarians (for pet owners to search and request access)
app.get('/api/vets', auth, async (req, res) => {
  try {
    const veterinarians = await User.find({ role: 'veterinarian' })
      .select('name email clinic license specialization address')
      .lean();

    res.json(veterinarians);
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    res.status(500).json({ error: 'Failed to fetch veterinarians' });
  }
});

// Grant veterinarian access to a pet (pet owner grants access)
app.post('/api/pet-access/grant', auth, async (req, res) => {
  try {
    const { petId, veterinarianId, accessLevel, permissions } = req.body;

    // Verify the pet exists and belongs to the requesting user
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only grant access to your own pets' });
    }

    // Verify the veterinarian exists and has the correct role
    const veterinarian = await User.findById(veterinarianId);
    if (!veterinarian) {
      return res.status(404).json({ error: 'Veterinarian not found' });
    }

    if (veterinarian.role !== 'veterinarian') {
      return res.status(400).json({ error: 'User is not a veterinarian' });
    }

    // Check if access already exists
    const existingAccess = await PetAccess.findOne({
      pet: petId,
      veterinarian: veterinarianId,
      isRevoked: false
    });

    if (existingAccess) {
      return res.status(400).json({ error: 'Access already granted to this veterinarian' });
    }

    // Create new pet access
    const petAccess = new PetAccess({
      pet: petId,
      veterinarian: veterinarianId,
      grantedBy: req.user._id,
      accessLevel: accessLevel || 'read',
      permissions: permissions || {
        viewMedicalRecords: true,
        addMedicalRecords: false,
        editPetInfo: false,
        viewOwnerInfo: true
      }
    });

    await petAccess.save();

    res.status(201).json({
      message: 'Access granted successfully',
      petAccess
    });

  } catch (error) {
    console.error('Error granting pet access:', error);
    res.status(500).json({ error: 'Failed to grant access' });
  }
});

// Connect to MongoDB
connectToDatabase();

  
// Endpoint to send data to frontend
app.get("/pets", auth, async (req, res) => {
  try {
    // Get pets for the authenticated user
    const pets = await Pet.find({ owner: req.user._id }).lean();
    return res.json(pets);
  } catch (err) {
    console.error('Error fetching pets:', err);
    return res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// Endpoint to add a new pet
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
    } = req.body;

    // Validate required fields
    if (!name || !species) {
      return res.status(400).json({ error: 'Name and species are required' });
    }

    if (!dateOfBirth) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }

    if (!gender) {
      return res.status(400).json({ error: 'Gender is required' });
    }

    // Create new pet with owner
    const pet = new Pet({
      owner: req.user._id,
      name: name.trim(),
      species: species.trim(),
      breed: breed ? breed.trim() : '',
      dateOfBirth: new Date(dateOfBirth),
      gender,
      weight: weight || undefined,
      color: color ? color.trim() : '',
      microchipId: microchipId ? microchipId.trim() : '',
      photoUrl: photoUrl || '',
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      emergencyContact: emergencyContact || undefined
    });

    const saved = await pet.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating pet:', err);
    return res.status(500).json({ error: err.message || 'Failed to create pet' });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
