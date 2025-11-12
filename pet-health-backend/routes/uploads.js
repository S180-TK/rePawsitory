const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../config/multer');
const uploadMedicalRecord = require('../config/multerMedicalRecords');
const uploadController = require('../controllers/uploadController');

// Medical record file upload (supports multiple files)
router.post('/medical-record', auth, uploadMedicalRecord.array('files', 5), uploadController.uploadMedicalRecordFiles);

// Pet image upload
router.post('/pet-image', auth, upload.single('image'), uploadController.uploadPetImage);

module.exports = router;
