/**
 * Admin authorization middleware
 * Must be used after authMiddleware
 * Ensures the authenticated user has ADMIN role
 */
export const requireAdmin = (req, res, next) => {
  // Check if user exists and has been set by authMiddleware
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Check if user has ADMIN role
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};
