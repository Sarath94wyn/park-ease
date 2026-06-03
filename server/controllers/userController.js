const User = require('../models/User');

/**
 * @desc    Update current user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a parking lot to user's favorites
 * @route   POST /api/users/favorites/:lotId
 * @access  Private
 */
const addFavorite = async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const user = await User.findById(req.user._id);

    // Avoid duplicates — use $addToSet semantics
    if (user.favorites.includes(lotId)) {
      return res.status(400).json({
        success: false,
        message: 'Parking lot is already in favorites',
      });
    }

    user.favorites.push(lotId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Added to favorites',
      data: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a parking lot from user's favorites
 * @route   DELETE /api/users/favorites/:lotId
 * @access  Private
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { lotId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: lotId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
      data: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's favorite parking lots
 * @route   GET /api/users/favorites
 * @access  Private
 */
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites',
        select: 'name address pricePerHour rating totalReviews amenities images availableSlots totalSlots location',
        match: { isActive: true },
      });

    const activeFavorites = (user.favorites || []).filter(f => f !== null);

    res.status(200).json({
      success: true,
      count: activeFavorites.length,
      data: activeFavorites,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
};
