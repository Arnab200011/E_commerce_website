/**
 * Product model for e-commerce catalog
 * Includes stock management for inventory tracking
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
      index: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },

    // Categorization
    category: {
      type: String,
      trim: true,
      index: true
    },

    brand: {
      type: String,
      trim: true,
      index: true
    },

    // Inventory Management
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      index: true
    },

    minStockLevel: {
      type: Number,
      default: 5,
      description: 'Minimum stock level before low stock warning'
    },

    // Media
    images: {
      type: [String],
      default: []
    },

    // Primary Product Image (Cloudinary URL)
    imageUrl: {
      type: String,
      trim: true,
      default: null,
      description: 'Primary product image URL from Cloudinary'
    },

    // Cloudinary Public ID for image management
    imagePublicId: {
      type: String,
      default: null,
      description: 'Cloudinary public_id for managing image deletion'
    },

    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Admin tracking
    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId,

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for performance
 */
productSchema.index({ name: 'text', description: 'text' }); // Full-text search
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ createdAt: -1 }); // For recent products
productSchema.index({ imageUrl: 1 }); // For image lookups

/**
 * Get stock status
 * @returns {string} 'OUT_OF_STOCK', 'LOW_STOCK', or 'IN_STOCK'
 */
productSchema.methods.getStockStatus = function () {
  if (this.stock === 0) return 'OUT_OF_STOCK';
  if (this.stock < this.minStockLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
};

/**
 * Check if product is in stock
 * @returns {boolean}
 */
productSchema.methods.hasStock = function () {
  return this.stock > 0;
};

/**
 * Check if stock is low
 * @returns {boolean}
 */
productSchema.methods.isLowStock = function () {
  return this.stock < this.minStockLevel;
};

const Product = mongoose.model('Product', productSchema);

export default Product;
