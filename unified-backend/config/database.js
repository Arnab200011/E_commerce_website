/**
 * MongoDB connection configuration
 * Handles database connection with error handling
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      // Connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Make sure MongoDB is running and MONGODB_URI is correct');
    process.exit(1);
  }
};

/**
 * Handle mongoose connection events
 */
export const setupConnectionHandlers = () => {
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
  });

  process.on('SIGINT', async () => {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
  });
};

export default connectDB;
