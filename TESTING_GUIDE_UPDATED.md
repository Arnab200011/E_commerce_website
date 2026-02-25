# Testing Guide - Unified Backend (Current State)

**Last Updated:** 2026-02-25  
**Backend Version:** 1.0.0  
**Status:** ✅ MongoDB Connected | ✅ JWT Auth Active | ⚠️ Cloudinary Configured (see setup)

---

## 📋 Manual API Testing Guide

Complete testing guide for the unified e-commerce backend API. Use `curl`, Postman, or VS Code REST Client.

### Prerequisites
- Backend running on `http://localhost:5000`
- MongoDB connected and operational
- Cloudinary environment variables configured (optional for image uploads)
- Always include `Authorization: Bearer $TOKEN` header for protected routes

---

## 🔐 Authentication Endpoints

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Password Requirements:**
- At least 8 characters
- Contains uppercase letter
- Contains lowercase letter
- Contains number

---

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Save token for subsequent requests:**
```bash
# PowerShell
$TOKEN = "eyJhbGc..."

# Bash
export TOKEN="eyJhbGc..."

# Then use in headers: -H "Authorization: Bearer $TOKEN"
```

---

### 3. Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

## 👨‍💼 Admin Endpoints (Product Management)

### Prerequisites
- **ADMIN role required** - Ensure user has admin privileges
- **Authentication required** - All requests must include valid JWT token
- Admin user seed: `email: admin@ecommerce.com | password: AdminPass123`

---

### 1. Get All Products (Admin View)
```bash
curl -X GET "http://localhost:5000/api/admin/products?page=1&pageSize=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 100)
- `category` - Filter by category
- `brand` - Filter by brand
- `lowStock` - Show items with stock below threshold
- `search` - Search by name/description
- `active` - Filter by status (true/false)

**Response includes:**
- Product details with stock information
- Pagination metadata
- Total product count

---

### 2. Get Product Stock Details
```bash
curl -X GET http://localhost:5000/api/admin/products/PRODUCT_ID/stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "stock": 50,
    "minStockLevel": 5,
    "stockStatus": "IN_STOCK"
  }
}
```

---

### 3. Create Product (JSON - No File Upload)
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Latest Apple flagship smartphone with advanced features",
    "price": 999.99,
    "category": "Electronics",
    "brand": "Apple",
    "stock": 50,
    "minStockLevel": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "price": 999.99,
    "stock": 50,
    "isActive": true,
    "createdAt": "2026-02-25T10:30:00Z"
  }
}
```

---

### 4. Create Product (Multipart - With Image Upload)
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=iPhone 15 Pro" \
  -F "description=Latest Apple flagship smartphone" \
  -F "price=999.99" \
  -F "category=Electronics" \
  -F "brand=Apple" \
  -F "stock=50" \
  -F "minStockLevel=5" \
  -F "image=@/path/to/image.jpg"
```

**Image Upload Details:**
- Accepts: JPG, PNG, WebP, GIF
- Max size: 5MB (configurable)
- Automatically uploaded to Cloudinary
- Generates `imageUrl` and `imagePublicId` for management

**Response includes:**
```json
{
  "success": true,
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/...",
    "imagePublicId": "ecommerce/products/abc123",
    "price": 999.99,
    "stock": 50
  }
}
```

---

### 5. Update Product
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Updated description",
    "price": 949.99,
    "stock": 45,
    "isActive": true
  }'
```

**Update with new image:**
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=iPhone 15 Pro" \
  -F "price=949.99" \
  -F "image=@/path/to/new-image.jpg"
```

**Remove image:**
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deleteImage": true
  }'
```

---

### 6. Restock Product
Increment stock with reason tracking.

```bash
curl -X PATCH http://localhost:5000/api/admin/products/PRODUCT_ID/restock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "reason": "New shipment received from supplier"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product restocked successfully",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "stock": 75,
    "previousStock": 50,
    "restockQuantity": 25
  }
}
```

---

### 7. Delete Product
Soft delete - deactivates product instead of removing.

```bash
curl -X DELETE http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "isActive": false
  }
}
```

---

