const Pet = require('../models/Pet');
const MedicalRecord = require('../models/MedicalRecord');

// Get all pets for the authenticated user
exports.getPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id }).lean();
    return res.json(pets);
  } catch (err) {
    console.error('Error fetching pets:', err);
    return res.status(500).json({ error: 'Failed to fetch pets' });
  }
};

// Create a new pet
exports.createPet = async (req, res) => {
  try {
    // Check if profile is complete
    if (!req.user.isProfileComplete()) {
      return res.status(403).json({ 
        error: 'Please complete your profile before adding pets',
        profileIncomplete: true
      });
    }

    const { 
      name, 
      species, 
      breed, 
      dateOfBirth, 
      gender, 
      weight, 
      color, 
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
};

// Update a pet
exports.updatePet = async (req, res) => {
  try {
    const petId = req.params.id;
    
    // Find the pet
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check if user is the owner
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this pet' });
    }

    const { 
      name, 
      species, 
      breed, 
      dateOfBirth, 
      gender, 
      weight, 
      color, 
      photoUrl, 
      allergies, 
      chronicConditions, 
      emergencyContact 
    } = req.body;

    // Update pet fields
    if (name !== undefined) pet.name = name.trim();
    if (species !== undefined) pet.species = species.trim();
    if (breed !== undefined) pet.breed = breed.trim();
    if (dateOfBirth !== undefined) pet.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) pet.gender = gender;
    if (weight !== undefined) pet.weight = weight;
    if (color !== undefined) pet.color = color.trim();
    if (photoUrl !== undefined) pet.photoUrl = photoUrl;
    if (allergies !== undefined) pet.allergies = allergies;
    if (chronicConditions !== undefined) pet.chronicConditions = chronicConditions;
    if (emergencyContact !== undefined) pet.emergencyContact = emergencyContact;

    const updated = await pet.save();
    return res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating pet:', err);
    return res.status(500).json({ error: err.message || 'Failed to update pet' });
  }
};

// Delete a pet
exports.deletePet = async (req, res) => {
  try {
    const petId = req.params.id;
    
    // Find the pet
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check if user is the owner
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this pet' });
    }

    // Delete all medical records associated with this pet
    await MedicalRecord.deleteMany({ pet: petId });

    // Delete the pet
    await Pet.findByIdAndDelete(petId);
    
    return res.status(200).json({ message: 'Pet and associated records deleted successfully' });
  } catch (err) {
    console.error('Error deleting pet:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete pet' });
  }
};
