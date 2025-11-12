const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const petAccessController = require('../controllers/petAccessController');

// Get patients for veterinarian
router.get('/vet/patients', auth, checkRole(['veterinarian']), petAccessController.getPatients);

// Grant access to a pet
router.post('/pet-access/grant', auth, petAccessController.grantAccess);

// Get all grants made by current user
router.get('/pet-access/my-grants', auth, petAccessController.getMyGrants);

// Revoke access
router.put('/pet-access/revoke/:accessId', auth, petAccessController.revokeAccess);

module.exports = router;
