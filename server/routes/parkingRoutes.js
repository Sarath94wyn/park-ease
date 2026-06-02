const express = require('express');
const router = express.Router();
const {
  getAllParkingLots,
  getParkingLotById,
  getNearbyParkingLots,
  searchParkingLots,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
} = require('../controllers/parkingController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getAllParkingLots);
router.get('/search', searchParkingLots);
router.get('/nearby', getNearbyParkingLots);
router.get('/:id', getParkingLotById);

// Admin-only routes
router.post('/', protect, admin, createParkingLot);
router.put('/:id', protect, admin, updateParkingLot);
router.delete('/:id', protect, admin, deleteParkingLot);

module.exports = router;
