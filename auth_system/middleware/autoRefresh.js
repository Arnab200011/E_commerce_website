const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const autoRefreshMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = user;
      }
      next();
    } catch (error) {
      // Token expired, try to refresh
      if (error.name === 'TokenExpiredError' && req.cookies.refreshToken) {
        // Trigger refresh token endpoint internally
        req.url = '/auth/refresh-token';
        req.method = 'POST';
        next();
      } else {
        next();
      }
    }
  } catch (error) {
    next();
  }
};

module.exports = autoRefreshMiddleware;
