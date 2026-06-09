const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type: String, // Profile picture URL or fallback
    },
    phone: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 10, // Give new sign-ups 10 points!
    },
    promoCodesUsed: [
      {
        type: String,
      }
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingLot',
      },
    ],
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple users to have undefined/null googleId
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    vehicles: [
      {
        vehicleNumber: { type: String, uppercase: true, trim: true },
        vehicleType: { type: String, enum: ['car', 'bike', 'suv'], default: 'car' },
      }
    ],
    staffRole: {
      type: String,
      enum: ['none', 'super_admin', 'parking_manager', 'operations_staff', 'security_personnel'],
      default: 'none',
    },
    permissions: [
      {
        type: String,
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password instance method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
