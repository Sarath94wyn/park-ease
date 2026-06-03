const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register — Email/password registration
router.post('/register', register);

// POST /api/auth/login — Email/password login
router.post('/login', login);

// POST /api/auth/google — Google Sign-In login
router.post('/google', googleLogin);

// GET /api/auth/me — Get current authenticated user
router.get('/me', protect, getMe);

// POST /api/auth/refresh — Refresh access token
router.post('/refresh', refreshToken);

// POST /api/auth/logout — Logout
router.post('/logout', logout);

module.exports = router;
