const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['parking_full', 'sensor_failure', 'maintenance', 'payment_failure', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Alert', alertSchema);
