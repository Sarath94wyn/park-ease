const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controllers/chatbotController');
const { optionalAuth } = require('../middleware/auth');

// POST /api/chatbot/message — Send a message to the chatbot
router.post('/message', optionalAuth, handleMessage);

module.exports = router;
