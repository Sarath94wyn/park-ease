const ParkingLot = require('../models/ParkingLot');

/**
 * Helper: Auto-generate slot labels (A1-A10, B1-B10, C1-C10, etc.)
 * based on the total number of slots.
 */
const generateSlots = (totalSlots) => {
  const slots = [];
  const slotsPerRow = 10;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < totalSlots; i++) {
    const rowIndex = Math.floor(i / slotsPerRow);
    const slotIndex = (i % slotsPerRow) + 1;
    const letter = letters[rowIndex] || `${letters[Math.floor(rowIndex / 26)]}${letters[rowIndex % 26]}`;
    slots.push({
      slotNumber: `${letter}${slotIndex}`,
      type: 'standard',
      floor: Math.floor(rowIndex / 2) + 1,
      isOccupied: false,
    });
  }

  return slots;
};

/**
 * @desc    Get all parking lots with filtering, search, and pagination
 * @route   GET /api/parking
 * @access  Public
 */
const getAllParkingLots = async (req, res, next) => {
  try {
    const {
      amenities,
      minPrice,
      maxPrice,
      available,
      search,
      lat,
      lng,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    // Filter by amenities (comma-separated)
    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim());
      query.amenities = { $all: amenityList };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    // Filter to only lots with available slots
    if (available === 'true') {
      query.availableSlots = { $gt: 0 };
    }

    // Text search by name or address
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    let sortOption = { createdAt: -1 };

    // If lat/lng provided, sort by distance using $near
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
        },
      };
      // $near implicitly sorts by distance, so remove other sorts
      sortOption = {};
    }

    const total = await ParkingLot.countDocuments(
      lat && lng ? { ...query, location: undefined, isActive: true } : query
    );

    const parkingLots = await ParkingLot.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select('-slots -__v')
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: parkingLots.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: parkingLots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single parking lot by ID
 * @route   GET /api/parking/:id
 * @access  Public
 */
const getParkingLotById = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id)
      .populate('owner', 'name email');

    if (!parkingLot || !parkingLot.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found',
      });
    }

    res.status(200).json({
      success: true,
      data: parkingLot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Find nearby parking lots using geospatial query
 * @route   GET /api/parking/nearby
 * @access  Public
 *
 * Expects query params: lat, lng, radius (in meters, default 5000)
 */
const getNearbyParkingLots = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Convert radius from meters to radians for $centerSphere
    // Earth's radius ≈ 6378100 meters
    const radiusInRadians = Number(radius) / 6378100;

    const parkingLots = await ParkingLot.find({
      isActive: true,
      location: {
        $geoWithin: {
          $centerSphere: [
            [Number(lng), Number(lat)],
            radiusInRadians,
          ],
        },
      },
    }).select('-slots -__v');

    res.status(200).json({
      success: true,
      count: parkingLots.length,
      data: parkingLots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search parking lots by name or address
 * @route   GET /api/parking/search
 * @access  Public
 */
const searchParkingLots = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const parkingLots = await ParkingLot.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
      ],
    }).select('-slots -__v');

    res.status(200).json({
      success: true,
      count: parkingLots.length,
      data: parkingLots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new parking lot (admin only)
 * @route   POST /api/parking
 * @access  Private/Admin
 *
 * Auto-generates the slots array from totalSlots count.
 */
const createParkingLot = async (req, res, next) => {
  try {
    const {
      name,
      address,
      description,
      location,
      totalSlots,
      pricePerHour,
      amenities,
      images,
      operatingHours,
    } = req.body;

    // Auto-generate slot labels
    const slots = generateSlots(totalSlots);

    const parkingLot = await ParkingLot.create({
      name,
      address,
      description,
      location,
      totalSlots,
      availableSlots: totalSlots, // All slots start as available
      pricePerHour,
      amenities,
      images,
      operatingHours,
      slots,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Parking lot created successfully',
      data: parkingLot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a parking lot (admin only)
 * @route   PUT /api/parking/:id
 * @access  Private/Admin
 */
const updateParkingLot = async (req, res, next) => {
  try {
    let parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found',
      });
    }

    parkingLot = await ParkingLot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Parking lot updated successfully',
      data: parkingLot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete a parking lot (admin only)
 * @route   DELETE /api/parking/:id
 * @access  Private/Admin
 *
 * Sets isActive to false instead of removing the document,
 * preserving booking history and data integrity.
 */
const deleteParkingLot = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found',
      });
    }

    parkingLot.isActive = false;
    await parkingLot.save();

    res.status(200).json({
      success: true,
      message: 'Parking lot deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllParkingLots,
  getParkingLotById,
  getNearbyParkingLots,
  searchParkingLots,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
};
