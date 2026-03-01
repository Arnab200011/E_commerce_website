/**
 * Authentication routes
 * Handles user registration, login, and profile operations
 */

import express from 'express';
import {
    getProfile,
    getProfileAlias,
    login,
    loginValidation,
    logout,
    logoutAll,
    refreshToken,
    register,
    registerValidation
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
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, getProfile);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile (alias for /me)
 * @access  Private
 */
router.get('/profile', authMiddleware, getProfileAlias);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token from cookie
 * @access  Public (but requires valid refresh token in cookie)
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user from current device
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout user from all devices
 * @access  Private
 */
router.post('/logout-all', authMiddleware, logoutAll);

export default router;
