const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const medicalRecordController = require('../controllers/medicalRecordController');

// Get medical records for a specific pet
router.get('/pets/:petId/medical-records', auth, medicalRecordController.getMedicalRecords);

// Create a new medical record
router.post('/medical-records', auth, medicalRecordController.createMedicalRecord);

// Update a medical record
router.put('/medical-records/:id', auth, medicalRecordController.updateMedicalRecord);

// Delete a medical record
router.delete('/medical-records/:id', auth, medicalRecordController.deleteMedicalRecord);

module.exports = router;
