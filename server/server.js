const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();

// =========================================================================
// Connect to MongoDB
// =========================================================================
connectDB();

// =========================================================================
// Global Middleware
// =========================================================================

// Security headers
app.use(helmet());

// HTTP request logging (dev format)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// CORS — allow frontend origin with credentials
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Body parser — JSON with 10MB limit for image URLs etc.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =========================================================================
// API Routes
// =========================================================================
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Parking Lot Finder API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// =========================================================================
// Global Error Handler (must be last middleware)
// =========================================================================
app.use(errorHandler);

// =========================================================================
// Start Server
// =========================================================================
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS origin: ${config.clientUrl}\n`);
});

// =========================================================================
// Handle Unhandled Promise Rejections
// =========================================================================
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server gracefully and exit
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
