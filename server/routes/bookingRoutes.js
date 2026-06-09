const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  simulatePayment,
  getAllBookings,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');
const { validateBooking, handleValidationErrors } = require('../middleware/validate');

// All booking routes require authentication
router.post('/', protect, validateBooking, handleValidationErrors, createBooking);
router.get('/my', protect, getUserBookings);
router.get('/all', protect, admin, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/pay', protect, simulatePayment);
router.post('/:id/razorpay-order', protect, createRazorpayOrder);
router.post('/:id/razorpay-verify', protect, verifyRazorpayPayment);

module.exports = router;
