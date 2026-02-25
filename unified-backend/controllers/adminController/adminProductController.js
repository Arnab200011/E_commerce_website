/**
 * Admin Product Controller
 * Handles admin-exclusive product management
 * Includes inventory management, stock updates, and product CRUD
 */

import { body, validationResult } from 'express-validator';
import { PRODUCT_MESSAGES, STOCK_MESSAGES } from '../../constants/messages.js';
import { cleanupTempFile } from '../../middleware/upload.js';
import Product from '../../models/Product.js';
import {
    deleteFromCloudinary,
    uploadToCloudinary
} from '../../utils/cloudinaryUtils.js';

/**
 * GET /api/admin/products
 * Get all products with admin metadata (includes stock details)
 */
export const getAllProductsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const skip = (page - 1) * pageSize;

    // Build filters
    const filters = {};

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.brand) {
      filters.brand = req.query.brand;
    }

    if (req.query.lowStock) {
      const threshold = parseInt(req.query.lowStock);
      filters.stock = { $lt: threshold };
    }

    if (req.query.search) {
      filters.$text = { $search: req.query.search };
    }

    if (req.query.active !== undefined) {
      filters.isActive = req.query.active === 'true';
    }

    // Get total count
    const total = await Product.countDocuments(filters);

    // Fetch products
    const products = await Product.find(filters)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('+stock'); // Ensure stock is included

    // Enrich products with stock status
    const enrichedProducts = products.map((product) => ({
      ...product.toObject(),
      stockStatus: product.getStockStatus(),
      isLowStock: product.isLowStock()
    }));

    res.status(200).json({
      success: true,
      data: enrichedProducts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({
      success: false,
      message: PRODUCT_MESSAGES.INVALID_PRODUCT_DATA
    });
  }
};

/**
 * GET /api/admin/products/:id/stock
 * Get detailed stock information for a product
 */
export const getProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        currentStock: product.stock,
        minStockLevel: product.minStockLevel,
        status: product.getStockStatus(),
        hasStock: product.hasStock(),
        isLowStock: product.isLowStock(),
        lastUpdated: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Admin get stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock information'
    });
  }
};

/**
 * POST /api/admin/products
 * Create new product with optional image upload
 * Accepts: application/json OR multipart/form-data
 */
