const User = require('../models/User');
const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 *
 * Returns aggregate counts and revenue for the dashboard overview.
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all count/aggregate queries in parallel for performance
    const [
      totalUsers,
      totalParkingLots,
      totalBookings,
      activeBookings,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments(),
      ParkingLot.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'active' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalParkingLots,
        totalBookings,
        activeBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user's role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role (user or admin) is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
};
