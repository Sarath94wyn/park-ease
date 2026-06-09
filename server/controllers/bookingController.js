const crypto = require('crypto');
const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 *
 * Validates slot availability, checks for time conflicts,
 * marks the slot as occupied, and decrements availableSlots.
 */
const createBooking = async (req, res, next) => {
  try {
    const { parkingLotId, slotNumber, vehicleNumber, vehicleType, startTime, endTime } = req.body;

    // Find the parking lot
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot || !parkingLot.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found',
      });
    }

    // Find the requested slot
    const slot = parkingLot.slots.find((s) => s.slotNumber === slotNumber);
    if (!slot) {
      return res.status(400).json({
        success: false,
        message: `Slot ${slotNumber} does not exist in this parking lot`,
      });
    }

    if (slot.isOccupied) {
      return res.status(400).json({
        success: false,
        message: `Slot ${slotNumber} is already occupied`,
      });
    }

    // Check for time conflicts on the same slot
    const conflictingBooking = await Booking.findOne({
      parkingLot: parkingLotId,
      slotNumber,
      status: 'active',
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: `Slot ${slotNumber} has a conflicting booking during the requested time`,
      });
    }

    // Create the booking (pre-save hook calculates duration & totalAmount)
    const booking = await Booking.create({
      user: req.user._id,
      parkingLot: parkingLotId,
      slotNumber,
      vehicleNumber,
      vehicleType,
      startTime,
      endTime,
    });

    // Mark slot as occupied and decrement available count
    slot.isOccupied = true;
    parkingLot.availableSlots = Math.max(0, parkingLot.availableSlots - 1);
    await parkingLot.save();

    // Populate the response with parking lot info
    await booking.populate('parkingLot', 'name address pricePerHour');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for the authenticated user
 * @route   GET /api/bookings/my
 * @access  Private
 */
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('parkingLot', 'name address pricePerHour images');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private (owner or admin)
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('parkingLot', 'name address pricePerHour images operatingHours')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only the booking owner or an admin can view the booking
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 *
 * Sets status to 'cancelled' and paymentStatus to 'refunded',
 * releases the slot and increments availableSlots.
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only the booking owner or an admin can cancel
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Release the slot in the parking lot
    const parkingLot = await ParkingLot.findById(booking.parkingLot);
    if (parkingLot) {
      const slot = parkingLot.slots.find(
        (s) => s.slotNumber === booking.slotNumber
      );
      if (slot) {
        slot.isOccupied = false;
      }
      parkingLot.availableSlots = Math.min(
        parkingLot.totalSlots,
        parkingLot.availableSlots + 1
      );
      await parkingLot.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and refund initiated',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate payment for a booking
 * @route   POST /api/bookings/:id/pay
 * @access  Private
 *
 * Sets paymentStatus to 'paid' and generates a mock payment ID.
 */
const simulatePayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking',
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for a cancelled booking',
      });
    }

    // Generate mock payment ID
    booking.paymentStatus = 'paid';
    booking.paymentId = `PAY_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: {
        paymentId: booking.paymentId,
        amount: booking.totalAmount,
        status: booking.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (admin only) with pagination
 * @route   GET /api/bookings/all
 * @access  Private/Admin
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Booking.countDocuments();
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email')
      .populate('parkingLot', 'name address pricePerHour');

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/bookings/:id/razorpay-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay credentials are not configured on the server. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your server .env file.'
      });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: Math.round(booking.totalAmount * 100), // amount in paisa
      currency: 'INR',
      receipt: booking._id.toString(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay Payment Signature
 * @route   POST /api/bookings/:id/razorpay-verify
 * @access  Private
 */
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay key secret is missing. Cannot verify signature.'
      });
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      booking.paymentStatus = 'paid';
      booking.paymentId = razorpay_payment_id;
      await booking.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified and captured successfully',
        data: {
          paymentId: booking.paymentId,
          status: booking.paymentStatus
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  simulatePayment,
  getAllBookings,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
