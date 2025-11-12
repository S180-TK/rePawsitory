// Upload medical record files
exports.uploadMedicalRecordFiles = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    // Return the URLs for all uploaded files
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      fileUrl: `/uploads/medical-records/${file.filename}`,
      fileType: file.mimetype
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
exports.uploadPetImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the URL path to the uploaded image
    const imageUrl = `/uploads/pets/${req.file.filename}`;
    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
