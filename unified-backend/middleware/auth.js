/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request object
 * Must be used before any RBAC middleware
 */

import { verifyToken } from '../config/jwt.js';
import { TOKEN_MESSAGES } from '../constants/messages.js';
import User from '../models/User.js';

/**
 * Authentication middleware
 * Validates JWT token and loads user data
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * // Protect a route
 * router.get('/profile', authMiddleware, getProfile);
 * 
 * // After middleware, access user via req.user:
 * // req.user = { id, email, role, name }
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: TOKEN_MESSAGES.NO_TOKEN
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: TOKEN_MESSAGES.NO_TOKEN
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user by ID from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User account is inactive.'
      });
    }

    // Check email verification (optional, can be made configurable)
    if (!user.isEmailVerified) {
      // Optionally allow unverified users
      // Uncomment line below to enforce email verification
      // return res.status(403).json({
      //   success: false,
      //   message: 'Please verify your email address before accessing this resource.'
      // });
    }

    // Attach user to request object
    // Include role for RBAC middleware
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      isEmailVerified: user.isEmailVerified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    // Provide user-friendly error messages
    const message =
      error.message === 'Token has expired'
        ? 'Your session has expired. Please login again.'
        : error.message === 'Invalid token'
        ? TOKEN_MESSAGES.INVALID_TOKEN
        : TOKEN_MESSAGES.INVALID_TOKEN;

    return res.status(401).json({
      success: false,
      message
    });
  }
};

/**
 * Optional: Verify token without loading user (lighter weight)
 * Useful if you only need role information
 */
export const verifyTokenOnly = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: TOKEN_MESSAGES.NO_TOKEN
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Attach minimal user info from token
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: TOKEN_MESSAGES.INVALID_TOKEN
    });
  }
};

export default authMiddleware;
