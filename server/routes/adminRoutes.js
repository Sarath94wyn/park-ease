const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateUserPoints,
  getAllQueries,
  resolveQuery,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/users/:id/points', protect, admin, updateUserPoints);
router.get('/queries', protect, admin, getAllQueries);
router.put('/queries/:id/resolve', protect, admin, resolveQuery);

module.exports = router;
