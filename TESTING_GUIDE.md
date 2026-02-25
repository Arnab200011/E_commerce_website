# Testing Guide - Unified Backend

## 📋 Manual API Testing Guide

Use these commands to test the unified backend with `curl` or Postman.

### Prerequisites
- Backend running on `http://localhost:5000`
- Store tokens in environment or use them directly in commands

## 🔐 Authentication Endpoints

### 1. Register User
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

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Save the token for next requests:**
```bash
export TOKEN="eyJhbGc..." # Replace with actual token
```

### 3. Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 👨‍💼 Admin Endpoints

### Prerequisites
- Token must be from an ADMIN user
- Set token: `export ADMIN_TOKEN="..."` 

### 1. Get All Products (Admin View)
```bash
curl -X GET "http://localhost:5000/api/admin/products?page=1&pageSize=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 2. Get Product Stock Details
```bash
curl -X GET http://localhost:5000/api/admin/products/PRODUCT_ID/stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 3. Create Product
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Latest Apple smartphone",
    "price": 999.99,
    "category": "Electronics",
    "brand": "Apple",
    "stock": 50,
    "images": ["https://example.com/iphone15.jpg"]
  }'
```

### 4. Update Product
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "price": 949.99,
    "stock": 45
  }'
```

### 5. Restock Product
```bash
curl -X PATCH http://localhost:5000/api/admin/products/PRODUCT_ID/restock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "reason": "New shipment received from supplier"
  }'
```

### 6. Delete Product
```bash
curl -X DELETE http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 7. Get Inventory Stats
```bash
curl -X GET http://localhost:5000/api/admin/stats/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 🧪 Postman Collection

Import this collection into Postman:

### Collection Structure
```
Unified Backend
├── Auth
│   ├── Register
│   ├── Login
│   └── Get Profile
├── Admin Products
│   ├── Get All Products
│   ├── Get Stock Details
│   ├── Create Product
│   ├── Update Product
│   ├── Delete Product
│   ├── Restock Product
│   └── Inventory Stats
└── Health Check
```

### Export as JSON (for Postman import)
```json
{
  "info": {
    "name": "Unified Backend",
    "description": "E-commerce backend API"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register",
            "body": {
              "name": "John",
              "email": "john@test.com",
              "password": "TestPass123",
              "confirmPassword": "TestPass123"
            }
          }
        }
      ]
    }
  ]
}
```

## ✅ Test Cases

### Test Case 1: User Registration and Login
**Scenario:** New user signs up and logs in

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -d '{"name":"Test","email":"test@test.com","password":"Test123","confirmPassword":"Test123"}'

# 2. Login with new credentials
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"test@test.com","password":"Test123"}'

# Expected: Gets JWT token
```

### Test Case 2: Protected Route Access
**Scenario:** Accessing protected route without token

```bash
# Without token (should fail)
curl -X GET http://localhost:5000/api/auth/me

# Response: 401 Unauthorized

# With invalid token (should fail)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid-token"

# Response: 401 Unauthorized
```

### Test Case 3: Admin-Only Access
**Scenario:** Non-admin user tries to access admin endpoint

```bash
# As regular user
export USER_TOKEN="..."
curl -X GET http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $USER_TOKEN"

# Response: 403 Forbidden - Access denied. Admin privileges required.
```

### Test Case 4: Create and Restock Product
**Scenario:** Admin creates a product and restocks it

```bash
# 1. Create product
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name":"Test Product",
    "price":99.99,
    "stock":10
  }'

# Save PRODUCT_ID from response

# 2. Check stock
curl -X GET http://localhost:5000/api/admin/products/$PRODUCT_ID/stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Restock
curl -X PATCH http://localhost:5000/api/admin/products/$PRODUCT_ID/restock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"quantity":20,"reason":"Restock"}'

# Stock should be 30 now
```

## 🔍 Common Error Scenarios

### Invalid Password Format
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -d '{
    "name":"Test",
    "email":"test@test.com",
    "password":"weak"
  }'

# Response: 400 - Password must contain uppercase, lowercase, and numbers
```

### User Already Exists
```bash
# Try registering with same email twice

# Response: 409 - User already exists with this email
```

### Invalid Email Format
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -d '{
    "name":"Test",
    "email":"not-an-email",
    "password":"Test123"
  }'

# Response: 400 - Please provide a valid email address
```

## 📊 Performance Testing

### Load Test Example (using Apache Bench)
```bash
# Test 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:5000/health

# Test login endpoint
ab -n 50 -c 5 -p login.json -T application/json http://localhost:5000/api/auth/login
```

### Sample login.json
```json
{
  "email": "test@test.com",
  "password": "Test123"
}
```

## 🛡️ Security Testing

### SQL Injection Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -d '{
    "email":"test@test.com\" OR \"1\"=\"1",
    "password":"anything"
  }'

# Should fail - Mongoose prevents this
```

### XSS Test
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -d '{
    "name":"<script>alert(1)</script>",
    "email":"test@test.com",
    "password":"Test123"
  }'

# Stored safely - data is escaped by MongoDB
```

### CORS Test
```bash
# From different origin
curl -X GET http://localhost:5000/api/auth/me \
  -H "Origin: http://different-origin.com" \
  -H "Authorization: Bearer $TOKEN"

# If not in allowedOrigins, should fail
```

## 📝 Response Time Benchmarks

Normal response times (development):
- Auth endpoints: 50-200ms
- Admin product list: 100-300ms
- Product creation: 150-400ms
- Stock update: 100-250ms

## 🐛 Debugging Tips

### Enable Verbose Logging
```bash
# Add to .env
LOG_LEVEL=debug
```

### Monitor Database Queries
```javascript
// In mongoose
mongoose.set('debug', true);
```

### Check Token Claims
```bash
# Decode token at jwt.io
# Or use:
echo "TOKEN" | jq '. | @base64d' 
```

### Network Inspection
```bash
# Use curl with verbose
curl -v http://localhost:5000/health

# Or use a tool like Insomnia, Postman, or VS Code REST Client
```

---

**Last Updated:** 2026-02-22  
**Backend Version:** 1.0.0
