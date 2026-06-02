const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

/**
 * protect — Requires a valid JWT access token.
 * Extracts token from the Authorization header, verifies it,
 * and attaches the full user document to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach user to request (exclude sensitive fields if any)
    const user = await User.findById(decoded.id).select('-__v');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — token expired',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * admin — Requires the authenticated user to have the 'admin' role.
 * Must be used AFTER the protect middleware.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden — admin access required',
  });
};

/**
 * optionalAuth — Attaches user to req.user if a valid token is present,
 * but does NOT reject requests without a token. Useful for routes
 * that behave differently for authenticated vs anonymous users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select('-__v');
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Token invalid or expired — proceed without user
    next();
  }
};

module.exports = { protect, admin, optionalAuth };
