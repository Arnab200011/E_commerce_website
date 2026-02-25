/**
 * Role definitions and constants
 * Centralized role management for RBAC
 */

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.USER]: 'Regular user with shopping and profile access',
  [ROLES.ADMIN]: 'Administrator with full system access'
};

/**
 * Role-based permissions mapping
 * Can be expanded as needed
 */
export const PERMISSIONS = {
  [ROLES.USER]: [
    'read:products',
    'read:product_details',
    'read:profile',
    'write:profile',
    'read:order_history',
    'write:search_history'
  ],
  [ROLES.ADMIN]: [
    // All user permissions
    'read:products',
    'read:product_details',
    'read:profile',
    'write:profile',
    'read:order_history',
    'write:search_history',
    // Admin permissions
    'read:all_products', // With admin metadata
    'write:products',
    'delete:products',
    'read:all_users',
    'write:user_roles',
    'read:analytics',
    'read:inventory_stats'
  ]
};

/**
 * Get permissions for a role
 * @param {string} role - User role (USER or ADMIN)
 * @returns {string[]} Array of permission strings
 */
export const getPermissionsForRole = (role) => {
  return PERMISSIONS[role] || [];
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
};

/**
 * Check if role is valid
 * @param {string} role - Role to validate
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

export default {
  ROLES,
  ROLE_DESCRIPTIONS,
  PERMISSIONS,
  getPermissionsForRole,
  hasPermission,
  isValidRole
};
