import express from 'express';
import { getSearchHistory } from '../controllers/searchController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/search-history
 * @desc    Get user's last 5 search queries
 * @access  Private (USER or ADMIN)
 */
router.get('/', authMiddleware, getSearchHistory);

export default router;
