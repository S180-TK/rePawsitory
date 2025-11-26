const User = require('../models/User');

// Get all veterinarians (pending and approved)
exports.getAllVeterinarians = async (req, res) => {
  try {
    const vets = await User.find({ role: 'veterinarian' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(vets);
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    res.status(500).json({ error: 'Failed to fetch veterinarians' });
  }
};

// Approve veterinarian
exports.approveVeterinarian = async (req, res) => {
  try {
    const { vetId } = req.params;
    
    const vet = await User.findById(vetId);
    if (!vet) {
      return res.status(404).json({ error: 'Veterinarian not found' });
    }
    
    if (vet.role !== 'veterinarian') {
      return res.status(400).json({ error: 'User is not a veterinarian' });
    }
    
    vet.isApproved = true;
    await vet.save();
    
    res.json({ message: 'Veterinarian approved successfully', vet: { ...vet._doc, password: undefined } });
  } catch (error) {
    console.error('Error approving veterinarian:', error);
    res.status(500).json({ error: 'Failed to approve veterinarian' });
  }
};

// Reject veterinarian
exports.rejectVeterinarian = async (req, res) => {
  try {
    const { vetId } = req.params;
    
    const vet = await User.findById(vetId);
    if (!vet) {
      return res.status(404).json({ error: 'Veterinarian not found' });
    }
    
    if (vet.role !== 'veterinarian') {
      return res.status(400).json({ error: 'User is not a veterinarian' });
    }
    
    vet.isApproved = false;
    await vet.save();
    
    res.json({ message: 'Veterinarian rejected', vet: { ...vet._doc, password: undefined } });
  } catch (error) {
    console.error('Error rejecting veterinarian:', error);
    res.status(500).json({ error: 'Failed to reject veterinarian' });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    const totalVets = await User.countDocuments({ role: 'veterinarian' });
    const approvedVets = await User.countDocuments({ role: 'veterinarian', isApproved: true });
    const pendingVets = await User.countDocuments({ role: 'veterinarian', isApproved: false });
    const totalOwners = await User.countDocuments({ role: 'pet_owner' });
    
    console.log('Stats:', { totalVets, approvedVets, pendingVets, totalOwners });
    
    res.json({
      totalVets,
      approvedVets,
      pendingVets,
      totalOwners
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
