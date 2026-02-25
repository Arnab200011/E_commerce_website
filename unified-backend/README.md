# Unified Backend - Setup & Documentation

## 📚 Project Overview

This is a unified, production-ready backend for an e-commerce platform with:
- ✅ Role-Based Access Control (RBAC)
- ✅ JWT Authentication
- ✅ Admin Dashboard Support
- ✅ Inventory Management
- ✅ Product Management
- ✅ Backward Compatible with Existing Frontend

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update these critical variables:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/ecommerce
JWT_SECRET=your-very-secure-and-random-secret-key
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start on `http://localhost:5000`

Check health: `http://localhost:5000/health`

## � Image Storage (Cloudinary)

This backend includes **optional** Cloudinary integration for product image storage.

### Quick Setup

1. **Get Cloudinary Credentials** at [cloudinary.com](https://cloudinary.com)

2. **Update `.env`:**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. **Verify:** Restart backend and check logs for `✅ Cloudinary configured successfully`

### Upload Product Image

```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "name=iPhone 15" \
  -F "price=999.99" \
  -F "image=@path/to/image.jpg"
```

**Features:**
- ✅ Automatic image optimization (format, quality)
- ✅ Secure cloud storage (no database bloat)
- ✅ Backward compatible (images are optional)
- ✅ Auto-cleanup on product deletion

📚 **Full Setup Guide:** See [CLOUDINARY_SETUP.md](../CLOUDINARY_SETUP.md)

## 📁 Project Structure

```
unified-backend/
├── config/           # Configuration files
│   ├── cloudinary.js # Cloudinary SDK setup
│   ├── database.js   # MongoDB connection
│   └── jwt.js        # JWT utilities
│
├── middleware/       # Express middleware
│   ├── auth.js       # Authentication
│   ├── rbac.js       # Role-based access control
│   └── upload.js     # Image upload & validation
│
├── models/           # MongoDB schemas
│   ├── User.js       # User with roles
│   └── Product.js    # Product with stock & images
│
├── controllers/      # Business logic
│   ├── authController.js
│   └── adminController/
│       └── adminProductController.js
│
├── routes/           # API endpoints
│   ├── authRoutes.js
│   └── adminRoutes.js
│
├── utils/            # Utility functions
│   └── cloudinaryUtils.js  # Image upload helpers
│
├── constants/        # App constants
│   ├── roles.js      # Role definitions
│   └── messages.js   # Message templates
│
└── server.js         # Entry point
```

## 🔐 Authentication

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (includes role for frontend routing):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

## 🛡️ Role-Based Access Control

### User Roles
- **USER**: Regular user with shopping access
- **ADMIN**: Full system access including inventory management

### Protected Routes

**Admin Only Routes** (require ADMIN role):
```
GET    /api/admin/products              # Get all products (admin view)
GET    /api/admin/products/:id/stock    # Get stock details
POST   /api/admin/products              # Create product
PUT    /api/admin/products/:id          # Update product
DELETE /api/admin/products/:id          # Delete product
PATCH  /api/admin/products/:id/restock  # Increment stock
GET    /api/admin/stats/inventory       # Inventory stats
```

## 📦 Product Management (Admin)

### Create Product
```bash
POST /api/admin/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "iPhone 15",
  "description": "Latest iPhone model",
  "price": 999,
  "category": "Electronics",
  "brand": "Apple",
  "stock": 50,
  "images": ["url-to-image-1", "url-to-image-2"]
}
```

### Get All Products (Admin View)
```bash
GET /api/admin/products?page=1&pageSize=50&category=Electronics
Authorization: Bearer <admin-token>
```

### Restock Product
```bash
PATCH /api/admin/products/:id/restock
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "quantity": 25,
  "reason": "New shipment received"
}
```

### Get Inventory Stats
```bash
GET /api/admin/stats/inventory
Authorization: Bearer <admin-token>
```

## 🔄 Migration from Old Backend

### Step 1: Keep Old Systems Running (During Testing)

```bash
# Terminal 1: Old auth_system
cd auth_system && npm install && npm start

# Terminal 2: Old backend
cd backend && npm install && npm start

# Terminal 3: New unified backend
cd unified-backend && npm install && npm run dev
```

### Step 2: Point Frontend to New Backend

Update your frontend's API base URL:
```javascript
// frontend/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';
```

### Step 3: Test All Flows

- ✅ User registration
- ✅ User login
- ✅ Get products (public)
- ✅ Admin login
- ✅ Admin endpoints

### Step 4: Migrate Data (One-time)

If users exist in old system, migrate roles:
```bash
# Run this to normalize roles from 'user' → 'USER', 'admin' → 'ADMIN'
node scripts/migrateRoles.js
```

### Step 5: Decommission Old Systems

Once everything is working:
```bash
# Stop old services
# Archive old folders
# Update documentation
```

## 🗄️ Database Setup

### MongoDB Connection

Ensure your MongoDB instance is running and connection string is correct:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
```

### Create Admin User (Optional)

You can promote a user to admin directly in MongoDB:

```javascript
// MongoDB shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
);
```

Or create an admin seed script:
```bash
node scripts/seedAdminUser.js
```

## 📝 API Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional: validation errors
}
```

## 🔒 Security Features

✅ Password hashing with bcrypt (10 salt rounds)
✅ JWT token expiration (7 days default)
✅ CORS protection
✅ Input validation on all endpoints
✅ Role-based authorization
✅ SQL injection prevention via Mongoose
✅ Rate limiting ready (can add express-rate-limit)
✅ Secure password requirements
✅ Email field uniqueness
✅ Account deactivation support

## 📊 Logging & Monitoring

### Access Logs (Development)
```
2024-02-22T10:30:45.123Z - POST /api/auth/login
2024-02-22T10:30:46.456Z - GET /api/admin/products
```

### Error Logs
Check server console for detailed error messages

## 🐛 Troubleshooting

### Connection Issues
```
Error: connect ECONNREFUSED
→ Check if MongoDB is running
→ Verify MONGODB_URI in .env
```

### JWT Errors
```
InvalidTokenError: secret is not defined
→ Set JWT_SECRET in .env
```

### CORS Issues
```
Access to XMLHttpRequest blocked by CORS policy
→ Add frontend URL to allowedOrigins in app.js
→ Update FRONTEND_URLS in .env
```

### Password Hash Errors
```
Error: bcrypt requires node password to be a string
→ Ensure password is a string before saving
```

## 📞 Support

For issues or questions:
1. Check the error message and stack trace
2. Review this README
3. Check environment variables
4. Review logs in console

## 📚 Additional Resources

- [JWT.io](https://jwt.io) - JWT documentation
- [Express.js](https://expressjs.com) - Express documentation
- [MongoDB](https://docs.mongodb.com) - MongoDB documentation
- [Mongoose](https://mongoosejs.com) - Mongoose documentation

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-22  
**Status:** Ready for Production
