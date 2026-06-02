const express = require('express');
const router = express.Router();
const {
  updateProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All user routes require authentication
router.put('/profile', protect, updateProfile);
router.post('/favorites/:lotId', protect, addFavorite);
router.delete('/favorites/:lotId', protect, removeFavorite);
router.get('/favorites', protect, getFavorites);

module.exports = router;
