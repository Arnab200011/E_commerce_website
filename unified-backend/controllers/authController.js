/**
 * Authentication controller
 * Handles user registration, login, and profile management
 */

import { body, validationResult } from 'express-validator';
import { generateRefreshToken, generateToken, verifyRefreshToken } from '../config/jwt.js';
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

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      id: user._id
    });

    // Save refresh token to database
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
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

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      id: user._id
    });

    // Save refresh token to database
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    });
    
    // Keep only last 5 refresh tokens per user
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
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
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token from cookie
 */
export const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenFromCookie);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    // Find user and check if refresh token exists in database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if refresh token is in user's refresh tokens array
    const tokenExists = user.refreshTokens.some(
      (rt) => rt.token === refreshTokenFromCookie
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or has been revoked'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken({
      id: user._id
    });

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== refreshTokenFromCookie
    );
    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date()
    });

    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout user from current device (invalidate single refresh token)
 */
export const logout = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshTokenFromCookie = req.cookies.refreshToken;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND
      });
    }

    // Remove the specific refresh token from database
    if (refreshTokenFromCookie) {
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => rt.token !== refreshTokenFromCookie
      );
      await user.save();
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: AUTH_MESSAGES.LOGOUT_SUCCESS
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
};

/**
 * POST /api/auth/logout-all
 * Logout user from all devices (invalidate all refresh tokens)
 */
export const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user and clear all refresh tokens
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: AUTH_MESSAGES.USER_NOT_FOUND
      });
    }

    // Clear all refresh tokens
    user.refreshTokens = [];
    await user.save();

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout from all devices'
    });
  }
};

/**
 * GET /api/auth/profile
 * Get current user profile (alias for /me)
 */
export const getProfileAlias = async (req, res) => {
  return getProfile(req, res);
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
  getProfileAlias,
  verifyEmail,
  refreshToken,
  logout,
  logoutAll,
  registerValidation,
  loginValidation
};
