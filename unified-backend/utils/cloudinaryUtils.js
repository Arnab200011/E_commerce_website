/**
 * Cloudinary Upload Utilities
 * Handles image upload, deletion, and URL generation
 */

import cloudinary from '../config/cloudinary.js';

/**
 * Upload image to Cloudinary
 * @param {string} filepath - Local file path to upload
 * @param {object} options - Upload options
 * @returns {object} Upload result with secure_url and public_id
 */
export const uploadToCloudinary = async (
  filepath,
  options = {}
) => {
  try {
    if (!cloudinary.config().cloud_name) {
      throw new Error('Cloudinary is not configured');
    }

    const defaultOptions = {
      folder: 'products',
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      timeout: 60000
    };

    const uploadOptions = { ...defaultOptions, ...options };

    const result = await cloudinary.uploader.upload(filepath, uploadOptions);

    return {
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to upload image to Cloudinary'
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {object} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!cloudinary.config().cloud_name) {
      console.warn('Cloudinary not configured - skipping deletion');
      return { success: true };
    }

    if (!publicId) {
      return { success: true }; // Nothing to delete
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      timeout: 30000
    });

    if (result.result === 'ok') {
      return { success: true, deleted: true };
    }

    return { success: true, deleted: false };
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    // Don't throw - deletion failure should not break the operation
    return { success: false, error: error.message };
  }
};

/**
 * Extract public_id from Cloudinary secure_url
 * URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
 * @param {string} secureUrl - The secure URL from Cloudinary
 * @returns {string} Public ID
 */
export const extractPublicIdFromUrl = (secureUrl) => {
  if (!secureUrl || typeof secureUrl !== 'string') {
    return null;
  }

  try {
    const match = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\./);
    return match ? match[1] : null;
  } catch (error) {
    console.warn('Failed to extract public_id from URL:', error.message);
    return null;
  }
};

/**
 * Transform Cloudinary URL for different sizes/formats
 * @param {string} secureUrl - The secure URL
 * @param {object} transformation - Transformation options
 * @returns {string} Transformed URL
 */
export const getTransformedUrl = (secureUrl, transformation = {}) => {
  if (!secureUrl) {
    return null;
  }

  // Default transformations for product thumbnails
  const defaults = {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  };

  const options = { ...defaults, ...transformation };

  try {
    // Insert transformation string before the public_id
    const url = new URL(secureUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');

    if (uploadIndex === -1) {
      return secureUrl;
    }

    // Build transformation string
    const transformString = Object.entries(options)
      .map(([key, value]) => {
        if (key === 'width') return `w_${value}`;
        if (key === 'height') return `h_${value}`;
        if (key === 'crop') return `c_${value}`;
        if (key === 'quality') return `q_${value}`;
        if (key === 'format') return `f_${value}`;
        return `${key}_${value}`;
      })
      .join(',');

    pathParts.splice(uploadIndex + 1, 0, transformString);
    url.pathname = pathParts.join('/');

    return url.toString();
  } catch (error) {
    console.warn('Failed to generate transformed URL:', error.message);
    return secureUrl;
  }
};

/**
 * Validate if image URL is from Cloudinary
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export const isCloudinaryUrl = (url) => {
  if (!url) return false;
  return url.includes('res.cloudinary.com') && url.includes('secure_url');
};

/**
 * Get image metadata from Cloudinary URL
 * @param {string} secureUrl - The secure URL
 * @returns {object} Metadata object
 */
export const getImageMetadata = async (secureUrl) => {
  try {
    if (!secureUrl) {
      return null;
    }

    const publicId = extractPublicIdFromUrl(secureUrl);
    if (!publicId) {
      return null;
    }

    const result = await cloudinary.api.resource(publicId, {
      timeout: 30000
    });

    return {
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      createdAt: result.created_at,
      secureUrl: result.secure_url
    };
  } catch (error) {
    console.warn('Failed to get image metadata:', error.message);
    return null;
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  getTransformedUrl,
  isCloudinaryUrl,
  getImageMetadata
};
