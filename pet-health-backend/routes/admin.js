const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Admin routes
router.get('/admin/veterinarians', auth, checkAdmin, adminController.getAllVeterinarians);
router.put('/admin/veterinarians/:vetId/approve', auth, checkAdmin, adminController.approveVeterinarian);
router.put('/admin/veterinarians/:vetId/reject', auth, checkAdmin, adminController.rejectVeterinarian);
router.get('/admin/stats', auth, checkAdmin, adminController.getDashboardStats);

module.exports = router;
