const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const profileComplete = req.user.isProfileComplete();
    
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
        specialization: req.user.specialization,
        profileCompleted: profileComplete
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
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

    // Check if profile is now complete and update the flag
    const profileComplete = updatedUser.isProfileComplete();
    if (profileComplete !== updatedUser.profileCompleted) {
      updatedUser.profileCompleted = profileComplete;
      await updatedUser.save();
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        clinic: updatedUser.clinic,
        license: updatedUser.license,
        specialization: updatedUser.specialization,
        profileCompleted: updatedUser.profileCompleted
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get all veterinarians (for pet owners to search and request access)
exports.getAllVeterinarians = async (req, res) => {
  try {
    const veterinarians = await User.find({ role: 'veterinarian' })
      .select('name email clinic license specialization address')
      .lean();

    res.json(veterinarians);
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    res.status(500).json({ error: 'Failed to fetch veterinarians' });
  }
};