### 8. Get Inventory Statistics
```bash
curl -X GET http://localhost:5000/api/admin/stats/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalProducts": 150,
    "activeProducts": 145,
    "totalInventoryValue": 245789.50,
    "outOfStock": 5,
    "lowStock": 12,
    "averageStockLevel": 42.5
  }
}
```

---

## 📦 Product Schema Reference

The current product model stores the following fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | ✅ | 2-200 characters, indexed for search |
| `description` | String | ❌ | Max 3000 characters |
| `price` | Number | ✅ | Must be ≥ 0 |
| `category` | String | ❌ | Indexed for filtering |
| `brand` | String | ❌ | Indexed for filtering |
| `stock` | Number | ❌ | Default: 0, min: 0 |
| `minStockLevel` | Number | ❌ | Default: 5 (low stock threshold) |
| `images` | Array | ❌ | Array of image URLs |
| `imageUrl` | String | ❌ | Primary image from Cloudinary |
| `imagePublicId` | String | ❌ | Cloudinary ID for deletion |
| `metadata` | Mixed | ❌ | Flexible JSON metadata |
| `createdBy` | ObjectId | ❌ | Admin user who created |
| `updatedBy` | ObjectId | ❌ | Admin user who updated |
| `isActive` | Boolean | ❌ | Default: true |
| `createdAt` | DateTime | ⏱️ | Auto-generated |
| `updatedAt` | DateTime | ⏱️ | Auto-generated |

**Stock Status Methods:**
- `getStockStatus()` - Returns: `OUT_OF_STOCK`, `LOW_STOCK`, or `IN_STOCK`
- `hasStock()` - Returns: `true` if stock > 0
- `isLowStock()` - Returns: `true` if stock < minStockLevel

---

## ✅ Complete Test Scenarios

### Scenario 1: Full Product Lifecycle
Create, update, and restock a product.

```bash
# 1. Create Product
PRODUCT_ID=$(curl -s -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro",
    "price": 1299.99,
    "stock": 10,
    "category": "Electronics"
  }' | jq -r '.product.id')

echo "Created product: $PRODUCT_ID"

# 2. Update Product
curl -X PUT http://localhost:5000/api/admin/products/$PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1199.99,
    "description": "High-performance laptop"
  }'

# 3. Check Stock
curl -X GET http://localhost:5000/api/admin/products/$PRODUCT_ID/stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Restock
curl -X PATCH http://localhost:5000/api/admin/products/$PRODUCT_ID/restock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 20,
    "reason": "Stock arrived"
  }'
```

---

### Scenario 2: Image Upload and Management
Create product with image and update it.

```bash
# 1. Create with image
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Premium Headphones" \
  -F "price=299.99" \
  -F "category=Electronics" \
  -F "stock=30" \
  -F "image=@./headphones.jpg"

# 2. Replace image
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "image=@./new-headphones-image.jpg"

# 3. Remove image
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deleteImage": true
  }'
```

---

### Scenario 3: Search and Filter
Get products by category and search.

```bash
# Get Electronics category
curl -X GET "http://localhost:5000/api/admin/products?category=Electronics&pageSize=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Search by name
curl -X GET "http://localhost:5000/api/admin/products?search=iPhone" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Low stock items
curl -X GET "http://localhost:5000/api/admin/products?lowStock=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Combine filters
curl -X GET "http://localhost:5000/api/admin/products?category=Electronics&brand=Apple&lowStock=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Scenario 4: Role-Based Access Control
Test permission levels.

```bash
# ✅ ADMIN can create products
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":99.99,"stock":10}'

# ❌ Regular user cannot create products
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":99.99,"stock":10}'

# Response: 403 Forbidden - Access denied. Admin privileges required.
```

---

## 🔍 Error Scenarios & Troubleshooting

### Authentication Errors

**Missing Token:**
```bash
curl -X GET http://localhost:5000/api/admin/products
# Response: 401 Unauthorized - No token provided
```

**Invalid Token:**
```bash
curl -X GET http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer invalid-token"
# Response: 401 Unauthorized - Invalid token
```

---

### Validation Errors

**Required Field Missing:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product"}'
# Response: 400 - Price is required
```

