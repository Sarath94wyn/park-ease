const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a short-lived JWT access token (15 minutes).
 * Payload includes user ID and role for authorization checks.
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: '15m',
  });
};

/**
 * Generate a long-lived JWT refresh token (7 days).
 * Used to obtain new access tokens without re-authentication.
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtRefreshSecret, {
    expiresIn: '7d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
