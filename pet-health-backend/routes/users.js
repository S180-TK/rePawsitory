const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile/update', auth, userController.updateProfile);

// Change password
router.put('/change-password', auth, userController.changePassword);

// Get all veterinarians
router.get('/vets', auth, userController.getAllVeterinarians);

module.exports = router;
