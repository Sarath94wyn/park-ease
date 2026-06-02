const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB Atlas using mongoose.
 * Handles connection lifecycle events and logs status.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('📦 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown on app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
