/**
 * Image Upload Middleware
 * Handles multipart/form-data parsing and image validation
 * Uses multer for parsing and sharp for image optimization
 */

import fs from 'fs/promises';
import multer from 'multer';
import os from 'os';
import path from 'path';

// Configuration constants
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TEMP_UPLOAD_DIR = path.join(os.tmpdir(), 'product-uploads');

// Ensure temp directory exists
try {
  await fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true });
} catch (error) {
  console.error('Failed to create temp upload directory:', error.message);
}

/**
 * Multer storage configuration
 * Temporarily stores files in system temp directory
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

/**
 * File filter for multer
 * Validates file type and size
 */
const fileFilter = (req, file, cb) => {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error(
      `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
    error.statusCode = 400;
    return cb(error);
  }

  cb(null, true);
};

/**
 * Multer instance for single image upload
 * Field name: 'image'
 */
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}).single('image');

/**
 * Multer instance for multiple images
 * Field name: 'images'
 */
export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}).array('images', 5); // Max 5 images

/**
 * Cleanup temporary uploaded files
 * Should be called after successful Cloudinary upload
 */
export const cleanupTempFile = async (filepath) => {
  try {
    if (filepath) {
      await fs.unlink(filepath);
    }
  } catch (error) {
    console.warn(`Failed to cleanup temp file: ${filepath}`, error.message);
    // Don't throw - cleanup failure shouldn't break the operation
  }
};

/**
 * Cleanup multiple temporary files
 */
export const cleanupTempFiles = async (filepaths = []) => {
  const results = await Promise.allSettled(
    filepaths.map(fp => cleanupTempFile(fp))
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`Failed to cleanup file at index ${index}: ${result.reason}`);
    }
  });
};

/**
 * Global error handler for multer errors
 * Use this in route error handling
 */
export const handleMulterError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed'
      });
    }
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'File upload failed'
  });
};

export default { uploadImage, uploadImages, cleanupTempFile, cleanupTempFiles };
