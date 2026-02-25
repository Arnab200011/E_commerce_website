# Backend Refactoring & RBAC Implementation Guide

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Architecture Overview](#architecture-overview)
4. [Migration Strategy](#migration-strategy)
5. [Implementation Details](#implementation-details)
6. [API Contracts (Backward Compatibility)](#api-contracts-backward-compatibility)
7. [Deployment Checklist](#deployment-checklist)
8. [Scalability & Best Practices](#scalability--best-practices)

---

## Executive Summary

This refactoring unifies two separate backend systems (`auth_system` and `backend`) into a single, modular, production-grade architecture with:

✅ **Role-Based Access Control (RBAC)** - USER and ADMIN roles  
✅ **Backward Compatibility** - All existing APIs remain functional  
✅ **Enhanced Security** - Server-side enforcement, role validation  
✅ **Scalable Architecture** - Modular design for future growth  
✅ **Zero Frontend Disruption** - No breaking changes to existing flows  

---

## Current State Analysis

### 📁 Existing Structure

```
auth_system/                    backend/
├── server.js (CommonJS)        ├── server.js (ES6)
├── config/database.js          ├── app.js
├── controllers/                ├── config/
├── middleware/auth.js          ├── controllers/
├── models/User.js              ├── middleware/auth.js + requireAdmin.js
├── routes/auth.js              ├── models/User.js + Product.js
└── utils/jwt.js                ├── routes/
```

### 🔴 Problems with Current Approach

1. **Dual Systems**: Auth and product logic separated
2. **Module Inconsistency**: CommonJS vs ES6 modules
3. **Role Normalization**: Different role values ('user' vs 'USER')
4. **No Centralized RBAC**: Ad-hoc role checks in routes
5. **Maintenance Burden**: Changes must be made in two places
6. **Scalability Issues**: Difficult to add new features consistently

### ✅ What's Already Good

- **Role field exists** in both User models
- **JWT tokens** already include role information
- **Auth middleware** validates token and user
- **Admin examples** exist in both systems
- **Product model** has stock field for restock feature

---

## Architecture Overview

### 🎯 Unified Backend Structure

```
unified-backend/
├── server.js                          # Entry point
├── app.js                             # Express app setup
├── .env.example                       # Environment variables
│
├── config/                            # Configuration
│   ├── database.js                    # MongoDB connection
│   ├── jwt.js                         # JWT utilities
│   └── constants.js                   # App constants
│
├── middleware/                        # Request processing
│   ├── auth.js                        # Authentication middleware
│   ├── rbac.js                        # Role-based access control
│   ├── errorHandler.js                # Error handling
│   └── requestLogger.js               # Request logging
│
├── models/                            # Database schemas
│   ├── User.js                        # User model with roles
│   ├── Product.js                     # Product model
│   └── SearchHistory.js               # Search history tracking
│
├── controllers/                       # Business logic
│   ├── authController.js              # Auth operations
│   ├── productController.js           # User product operations
│   ├── adminController/
│   │   ├── adminProductController.js  # Admin product management
│   │   └── adminUserController.js     # Admin user management (optional)
│   └── searchController.js            # Search operations
│
├── routes/                            # API routes
│   ├── index.js                       # Route aggregator
│   ├── authRoutes.js                  # /api/auth
│   ├── productRoutes.js               # /api/products
│   ├── searchRoutes.js                # /api/search-history
│   └── adminRoutes.js                 # /api/admin/** (protected)
│
├── utils/                             # Utility functions
│   ├── jwt.js                         # JWT token management
│   ├── validation.js                  # Input validation
│   ├── errors.js                      # Custom error classes
│   └── helpers.js                     # Helper functions
│
├── constants/                         # Constants
│   ├── roles.js                       # Role definitions
│   ├── httpStatus.js                  # HTTP status codes
│   └── messages.js                    # Server messages
│
└── scripts/                           # Utility scripts
    ├── seedDatabase.js                # Demo data seeding
    └── migrateRoles.js                # Role migration script
```

---

## Migration Strategy

### Phase 1: Environment Preparation ✅
- Create new unified backend folder structure
- Set up configuration files
- Define roles and constants

### Phase 2: Core System Migration ⚙️
- Migrate User model to unified system
- Migrate and enhance JWT utilities
- Create comprehensive RBAC middleware
- Update authentication controller

### Phase 3: Feature Integration 🔧
- Merge product controller with admin extensions
- Create admin-specific endpoints
- Integrate search functionality
- Add error handling and logging

### Phase 4: Testing & Validation 🧪
- Test all existing API endpoints
- Verify role-based access
- Check JWT role integration
- Validate backward compatibility

### Phase 5: Transition & Cleanup 🚀
- Update frontend API URLs (if needed)
- Update environment variables
- Decommission old systems
- Monitor logs and errors

---

## Implementation Details

### 1. Updated User Model (Unified)

```javascript
// unified-backend/models/User.js
const userSchema = new mongoose.Schema({
  // Profile
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Never return password by default
  },
  
  // Roles & Permissions
  role: {
    type: String,
    enum: {
      values: ['USER', 'ADMIN'],
      message: 'Role must be either USER or ADMIN'
    },
    default: 'USER',
    index: true
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // OAuth fields (optional for future expansion)
  googleId: String,
  githubId: String,
  
  // Account metadata
  lastLoginAt: Date,
  loginHistory: [{
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset (future)
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Methods
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.loginHistory; // Optional: keep or expose
  return obj;
};

userSchema.methods.comparePassword = async function(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};
```

### 2. JWT Structure with Role

```javascript
// unified-backend/config/jwt.js

// JWT Payload Structure:
{
  // Standard Claims
  iss: "ecommerce-api",        // Issuer
  sub: "user-id-here",          // Subject (user ID)
  iat: 1708617600,              // Issued at
  exp: 1708704000,              // Expiration
  
  // Custom Claims (Role-Based)
  role: "ADMIN",                // USER or ADMIN
  email: "user@example.com",
  name: "User Name",
  
  // Session info (optional)
  sessionId: "session-uuid",
  ipAddress: "192.168.1.1"
}

// Token Generation:
const generateAccessToken = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,              // ← CRITICAL: Include role
    name: user.name
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'ecommerce-api',
    subject: user._id.toString()
  });
};
```

### 3. RBAC Middleware Architecture

```javascript
// unified-backend/middleware/rbac.js

/**
 * Role-Based Access Control Middleware Factory
 * Usage: router.post('/admin/products', authMiddleware, rbac(['ADMIN']), controller)
 */
export const rbac = (allowedRoles = []) => {
  return (req, res, next) => {
    // Verify user is authenticated (authMiddleware must run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. ' + 
                `Required role(s): ${allowedRoles.join(', ')}`
      });
    }
    
    next();
  };
};

// Specific role middleware for convenience:
export const requireAdmin = rbac(['ADMIN']);
export const requireUser = rbac(['USER', 'ADMIN']); // Both can be users

// Example usage patterns:
// - Public route: no auth middleware
// - User route: authMiddleware only
// - Admin route: authMiddleware → rbac(['ADMIN']) or authMiddleware → requireAdmin
// - Multi-role: rbac(['ADMIN', 'MODERATOR'])
```

### 4. Protected Routes Example

```javascript
// unified-backend/routes/adminRoutes.js

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import * as adminProductController from '../controllers/adminController/adminProductController.js';

const router = express.Router();

// Apply auth + admin check to ALL admin routes
router.use(authMiddleware);
router.use(rbac(['ADMIN']));

/**
 * ADMIN-ONLY Product Management Routes
 * All routes below require ADMIN role
 */

// List all products (admin view includes stock)
router.get('/products', 
  adminProductController.getAllProductsAdmin
);

// Get product stock details
router.get('/products/:id/stock',
  adminProductController.getProductStock
);

// Add new product
router.post('/products',
  adminProductController.validateProductInput,
  adminProductController.createProductAdmin
);

// Update product (including stock)
router.put('/products/:id',
  adminProductController.validateProductInput,
  adminProductController.updateProductAdmin
);

// Restock product (increment stock)
router.patch('/products/:id/restock',
  adminProductController.validateRestockInput,
  adminProductController.restockProduct
);

// Delete product
router.delete('/products/:id',
  adminProductController.deleteProductAdmin
);

// Optional: Get dashboard stats
router.get('/stats/inventory',
  adminProductController.getInventoryStats
);

export default router;
```

### 5. Admin Product Controller Structure

```javascript
// unified-backend/controllers/adminController/adminProductController.js

import Product from '../../models/Product.js';
import { body, validationResult } from 'express-validator';

/**
 * GET /api/admin/products
 * Get all products with admin view (includes stock, less pagination)
 */
export const getAllProductsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const skip = (page - 1) * pageSize;
    
    // Build filters
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.lowStock) filters.stock = { $lt: parseInt(req.query.lowStock) };
    if (req.query.search) {
      filters.$text = { $search: req.query.search };
    }
    
    const total = await Product.countDocuments(filters);
    const products = await Product
      .find(filters)
      .select('+stock') // Ensure stock is included
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * GET /api/admin/products/:id/stock
 * Get detailed stock information for a product
 */
export const getProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        currentStock: product.stock,
        status: product.stock === 0 ? 'OUT_OF_STOCK' : 
                product.stock < 10 ? 'LOW_STOCK' : 
                'IN_STOCK',
        lastUpdated: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Admin get stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock information'
    });
  }
};

/**
 * PATCH /api/admin/products/:id/restock
 * Increment product stock
 * Body: { quantity: number, reason?: string }
 */
export const restockProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { quantity, reason } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { stock: quantity },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Stock updated by ${quantity} units`,
      data: {
        productId: product._id,
        newStock: product.stock,
        reason: reason || 'Restock'
      }
    });
  } catch (error) {
    console.error('Restock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
};

/**
 * POST /api/admin/products
 * Create new product (admin only)
 */
export const createProductAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id // Track who created it
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

/**
 * PUT /api/admin/products/:id
 * Update product (admin only)
 */
export const updateProductAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

/**
 * DELETE /api/admin/products/:id
 * Delete product (admin only)
 */
export const deleteProductAdmin = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

/**
 * GET /api/admin/stats/inventory
 * Get inventory statistics
 */
export const getInventoryStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgStock: { $avg: '$stock' },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] }
          }
        }
      }
    ]);
    
    const data = stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      avgStock: 0,
      outOfStock: 0,
      lowStock: 0
    };
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory stats'
    });
  }
};

