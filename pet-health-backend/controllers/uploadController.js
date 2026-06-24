const { uploadBuffer } = require('../services/fileStorage');

// Upload medical record files
exports.uploadMedicalRecordFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    const storedFiles = await Promise.all(req.files.map(file => uploadBuffer({
      buffer: file.buffer,
      originalName: file.originalname,
      mimetype: file.mimetype,
      category: 'medical-records'
    })));

    const uploadedFiles = storedFiles.map(file => ({
      filename: file.originalName || file.filename,
      fileUrl: file.url,
      fileType: file.contentType
    }));

    res.json({ 
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
};

// Upload pet image
exports.uploadPetImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const storedFile = await uploadBuffer({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      category: 'pets'
    });

    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl: storedFile.url,
      filename: storedFile.originalName || storedFile.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
