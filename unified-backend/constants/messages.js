/**
 * Centralized server messages and error messages
 * Used throughout the application for consistency
 */

export const AUTH_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  INVALID_EMAIL: 'Please provide a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, and numbers',
  USER_EXISTS: 'User already exists with this email',
  USER_NOT_FOUND: 'User not found',
  INVALID_PASSWORD: 'Invalid email or password',
  ACCOUNT_INACTIVE: 'User account is inactive',
  REGISTRATION_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully'
};

export const TOKEN_MESSAGES = {
  NO_TOKEN: 'No token provided. Please authenticate',
  INVALID_TOKEN_FORMAT: 'Invalid token format. Use Bearer token',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  REFRESH_SUCCESS: 'Token refreshed successfully'
};

export const PERMISSION_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied. Insufficient permissions',
  ADMIN_REQUIRED: 'Access denied. Admin privileges required',
  ROLE_REQUIRED: (roles) => `Access denied. Required role(s): ${roles.join(', ')}`
};

export const PRODUCT_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCTS_FETCHED: 'Products fetched successfully',
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  INVALID_PRODUCT_DATA: 'Invalid product data',
  STOCK_INSUFFICIENT: 'Insufficient stock available'
};

export const STOCK_MESSAGES = {
  STOCK_UPDATED: (quantity) => `Stock updated by ${quantity} units`,
  OUT_OF_STOCK: 'Product is out of stock',
  LOW_STOCK: 'Product has low stock',
  RESTOCK_SUCCESS: 'Product restocked successfully',
  INVALID_QUANTITY: 'Quantity must be a positive integer'
};

export const VALIDATION_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input provided',
  REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_FORMAT: (field) => `${field} has invalid format`
};

export const GENERAL_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred',
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists'
};

export default {
  AUTH_MESSAGES,
  TOKEN_MESSAGES,
  PERMISSION_MESSAGES,
  PRODUCT_MESSAGES,
  STOCK_MESSAGES,
  VALIDATION_MESSAGES,
  GENERAL_MESSAGES
};