// Validation rules
export const validateProductInput = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('category').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative')
];

export const validateRestockInput = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('reason').optional().trim()
];
```

---

## API Contracts (Backward Compatibility)

### ✅ Existing User-Facing APIs (UNCHANGED)

```javascript
// Public endpoints - NO CHANGES
GET    /api/products              // Get all products
GET    /api/products/:id          // Get single product
POST   /api/auth/register         // Register user
POST   /api/auth/login            // Login user
POST   /api/auth/verify-email/:token

GET    /api/auth/me               // Get current user (auth required)
GET    /api/search-history        // Get user's search history
POST   /api/search-history        // Save to search history
```

### 🆕 New Admin Endpoints (Protected)

```javascript
// Admin-only endpoints (ADMIN role required)
GET    /api/admin/products              // Get all products (admin view)
GET    /api/admin/products/:id/stock    // Get product stock details
POST   /api/admin/products              // Create new product
PUT    /api/admin/products/:id          // Update product
DELETE /api/admin/products/:id          // Delete product
PATCH  /api/admin/products/:id/restock  // Increment stock

// Optional - Admin stats
GET    /api/admin/stats/inventory       // Inventory statistics
```

### 📝 Login Response Enhancement

**Old Response:**
```json
{
  "success": true,
  "accessToken": "jwt-token-here",
  "user": {
    "id": "...",
    "email": "...",
    "name": "..."
  }
}
```

**New Response (BACKWARD COMPATIBLE):**
```json
{
  "success": true,
  "accessToken": "jwt-token-here",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "USER"  // ← NEW: Frontend can use for routing
  }
}
```

### Frontend Integration Minimal Changes

```javascript
// In frontend - minimal changes for role-based redirect
// old code still works, new code below optional:

