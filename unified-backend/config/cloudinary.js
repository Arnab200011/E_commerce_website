/**
 * Cloudinary Configuration
 * Handles image upload to Cloudinary
 * 
 * Environment variables required:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const validateCloudinaryConfig = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn(
      '⚠️ WARNING: Cloudinary environment variables are not fully configured. Image uploads will be disabled.'
    );
    return false;
  }

  return true;
};

// Configure Cloudinary
if (validateCloudinaryConfig()) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  console.log('✅ Cloudinary configured successfully');
}

export default cloudinary.v2;
