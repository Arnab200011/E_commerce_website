/**
 * JWT (JSON Web Token) configuration and utilities
 * Handles token generation, verification, and payload management
 */

import jwt from 'jsonwebtoken';

// Configuration from environment or defaults
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_ISSUER = 'ecommerce-api';

export const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN,
  issuer: JWT_ISSUER
};

/**
 * Generate JWT token for a user
 * Includes role in the JWT payload for RBAC
 * 
 * @param {Object} user - User object or user data
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.role - User role (USER or ADMIN)
 * @param {string} [user.name] - User name (optional)
 * @returns {string} JWT token
 * 
 * @example
 * const token = generateToken(user);
 * // Token payload will include:
 * // { id, email, role, name, iat, exp, iss }
 */
export const generateToken = (user) => {
  if (!user.id || !user.email || !user.role) {
    throw new Error('User must have id, email, and role to generate token');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || ''
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
    subject: user.id.toString(),
    audience: 'ecommerce-users'
  });
};

/**
 * Verify JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 * 
 * @example
 * try {
 *   const decoded = verifyToken(token);
 *   console.log(decoded.role); // 'USER' or 'ADMIN'
 * } catch (error) {
 *   // Token is invalid or expired
 * }
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: 'ecommerce-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

/**
 * Decode token without verification (for debugging only)
 * DO NOT use for authentication
 * 
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Get token expiration time
 * 
 * @param {string} token - JWT token
 * @returns {Date | null} Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 * 
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return new Date() > expiration;
};

export default {
  jwtConfig,
  generateToken,
  verifyToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired
};
