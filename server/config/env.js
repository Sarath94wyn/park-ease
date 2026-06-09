const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/parking-lot-finder',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_change_in_production',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};

module.exports = config;
