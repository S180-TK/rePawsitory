const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const petController = require('../controllers/petController');

// Get all pets for authenticated user
router.get('/', auth, petController.getPets);

// Create a new pet
router.post('/', auth, petController.createPet);

// Update a pet
router.put('/:id', auth, petController.updatePet);

// Delete a pet
router.delete('/:id', auth, petController.deletePet);

module.exports = router;
