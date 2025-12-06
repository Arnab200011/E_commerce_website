import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  productValidation
} from '../controllers/productController.js';
import { searchProducts } from '../controllers/searchController.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

/**
 * @route   GET /api/products/search
 * @desc    Search products by keyword and save to user's search history
 * @access  Private (USER or ADMIN)
 */
router.get('/search', authMiddleware, searchProducts);

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination
 * @access  Public
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (ADMIN only)
 */
router.post('/', authMiddleware, requireAdmin, productValidation, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (ADMIN only)
 */
router.put('/:id', authMiddleware, requireAdmin, productValidation, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (ADMIN only)
 */
router.delete('/:id', authMiddleware, requireAdmin, deleteProduct);

export default router;