const handleLoginSuccess = (data) => {
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // NEW: Optional role-based redirect
  if (data.user.role === 'ADMIN') {
    navigate('/admin/dashboard');
  } else {
    navigate('/user/dashboard');
  }
};
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Create database backup
- [ ] Review all API integrations
- [ ] Set up environment variables
- [ ] Run security audit
- [ ] Load test with admin endpoints

### Deployment
- [ ] Deploy unified backend
- [ ] Update backend URL (if changed)
- [ ] Verify all product endpoints
- [ ] Verify auth endpoints
- [ ] Test admin endpoints
- [ ] Monitor error logs

### Post-Deployment
- [ ] Update documentation
- [ ] Notify team of new admin endpoints
- [ ] Plan decommissioning of old systems
- [ ] Monitor performance and logs

---

## Scalability & Best Practices

### 1. Caching Strategy
```javascript
// For frequently accessed products
import redis from 'redis';
const cache = redis.createClient();

// Cache product list for 5 minutes
router.get('/products', async (req, res) => {
  const cacheKey = `products:page:${page}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // ... fetch from DB
  await cache.setex(cacheKey, 300, JSON.stringify(data));
  res.json(data);
});
```

### 2. Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

// General rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Stricter admin rate limit
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});

app.use('/api/', limiter);
app.use('/api/admin/', adminLimiter);
```