export const createProductAdmin = async (req, res) => {
  let tempFilePath = null;

  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Cleanup uploaded file if validation fails
      if (req.file) {
        await cleanupTempFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, category, brand, stock, images } = req.body;
    tempFilePath = req.file?.path;

    // Initialize product data
    const productData = {
      name,
      description,
      price,
      category,
      brand,
      stock: stock || 0,
      images: images || [],
      createdBy: req.user.id,
      isActive: true
    };

    // Handle image upload if file is provided
    if (tempFilePath) {
      const uploadResult = await uploadToCloudinary(tempFilePath, {
        folder: 'products',
        tags: ['product-primary', name]
      });

      if (uploadResult.success) {
        productData.imageUrl = uploadResult.secure_url;
        productData.imagePublicId = uploadResult.public_id;
        console.log(`✅ Image uploaded: ${uploadResult.secure_url}`);
      } else {
        // Log error but continue - image failure shouldn't block product creation
        console.error(`⚠️ Image upload failed: ${uploadResult.message}`);
      }
    }

    // Create product
    const product = new Product(productData);
    await product.save();

    // Cleanup temp file
    if (tempFilePath) {
      await cleanupTempFile(tempFilePath);
    }

    res.status(201).json({
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT_CREATED,
      data: product
    });
  } catch (error) {
    // Cleanup on error
    if (tempFilePath) {
      await cleanupTempFile(tempFilePath);
    }

    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

/**
 * PUT /api/admin/products/:id
 * Update product details with optional image replacement
 */
export const updateProductAdmin = async (req, res) => {
  let tempFilePath = null;

  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Cleanup uploaded file if validation fails
      if (req.file) {
        await cleanupTempFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, category, brand, images, isActive, deleteImage } = req.body;
    tempFilePath = req.file?.path;

    // Get existing product to check for old image
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      // Cleanup if product not found
      if (tempFilePath) {
        await cleanupTempFile(tempFilePath);
      }
      return res.status(404).json({
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    // Initialize update data
    const updateData = {
      name,
      description,
      price,
      category,
      brand,
      images,
      isActive,
      updatedBy: req.user.id
    };

    // Handle image deletion request
    if (deleteImage === 'true' && existingProduct.imagePublicId) {
      await deleteFromCloudinary(existingProduct.imagePublicId);
      updateData.imageUrl = null;
      updateData.imagePublicId = null;
      console.log(`✅ Image deleted: ${existingProduct.imagePublicId}`);
    }

    // Handle new image upload
    if (tempFilePath) {
      // Delete old image if exists
      if (existingProduct.imagePublicId) {
        await deleteFromCloudinary(existingProduct.imagePublicId);
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary(tempFilePath, {
        folder: 'products',
        tags: ['product-primary', name || existingProduct.name]
      });

      if (uploadResult.success) {
        updateData.imageUrl = uploadResult.secure_url;
        updateData.imagePublicId = uploadResult.public_id;
        console.log(`✅ Image updated: ${uploadResult.secure_url}`);
      } else {
        console.error(`⚠️ Image upload failed: ${uploadResult.message}`);
      }
    }

    // Update product
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    // Cleanup temp file
    if (tempFilePath) {
      await cleanupTempFile(tempFilePath);
    }

    res.status(200).json({
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT_UPDATED,
      data: product
    });
  } catch (error) {
    // Cleanup on error
    if (tempFilePath) {
      await cleanupTempFile(tempFilePath);
    }

    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

/**
 * DELETE /api/admin/products/:id
 * Delete (deactivate) product and associated image
 */
export const deleteProductAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    // Delete associated image from Cloudinary
    if (product.imagePublicId) {
      await deleteFromCloudinary(product.imagePublicId);
      console.log(`✅ Product image deleted from Cloudinary: ${product.imagePublicId}`);
    }

    // Soft delete - set isActive to false
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user.id },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT_DELETED,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

/**
 * PATCH /api/admin/products/:id/restock
 * Increment product stock (restock operation)
 */
export const restockProduct = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { quantity, reason } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { stock: quantity },
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    res.status(200).json({
      success: true,
      message: STOCK_MESSAGES.STOCK_UPDATED(quantity),
      data: {
        productId: product._id,
        name: product.name,
        previousStock: product.stock - quantity,
        newStock: product.stock,
        stockStatus: product.getStockStatus(),
        reason: reason || 'Restock',
        timestamp: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Restock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restock product'
    });
  }
};

/**
 * GET /api/admin/stats/inventory
 * Get inventory statistics and metrics
 */
export const getInventoryStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgStock: { $avg: '$stock' },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] }
          },
          totalValue: {
            $sum: { $multiply: ['$stock', '$price'] }
          }
        }
      }
    ]);

    const data = stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      avgStock: 0,
      outOfStock: 0,
      lowStock: 0,
      totalValue: 0
    };

    // Get category-wise breakdown
    const categoryBreakdown = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { totalStock: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: data,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory stats'
    });
  }
};

/**
 * Validation rules for product creation/update
 */
export const validateProductInput = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('category').optional().trim(),

  body('brand').optional().trim(),

  body('description').optional().trim(),

  body('images').optional().isArray().withMessage('Images must be an array')
];

/**
 * Validation rules for restock operation
 */
export const validateRestockInput = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage(STOCK_MESSAGES.INVALID_QUANTITY),

  body('reason').optional().trim()
];

export default {
  getAllProductsAdmin,
  getProductStock,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  restockProduct,
  getInventoryStats,
  validateProductInput,
  validateRestockInput
};
