const path = require('path');
const mongoose = require('mongoose');

const BUCKET_NAME = 'uploads';

const getBucket = () => {
  if (!mongoose.connection.db || mongoose.connection.readyState !== 1) {
    throw new Error('Database connection is not ready for file storage');
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: BUCKET_NAME
  });
};

const createStoredFilename = (originalName = '') => {
  const extension = path.extname(originalName).toLowerCase();
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${uniqueSuffix}${extension}`;
};

const uploadBuffer = ({ buffer, originalName, mimetype, category }) => {
  const bucket = getBucket();
  const storedFilename = createStoredFilename(originalName);

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(storedFilename, {
      contentType: mimetype,
      metadata: {
        category,
        originalName,
        mimetype
      }
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        id: uploadStream.id,
        filename: storedFilename,
        originalName,
        contentType: mimetype,
        url: `/uploads/${category}/${storedFilename}`
      });
    });

    uploadStream.end(buffer);
  });
};

const streamFileByPath = async (req, res, next) => {
  try {
    const { category, filename } = req.params;
    const bucket = getBucket();
    const files = await bucket.find({
      filename,
      'metadata.category': category
    }).limit(1).toArray();

    const file = files[0];
    if (!file) {
      return next();
    }

    const contentType = file.contentType || file.metadata?.mimetype || 'application/octet-stream';
    const displayName = file.metadata?.originalName || file.filename;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', file.length);
    res.setHeader('Content-Disposition', `inline; filename="${displayName.replace(/"/g, '')}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    bucket.openDownloadStream(file._id)
      .on('error', next)
      .pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadBuffer,
  streamFileByPath
};
