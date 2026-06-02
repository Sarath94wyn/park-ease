const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['compact', 'standard', 'large', 'handicap', 'ev'],
      default: 'standard',
    },
    floor: {
      type: Number,
      default: 1,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const parkingLotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parking lot name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    description: {
      type: String,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — GeoJSON format
        required: true,
      },
    },
    totalSlots: {
      type: Number,
      required: [true, 'Total slots count is required'],
      min: [1, 'Must have at least 1 slot'],
    },
    availableSlots: {
      type: Number,
      default: 0,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price cannot be negative'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '23:00' },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    slots: [slotSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for geospatial queries (find nearby parking lots)
parkingLotSchema.index({ location: '2dsphere' });

// Text index for search functionality
parkingLotSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
