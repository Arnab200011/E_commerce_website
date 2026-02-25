/**
 * Admin routes
 * All admin-exclusive endpoints for system management
 * All routes require ADMIN role
 */

import express from 'express';
import * as adminProductController from '../controllers/adminController/adminProductController.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { handleMulterError, uploadImage } from '../middleware/upload.js';

const router = express.Router();

/**
 * Apply authentication and admin check to all admin routes
 * Any route under /api/admin/* requires:
 * 1. Valid JWT token (authMiddleware)
 * 2. ADMIN role (requireAdmin)
 */
router.use(authMiddleware);
router.use(requireAdmin);

// ==========================================
// PRODUCT MANAGEMENT ENDPOINTS
// ==========================================

/**
 * @route   GET /api/admin/products
 * @desc    Get all products (admin view with stock details)
 * @access  Private (ADMIN only)
 * @query   page=1
 * @query   pageSize=50
 * @query   category=electronics
 * @query   brand=Apple
 * @query   lowStock=10
 * @query   search=keyword
 * @query   active=true
 */
router.get('/products', adminProductController.getAllProductsAdmin);

/**
 * @route   GET /api/admin/products/:id/stock
 * @desc    Get detailed stock information for a product
 * @access  Private (ADMIN only)
 * @param   id - Product ID
 */
router.get('/products/:id/stock', adminProductController.getProductStock);

/**
 * @route   POST /api/admin/products
 * @desc    Create a new product with optional image upload
 * @access  Private (ADMIN only)
 * @body    name, price, description, category, brand, stock
 * @file    image (optional) - multipart file upload
 * @note    Accepts both application/json and multipart/form-data
 */
router.post(
  '/products',
  uploadImage,
  handleMulterError,
  adminProductController.validateProductInput,
  adminProductController.createProductAdmin
);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product details with optional image replacement
 * @access  Private (ADMIN only)
 * @param   id - Product ID
 * @body    name, price, description, category, brand, isActive
 * @file    image (optional) - multipart file upload
 * @query   deleteImage=true - to remove existing image
 * @note    Accepts both application/json and multipart/form-data
 */
router.put(
  '/products/:id',
  uploadImage,
  handleMulterError,
  adminProductController.validateProductInput,
  adminProductController.updateProductAdmin
);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete (deactivate) a product
 * @access  Private (ADMIN only)
 * @param   id - Product ID
 */
router.delete('/products/:id', adminProductController.deleteProductAdmin);

/**
 * @route   PATCH /api/admin/products/:id/restock
 * @desc    Increment product stock (restock operation)
 * @access  Private (ADMIN only)
 * @param   id - Product ID
 * @body    quantity (required), reason (optional)
 */
router.patch(
  '/products/:id/restock',
  adminProductController.validateRestockInput,
  adminProductController.restockProduct
);

// ==========================================
// ANALYTICS & STATS ENDPOINTS
// ==========================================

/**
 * @route   GET /api/admin/stats/inventory
 * @desc    Get inventory statistics and metrics
 * @access  Private (ADMIN only)
 * @returns  Overview stats and category breakdown
 */
router.get('/stats/inventory', adminProductController.getInventoryStats);

export default router;
