const PetAccess = require('../models/PetAccess');
const Pet = require('../models/Pet');
const User = require('../models/User');

// Get patients for veterinarian
exports.getPatients = async (req, res) => {
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
};

// Grant veterinarian access to a pet
exports.grantAccess = async (req, res) => {
  try {
    // Check if profile is complete
    if (!req.user.isProfileComplete()) {
      return res.status(403).json({ 
        error: 'Please complete your profile before granting access',
        profileIncomplete: true
      });
    }

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
};

// Get all access grants made by the current user
exports.getMyGrants = async (req, res) => {
  try {
    const grants = await PetAccess.find({
      grantedBy: req.user._id,
      isRevoked: false
    })
      .populate('veterinarian', 'name email clinic specialization')
      .populate('pet', 'name species breed')
      .lean();

    // Group by veterinarian
    const groupedGrants = grants.reduce((acc, grant) => {
      const vetId = grant.veterinarian._id.toString();
      if (!acc[vetId]) {
        acc[vetId] = {
          _id: grant._id,
          veterinarian: grant.veterinarian,
          pets: [],
          grantedAt: grant.grantedAt
        };
      }
      acc[vetId].pets.push(grant.pet);
      return acc;
    }, {});

    res.json(Object.values(groupedGrants));
  } catch (error) {
    console.error('Error fetching grants:', error);
    res.status(500).json({ error: 'Failed to fetch access grants' });
  }
};

// Revoke veterinarian access
exports.revokeAccess = async (req, res) => {
  try {
    const { accessId } = req.params;

    const access = await PetAccess.findById(accessId);
    if (!access) {
      return res.status(404).json({ error: 'Access record not found' });
    }

    // Verify the user is the one who granted access
    if (access.grantedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only revoke access you granted' });
    }

    access.isRevoked = true;
    access.revokedAt = new Date();
    access.revokedBy = req.user._id;
    await access.save();

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Error revoking access:', error);
    res.status(500).json({ error: 'Failed to revoke access' });
  }
};
