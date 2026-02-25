/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based authorization on protected routes
 * Must be used AFTER authMiddleware
 */

import { PERMISSION_MESSAGES } from '../constants/messages.js';
import { ROLES, getPermissionsForRole } from '../constants/roles.js';

/**
 * Factory function to create role-based access control middleware
 * 
 * @param {string|string[]} allowedRoles - Single role or array of roles that can access route
 * @returns {Function} Middleware function
 * 
 * @example
 * // Single role
 * router.delete('/products/:id', authMiddleware, rbac(ROLES.ADMIN), deleteProduct);
 * 
 * // Multiple roles
 * router.get('/stats', authMiddleware, rbac([ROLES.ADMIN, ROLES.MODERATOR]), getStats);
 * 
 * // Using convenience middleware
 * router.post('/products', authMiddleware, requireAdmin, createProduct);
 */
export const rbac = (allowedRoles = []) => {
  // Normalize to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Verify user is authenticated (authMiddleware must run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: PERMISSION_MESSAGES.UNAUTHORIZED
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      console.warn(
        `[RBAC] Access denied for user ${req.user.email} (${req.user.role}) to ${req.method} ${req.path}`
      );

      return res.status(403).json({
        success: false,
        message: PERMISSION_MESSAGES.ROLE_REQUIRED(roles)
      });
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Convenience middleware to require ADMIN role
 * 
 * @example
 * router.post('/admin/products', authMiddleware, requireAdmin, createProduct);
 */
export const requireAdmin = rbac([ROLES.ADMIN]);

/**
 * Convenience middleware to allow both USER and ADMIN
 * Useful for routes that should be accessible to all authenticated users
 * 
 * @example
 * router.get('/profile', authMiddleware, requireAuthenticated, getProfile);
 */
export const requireAuthenticated = rbac([ROLES.USER, ROLES.ADMIN]);

/**
 * Advanced RBAC with permission checking
 * Allows checking specific permissions instead of just roles
 * 
 * @param {string|string[]} permissions - Required permission(s)
 * @returns {Function} Middleware function
 * 
 * @example
 * router.delete('/products/:id', authMiddleware, requirePermission('delete:products'), deleteProduct);
 */
export const requirePermission = (permissions = []) => {
  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: PERMISSION_MESSAGES.UNAUTHORIZED
      });
    }

    const userPermissions = getPermissionsForRole(req.user.role);
    const hasRequired = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasRequired) {
      console.warn(
        `[RBAC] Permission denied for user ${req.user.email}. Required: ${requiredPermissions.join(', ')}`
      );

      return res.status(403).json({
        success: false,
        message: PERMISSION_MESSAGES.FORBIDDEN
      });
    }

    next();
  };
};

/**
 * Attach user permissions to request object
 * Useful for downstream logic that needs to check permissions
 * 
 * @example
 * router.use(authMiddleware, attachPermissions);
 * // req.permissions is now available
 */
export const attachPermissions = (req, res, next) => {
  if (req.user) {
    req.permissions = getPermissionsForRole(req.user.role);
  }
  next();
};

/**
 * Log role changes for audit trail
 * 
 * @example
 * router.patch('/users/:id/role', authMiddleware, requireAdmin, logRoleChange, updateUserRole);
 */
export const logRoleChange = (req, res, next) => {
  console.log(`[AUDIT] Role change request by ${req.user.email}`, {
    targetUser: req.body.userId,
    newRole: req.body.role,
    timestamp: new Date().toISOString()
  });
  next();
};

export default {
  rbac,
  requireAdmin,
  requireAuthenticated,
  requirePermission,
  attachPermissions,
  logRoleChange
};