### 3. Input Validation
```javascript
// Use express-validator for all inputs
import { body, validationResult } from 'express-validator';

const validateProduct = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 200 }),
  body('price').isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];
```

### 4. Logging & Monitoring
```javascript
// Log important actions
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log admin actions
router.patch('/admin/products/:id/restock', (req, res) => {
  logger.info(`Admin ${req.user.email} restocked product ${req.params.id}`, {
    userId: req.user.id,
    productId: req.params.id,
    quantity: req.body.quantity,
    timestamp: new Date()
  });
});
```

### 5. Database Indexing
```javascript
// Ensure indexes on frequently queried fields
const userSchema = new Schema({
  email: { type: String, index: true },
  role: { type: String, index: true },
  isActive: { type: String, index: true }
});

const productSchema = new Schema({
  category: { type: String, index: true },
  stock: { type: Number, index: true },
  name: { type: String, text: true }, // For full-text search
  createdAt: { type: Date, index: true }
});
```

### 6. Error Handling
```javascript
// Centralized error handling
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Error handler middleware (placed last)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  logger.error(`${statusCode} - ${message}`, { error: err });
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### 7. Role-Based Field Selection
```javascript
export const authMiddleware = async (req, res, next) => {
  // ... existing validation
  
  req.user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    // Optionally add permissions
    permissions: getPermissionsForRole(user.role)
  };
  
  next();
};

function getPermissionsForRole(role) {
  const permissions = {
    USER: ['read:products', 'write:profile', 'read:orders'],
    ADMIN: ['read:products', 'write:products', 'read:users', 'write:users', 'read:stats']
  };
  return permissions[role] || [];
}
```

---

## Migration Guide

### Step 1: Backup Current Data
```bash
# Create database backup
mongodump --db ecommerce --out ./backup
```

### Step 2: Update Role Values (Optional but Recommended)
```javascript
// Run once to normalize roles from 'user' to 'USER', etc.
db.users.updateMany({ role: 'user' }, { $set: { role: 'USER' } });
db.users.updateMany({ role: 'admin' }, { $set: { role: 'ADMIN' } });
```

### Step 3: Update Environment Variables
```env
# PORT configuration
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Email (if using)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Admin (optional)
ADMIN_EMAIL=admin@example.com
```

### Step 4: Run Database Migrations
```bash
# Ensure all roles are properly set
node scripts/migrateRoles.js

# Optional: Create admin user
node scripts/seedAdminUser.js
```

---

## File Generation Instructions

The actual implementation files are provided separately. Key files to create:

**Core Files:**
- `unified-backend/server.js` - Entry point
- `unified-backend/app.js` - Express setup
- `unified-backend/config/jwt.js` - JWT utilities
- `unified-backend/middleware/auth.js` - Auth middleware
- `unified-backend/middleware/rbac.js` - RBAC middleware
- `unified-backend/models/User.js` - Enhanced User model

**Controllers:**
- `unified-backend/controllers/authController.js` - Auth logic
- `unified-backend/controllers/adminController/adminProductController.js` - Admin product logic

**Routes:**
- `unified-backend/routes/index.js` - Route aggregator
- `unified-backend/routes/authRoutes.js` - Auth routes
- `unified-backend/routes/adminRoutes.js` - Admin routes

---

## Security Checklist

✅ Role validation on every protected route  
✅ JWT includes role field  
✅ Password never returned in responses  
✅ Admin endpoints require explicit role check  
✅ CORS properly configured  
✅ HTTP-only cookies if using session tokens  
✅ Input validation on all endpoints  
✅ Error messages don't leak sensitive data  
✅ Rate limiting on authentication endpoints  
✅ Audit logs for admin actions  

---

## FAQ

**Q: Will this break my frontend?**  
A: No. All existing APIs remain compatible. Role-based redirect is optional.

**Q: How do I upgrade an existing user to admin?**  
A: Update their role directly:
```javascript
db.users.updateOne({ _id: ObjectId('...') }, { $set: { role: 'ADMIN' } });
```

**Q: Can I have more than 2 roles in the future?**  
A: Yes! Update the enum and permission system. The architecture supports this.

**Q: How are password resets handled?**  
A: Added fields in User model for future implementation. Use separate endpoint pattern.

**Q: What about multi-tenant systems?**  
A: Add `tenantId` field to models and filter all queries. RBAC can be extended.

---

## Next Steps

1. ✅ Review this document
2. ⏭️ Create unified backend structure (see file list below)
3. ⏭️ Test all endpoints
4. ⏭️ Deploy to development environment
5. ⏭️ Test with frontend
6. ⏭️ Deploy to production

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-22  
**Status:** Ready for Implementation
