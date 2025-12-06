import express from 'express';
import {
  register,
  login,
  verifyEmail,
  getProfile,
  registerValidation,
  loginValidation
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email address
 * @access  Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, getProfile);

export default router;
