const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: [true, 'Parking lot is required'],
    },
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'suv'],
      default: 'car',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number, // Duration in hours
    },
    totalAmount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: String, // Simulated payment reference
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to auto-calculate duration and total amount.
 * Duration = difference between endTime and startTime in hours (rounded up).
 * TotalAmount = duration * parkingLot's pricePerHour.
 */
bookingSchema.pre('save', async function (next) {
  try {
    if (this.startTime && this.endTime) {
      const diffMs = new Date(this.endTime) - new Date(this.startTime);
      // Calculate duration in hours, rounded up to the nearest hour
      this.duration = Math.ceil(diffMs / (1000 * 60 * 60));

      // Calculate totalAmount if it's not set, or if the times were modified on an existing booking
      const timeModified = this.isModified('startTime') || this.isModified('endTime');
      const isNewWithNoAmount = this.isNew && (this.totalAmount === undefined || this.totalAmount === null);
      const isExistingWithTimeModified = !this.isNew && timeModified;

      if (isNewWithNoAmount || isExistingWithTimeModified) {
        const ParkingLot = mongoose.model('ParkingLot');
        const lot = await ParkingLot.findById(this.parkingLot);
        if (lot) {
          this.totalAmount = this.duration * lot.pricePerHour;
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
