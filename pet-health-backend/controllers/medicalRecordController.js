const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');
const PetAccess = require('../models/PetAccess');

// Helper to check write access
const hasWriteAccessToPet = async (user, petId) => {
  const pet = await Pet.findById(petId).lean();
  if (!pet) return false;
  if ((user.role === 'owner' || user.role === 'pet_owner') && pet.owner && pet.owner.toString() === user._id.toString()) return true;
  if (user.role === 'veterinarian') {
    const access = await PetAccess.findOne({ veterinarian: user._id, pet: petId, isRevoked: false }).lean();
    if (access && access.permissions && access.permissions.addMedicalRecords) return true;
  }
  return false;
};

// Get medical records for a pet
exports.getMedicalRecords = async (req, res) => {
  try {
    const { petId } = req.params;
    // Check if user has read access: owner or vet with access
    const pet = await Pet.findById(petId).lean();
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const user = req.user;
    let allowed = false;
    if ((user.role === 'owner' || user.role === 'pet_owner') && pet.owner && pet.owner.toString() === user._id.toString()) allowed = true;
    if (user.role === 'veterinarian') {
      const access = await PetAccess.findOne({ veterinarian: user._id, pet: petId, isRevoked: false }).lean();
      if (access && access.permissions && access.permissions.viewMedicalHistory) allowed = true;
    }

    if (!allowed) return res.status(403).json({ error: 'Not authorized to view records for this pet' });

    const records = await MedicalRecord.find({ pet: petId })
      .populate('veterinarian', 'name email')
      .populate('createdBy', '_id')
      .sort({ date: -1 })
      .lean();
    res.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
};

// Create a new medical record
exports.createMedicalRecord = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body || {};
    const { pet: petId } = data;
    if (!petId) return res.status(400).json({ error: 'pet id is required' });

    const canWrite = await hasWriteAccessToPet(user, petId);
    if (!canWrite) return res.status(403).json({ error: 'Not authorized to add records for this pet' });

    // Map incoming payload to schema expected fields
    const attachments = Array.isArray(data.attachments) ? data.attachments : [];
    if (attachments.length === 0) {
      return res.status(400).json({ error: 'At least one attachment (PDF or image) is required' });
    }

    const record = new MedicalRecord({
      pet: petId,
      recordType: data.type || 'other',
      date: data.date ? new Date(data.date) : new Date(),
      // prefer using authenticated user as veterinarian id when they are a vet
      veterinarian: user.role === 'veterinarian' ? user._id : (data.veterinarian || user._id),
      notes: data.notes || '',
      // attachments must follow { filename, fileUrl, fileType }
      attachments: attachments.map(a => ({ filename: a.filename, fileUrl: a.fileUrl, fileType: a.fileType })),
      createdBy: user._id,
      updatedBy: user._id
    });

    const saved = await record.save();
    const populated = await MedicalRecord.findById(saved._id).populate('veterinarian', 'name email').lean();
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
};

// Update a medical record
exports.updateMedicalRecord = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const existing = await MedicalRecord.findById(id);
    if (!existing) return res.status(404).json({ error: 'Medical record not found' });

    const canWrite = await hasWriteAccessToPet(user, existing.pet);
    if (!canWrite) return res.status(403).json({ error: 'Not authorized to update this record' });

    const updates = req.body || {};
    // Map updates safely to schema fields
    if (updates.type !== undefined) existing.recordType = updates.type;
    if (updates.date !== undefined) existing.date = new Date(updates.date);
    if (updates.veterinarian !== undefined) existing.veterinarian = user.role === 'veterinarian' ? user._id : updates.veterinarian;
    if (updates.notes !== undefined) existing.notes = updates.notes;
    if (updates.attachments !== undefined && Array.isArray(updates.attachments) && updates.attachments.length > 0) {
      existing.attachments = updates.attachments.map(a => ({ filename: a.filename, fileUrl: a.fileUrl, fileType: a.fileType }));
    }
    existing.updatedBy = user._id;
    existing.updatedAt = new Date();

    const saved = await existing.save();
    const populated = await MedicalRecord.findById(saved._id).populate('veterinarian', 'name email').lean();
    res.json(populated);
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ error: 'Failed to update medical record' });
  }
};

// Delete a medical record
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const existing = await MedicalRecord.findById(id);
    if (!existing) return res.status(404).json({ error: 'Medical record not found' });

    const canWrite = await hasWriteAccessToPet(user, existing.pet);
    if (!canWrite) return res.status(403).json({ error: 'Not authorized to delete this record' });

    await MedicalRecord.deleteOne({ _id: id });
    res.json({ message: 'Record deleted' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ error: 'Failed to delete medical record' });
  }
};
