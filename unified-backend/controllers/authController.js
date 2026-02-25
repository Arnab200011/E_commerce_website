/**
 * Authentication controller
 * Handles user registration, login, and profile management
 */

import { body, validationResult } from 'express-validator';
import { generateToken } from '../config/jwt.js';
import { AUTH_MESSAGES, VALIDATION_MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';
import User from '../models/User.js';

/**
 * POST /api/auth/register
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: VALIDATION_MESSAGES.VALIDATION_FAILED,
        errors: errors.array()
      });
    }

    const { name, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: AUTH_MESSAGES.USER_EXISTS
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      role: ROLES.USER // Default role
    });

    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(201).json({
      success: true,
      message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user'
    });
  }
};

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
export const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: VALIDATION_MESSAGES.VALIDATION_FAILED,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email and select password field
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.INVALID_PASSWORD
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.INVALID_PASSWORD
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: AUTH_MESSAGES.ACCOUNT_INACTIVE
      });
    }

    // Record login
    await user.recordLogin(
      req.ip || req.connection.remoteAddress,
      req.headers['user-agent']
    );

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(200).json({
      success: true,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // Include role for frontend routing
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * POST /api/auth/verify-email
 * Verify email address (if implemented)
 */
export const verifyEmail = async (req, res) => {
  // TODO: Implement email verification logic
  res.status(501).json({
    success: false,
    message: 'Email verification not yet implemented'
  });
};

/**
 * Validation rules for registration
 */
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage(AUTH_MESSAGES.INVALID_EMAIL)
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage(AUTH_MESSAGES.PASSWORD_TOO_SHORT)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(AUTH_MESSAGES.PASSWORD_WEAK),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
];

/**
 * Validation rules for login
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage(AUTH_MESSAGES.INVALID_EMAIL)
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage(AUTH_MESSAGES.PASSWORD_REQUIRED)
];

export default {
  register,
  login,
  getProfile,
  verifyEmail,
  registerValidation,
  loginValidation
};
