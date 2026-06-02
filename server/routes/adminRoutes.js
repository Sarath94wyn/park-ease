const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
