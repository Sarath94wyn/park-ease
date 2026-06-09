const User = require('../models/User');
const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');
const Alert = require('../models/Alert');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const [
      totalUsers,
      totalParkingLots,
      totalBookings,
      activeBookings,
      revenueResult,
      dailyRevResult,
      weeklyRevResult,
      monthlyRevResult,
      activeAlertsCount,
      sensorFailuresCount,
    ] = await Promise.all([
      User.countDocuments(),
      ParkingLot.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'active' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Alert.countDocuments({ status: 'active' }),
      Alert.countDocuments({ status: 'active', type: 'sensor_failure' }),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const dailyRevenue = dailyRevResult.length > 0 ? dailyRevResult[0].total : 0;
    const weeklyRevenue = weeklyRevResult.length > 0 ? weeklyRevResult[0].total : 0;
    const monthlyRevenue = monthlyRevResult.length > 0 ? monthlyRevResult[0].total : 0;

    // Fetch active lots to aggregate space levels
    const activeLots = await ParkingLot.find({ isActive: true });
    let totalSpaces = 0;
    let occupiedSpaces = 0;
    let availableSpaces = 0;
    const spaceTypesBreakdown = { standard: 0, compact: 0, handicap: 0, ev: 0, vip: 0, reserved: 0 };

    activeLots.forEach((lot) => {
      lot.slots.forEach((slot) => {
        totalSpaces++;
        if (slot.isOccupied) {
          occupiedSpaces++;
        } else if (slot.maintenanceStatus === 'operational') {
          availableSpaces++;
        }
        if (spaceTypesBreakdown[slot.type] !== undefined) {
          spaceTypesBreakdown[slot.type]++;
        } else {
          spaceTypesBreakdown[slot.type] = 1;
        }
      });
    });

    const utilizationRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;

    // Revenue by Parking Lot breakdown
    const revenueByLot = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$parkingLot',
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $lookup: { from: 'parkinglots', localField: '_id', foreignField: '_id', as: 'lotInfo' } },
      { $unwind: { path: '$lotInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$lotInfo.name', 'Unknown Facility'] },
          revenue: 1,
          bookingsCount: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Daily Revenue Trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const revenueTrends = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Peak Usage Hours (group by start hour)
    const peakHours = await Booking.aggregate([
      {
        $group: {
          _id: { $hour: '$startTime' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User growth (registered in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const userGrowth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalParkingLots,
          totalBookings,
          activeBookings,
          totalRevenue,
          dailyRevenue,
          weeklyRevenue,
          monthlyRevenue,
          totalSpaces,
          occupiedSpaces,
          availableSpaces,
          utilizationRate,
          spaceTypesBreakdown,
          activeAlertsCount,
          sensorFailuresCount,
          userGrowth,
        },
        revenueByLot,
        revenueTrends,
        peakHours,
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
    const { page = 1, limit = 100 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-password -__v');

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
    ).select('-password -__v');

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

/**
 * @desc    Toggle user block/active status
 * @route   PUT /api/admin/users/:id/block
 * @access  Private/Admin
 */
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status set to ${user.status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user's loyalty points balance
 * @route   PUT /api/admin/users/:id/points
 * @access  Private/Admin
 */
const updateUserPoints = async (req, res, next) => {
  try {
    const { points } = req.body;

    if (points === undefined || isNaN(points) || Number(points) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid points count (non-negative number) is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { points: Number(points) },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User points balance updated to ${points}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update parking space status (type, maintenance, sensor)
 * @route   PUT /api/admin/slots/:lotId/:slotNumber
 * @access  Private/Admin
 */
const updateParkingSpace = async (req, res, next) => {
  try {
    const { lotId, slotNumber } = req.params;
    const { type, maintenanceStatus, sensorStatus, isOccupied } = req.body;

    const lot = await ParkingLot.findById(lotId);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found',
      });
    }

    const slot = lot.slots.find((s) => s.slotNumber === slotNumber);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking space not found in this lot',
      });
    }

    if (type !== undefined) slot.type = type;
    if (maintenanceStatus !== undefined) slot.maintenanceStatus = maintenanceStatus;
    if (sensorStatus !== undefined) slot.sensorStatus = sensorStatus;
    if (isOccupied !== undefined) slot.isOccupied = isOccupied;

    // Re-calculate available slots
    lot.availableSlots = lot.slots.filter((s) => !s.isOccupied && s.maintenanceStatus === 'operational').length;

    await lot.save();

    res.status(200).json({
      success: true,
      message: `Slot ${slotNumber} updated successfully`,
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all support queries
 * @route   GET /api/admin/queries
 * @access  Private/Admin
 */
const getAllQueries = async (req, res, next) => {
  try {
    const Query = require('../models/Query');
    const queries = await Query.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve a support query
 * @route   PUT /api/admin/queries/:id/resolve
 * @access  Private/Admin
 */
const resolveQuery = async (req, res, next) => {
  try {
    const Query = require('../models/Query');
    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Support query resolved successfully',
      data: query,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system alerts
 * @route   GET /api/admin/alerts
 * @access  Private/Admin
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .populate('parkingLot', 'name address');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve alert
 * @route   PUT /api/admin/alerts/:id/resolve
 * @access  Private/Admin
 */
const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel and refund booking
 * @route   POST /api/admin/bookings/:id/refund
 * @access  Private/Admin
 */
const refundBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Free up space
    const lot = await ParkingLot.findById(booking.parkingLot);
    if (lot) {
      const slot = lot.slots.find((s) => s.slotNumber === booking.slotNumber);
      if (slot) {
        slot.isOccupied = false;
        lot.availableSlots = lot.slots.filter((s) => !s.isOccupied && s.maintenanceStatus === 'operational').length;
        await lot.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and payment marked as refunded',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff members
 * @route   GET /api/admin/staff
 * @access  Private/Admin
 */
const getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ staffRole: { $ne: 'none' } }).select('-password -__v');
    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add or update a staff role & permissions
 * @route   POST /api/admin/staff
 * @access  Private/Admin
 */
const addStaff = async (req, res, next) => {
  try {
    const { email, staffRole, permissions } = req.body;

    if (!email || !staffRole) {
      return res.status(400).json({
        success: false,
        message: 'Email and staffRole are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address',
      });
    }

    user.staffRole = staffRole;
    user.permissions = permissions || [];

    // Grant administrative access if staff role is active
    if (staffRole !== 'none') {
      user.role = 'admin';
    } else {
      user.role = 'user';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Staff role updated to ${staffRole}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check-in booking (set status to active)
 * @route   PUT /api/admin/bookings/:id/checkin
 * @access  Private/Admin
 */
const checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    booking.status = 'active';
    await booking.save();
    res.status(200).json({ success: true, message: 'Check-in processed successfully', data: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Check-out booking (set status to completed, free slot)
 * @route   PUT /api/admin/bookings/:id/checkout
 * @access  Private/Admin
 */
const checkOutBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    booking.status = 'completed';
    await booking.save();

    const lot = await ParkingLot.findById(booking.parkingLot);
    if (lot) {
      const slot = lot.slots.find(s => s.slotNumber === booking.slotNumber);
      if (slot) {
        slot.isOccupied = false;
      }
      lot.availableSlots = lot.slots.filter(s => !s.isOccupied && s.maintenanceStatus === 'operational').length;
      await lot.save();
    }

    res.status(200).json({ success: true, message: 'Check-out processed successfully', data: booking });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
