const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one review per user per parking lot
reviewSchema.index({ user: 1, parkingLot: 1 }, { unique: true });

/**
 * Post-save hook to recalculate the parking lot's average rating
 * and totalReviews count whenever a new review is saved.
 */
reviewSchema.post('save', async function () {
  try {
    const ParkingLot = mongoose.model('ParkingLot');

    // Aggregate all reviews for this parking lot to compute new average
    const stats = await mongoose.model('Review').aggregate([
      { $match: { parkingLot: this.parkingLot } },
      {
        $group: {
          _id: '$parkingLot',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await ParkingLot.findByIdAndUpdate(this.parkingLot, {
        rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
        totalReviews: stats[0].count,
      });
    }
  } catch (error) {
    console.error('Error updating parking lot rating:', error.message);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
