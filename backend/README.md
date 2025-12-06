# E-commerce Backend API

A production-ready Node.js + Express backend with JWT authentication, user/admin system, product management, and per-user search history.

## Features

- **User/Admin Authentication**: JWT-based auth with email verification
- **Role-Based Access Control**: USER and ADMIN roles
- **Product Management**: Full CRUD operations (admin only)
- **Product Search**: Keyword-based search with automatic history tracking
- **Search History**: Per-user history (last 5 searches)
- **MongoDB Integration**: Mongoose ODM with proper schemas and validation

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email**: nodemailer
- **Validation**: express-validator

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (for verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@ecommerce.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

Ensure MongoDB is running locally:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Windows (if installed as service)
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Products Database

```bash
npm run seed
```

This will populate the database with sample products from `data/Products.json`.

### 5. Start the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/verify-email/:token` | Public | Verify email address |
| GET | `/api/auth/me` | Private | Get current user profile |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | Public | Get all products (paginated) |
| GET | `/api/products/:id` | Public | Get single product |
| GET | `/api/products/search?keyword=...` | Private | Search products & save to history |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Search History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search-history` | Private | Get user's last 5 searches |

## API Usage Examples

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "isEmailVerified": false
  }
}
```

### 2. Verify Email

Click the link in the verification email or make a GET request:

```bash
curl http://localhost:5000/api/auth/verify-email/{token}
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### 4. Search Products

```bash
curl http://localhost:5000/api/products/search?keyword=iphone \
  -H "Authorization: Bearer {your-token}"
```

Response:
```json
{
  "success": true,
  "keyword": "iphone",
  "count": 2,
  "data": [...]
}
```

### 5. Get Search History

```bash
curl http://localhost:5000/api/search-history \
  -H "Authorization: Bearer {your-token}"
```

Response:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "keyword": "iphone",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "...",
      "keyword": "macbook",
      "createdAt": "2024-01-15T09:15:00.000Z"
    },
    {
      "_id": "...",
      "keyword": "airpods",
      "createdAt": "2024-01-14T18:45:00.000Z"
    }
  ]
}
```

## Creating an Admin User

To create an admin user, you can either:

1. **Manually update in MongoDB**:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

2. **Create a script** (add to `scripts/createAdmin.js`):
```javascript
import User from '../src/models/User.js';
// ... connect to DB
const admin = await User.findOneAndUpdate(
  { email: "your-email@example.com" },
  { role: "ADMIN" },
  { new: true }
);
```

## Project Structure

```
backend/
├── src/
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── SearchHistory.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js
│   │   └── requireAdmin.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── searchHistoryRoutes.js
│   ├── controllers/     # Route handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── searchController.js
│   ├── config/          # Configuration files
│   │   ├── db.js
│   │   └── jwt.js
│   ├── utils/           # Utility functions
│   │   └── email.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── scripts/
│   └── seedProducts.js  # Database seeding
├── data/
│   └── Products.json    # Product data
├── .env                 # Environment variables
├── .env.example         # Environment template
└── package.json
```

## Development Notes

- All passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days (configurable)
- Search history is automatically trimmed to last 5 entries per user
- Email verification is required before login
- Admin endpoints are protected by both auth and admin middleware
- All routes include proper error handling and validation

## License

ISC
