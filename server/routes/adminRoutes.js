const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleBlockUser,
  updateUserPoints,
  updateParkingSpace,
  getAllQueries,
  resolveQuery,
  getAlerts,
  resolveAlert,
  refundBooking,
  getStaff,
  addStaff,
  checkInBooking,
  checkOutBooking,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/users/:id/block', protect, admin, toggleBlockUser);
router.put('/users/:id/points', protect, admin, updateUserPoints);
router.put('/slots/:lotId/:slotNumber', protect, admin, updateParkingSpace);
router.get('/queries', protect, admin, getAllQueries);
router.put('/queries/:id/resolve', protect, admin, resolveQuery);
router.get('/alerts', protect, admin, getAlerts);
router.put('/alerts/:id/resolve', protect, admin, resolveAlert);
router.post('/bookings/:id/refund', protect, admin, refundBooking);
router.get('/staff', protect, admin, getStaff);
router.post('/staff', protect, admin, addStaff);
router.put('/bookings/:id/checkin', protect, admin, checkInBooking);
router.put('/bookings/:id/checkout', protect, admin, checkOutBooking);

module.exports = router;