**Invalid Price:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","price":-10,"stock":5}'
# Response: 400 - Price cannot be negative
```

**Invalid Stock:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","price":99.99,"stock":-5}'
# Response: 400 - Stock cannot be negative
```

---

### Image Upload Errors

**File Too Large:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Product" \
  -F "price=99.99" \
  -F "image=@./large-file-10mb.jpg"
# Response: 413 - File too large (max 5MB)
```

**Invalid File Type:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Product" \
  -F "price=99.99" \
  -F "image=@./document.pdf"
# Response: 400 - Invalid file type. Only images allowed
```

**Cloudinary Not Configured:**
```bash
# If CLOUDINARY_* env vars missing:
# Response: 400 - Image upload failed: Cloudinary not configured
# Solution: Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env
```

---

### Resource Not Found

**Invalid Product ID:**
```bash
curl -X GET http://localhost:5000/api/admin/products/invalid123/stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Response: 404 - Product not found
```

---

## 📊 Performance Benchmarks

Typical response times (development environment):

| Endpoint | Method | Typical Time |
|----------|--------|--------------|
| Register | POST | 100-200ms |
| Login | POST | 100-200ms |
| Get All Products | GET | 100-300ms |
| Get Product Stock | GET | 50-100ms |
| Create Product (JSON) | POST | 150-300ms |
| Create Product (With Image) | POST | 500-2000ms |
| Update Product | PUT | 150-300ms |
| Restock Product | PATCH | 100-200ms |
| Delete Product | DELETE | 100-200ms |
| Get Inventory Stats | GET | 200-500ms |

---

## 🛡️ Security Testing

### CORS Testing
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Origin: http://different-origin.com" \
  -H "Authorization: Bearer $TOKEN" \
  -v

# Verify it's in CORS_ALLOWED_ORIGINS in .env
```

### Input Sanitization
```bash
# XSS attempt (should be stored safely)
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\");</script>",
    "price": 99.99
  }'

# Stored as literal string - safe
```

### SQL Injection (MongoDB)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com\" OR \"1\"=\"1",
    "password": "anything"
  }'

# Mongoose schema validation prevents injection
```

---

## 🐛 Debugging Tips

### Check Backend Logs
```bash
# Terminal where backend is running
# Look for errors in console output
```

### Enable Verbose Curl
```bash
curl -v http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Shows: Request headers, response headers, status code
```

### Decode JWT Token
```bash
# Online: https://jwt.io
# Or use jq (on Linux/Mac):
echo $TOKEN | cut -d '.' -f 2 | tr '_-' '/+' | fold -w 4 | paste -sd '' | base64 -d | jq
```

### Test MongoDB Connection
```bash
# Backend logs should show:
# ✅ MongoDB Connected: [connection-string]
```

### Verify Environment Variables
```bash
# Check .env file exists in unified-backend folder
cat unified-backend/.env

# Should contain:
# MONGODB_URI=...
# JWT_SECRET=...
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
```

---

## 🚀 Quick Setup Checklist

- [ ] MongoDB connection string in `.env`
- [ ] JWT secret configured in `.env`
- [ ] Admin user seeded (run seedAdminUser.js)
- [ ] Cloudinary credentials in `.env` (optional but recommended)
- [ ] CORS allowed origins configured in `.env`
- [ ] Backend running on port 5000
- [ ] Database indexed properly (fixed duplicate stock index)

---

## 📝 Common Tasks

### Create Test Admin User
```bash
# Run from backend directory
node scripts/seedAdminUser.js
# Credentials: admin@ecommerce.com / AdminPass123
```

### Migrate Roles
```bash
node scripts/migrateRoles.js
```

### List All Products
```bash
curl -X GET "http://localhost:5000/api/admin/products?pageSize=1000" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

### Export Products to JSON
```bash
curl -s -X GET "http://localhost:5000/api/admin/products?pageSize=1000" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.products' > products.json
```

---

## 📞 Support

- **Backend Status:** `GET /health`
- **Database:** MongoDB Atlas (check connection in logs)
- **Images:** Cloudinary (configure env vars to enable)
- **Authentication:** JWT-based (7-day expiry)

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-25  
**Tested & Working:** ✅ All endpoints functional with multipart and JSON support
