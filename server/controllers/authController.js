const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

/**
 * @desc    Register a new user with standard email and password
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if email already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Create user. The model pre-save hook handles password hashing.
    // Points default to 10 automatically.
    const user = await User.create({
      name,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`, // Premium avatar placeholder
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(251).json({
      success: true,
      message: 'Registration successful! 10 Loyalty Points credited.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          phone: user.phone,
          points: user.points,
          favorites: user.favorites || [],
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user via email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          phone: user.phone,
          points: user.points,
          favorites: user.favorites || [],
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -__v')
      .populate('favorites', 'name address pricePerHour rating images');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using a valid refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify the refresh token
    const decoded = jwt.verify(token, config.jwtRefreshSecret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found — invalid refresh token',
      });
    }

    // Issue new token pair
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
    next(error);
  }
};

/**
 * @desc    Logout (client-side token clearing)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = { register, login, getMe, refreshToken, logout };
