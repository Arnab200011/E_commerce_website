/**
 * Server entry point
 * Initializes database connection and starts Express server
 */

import dotenv from 'dotenv';
import app from './app.js';
import connectDB, { setupConnectionHandlers } from './config/database.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file or environment configuration');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Setup connection handlers
    setupConnectionHandlers();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Unified Backend Server Running`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Start the server
startServer();
