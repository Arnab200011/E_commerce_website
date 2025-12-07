import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import searchHistoryRoutes from './routes/searchHistoryRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();

// Middleware
const allowedOrigins = (
  process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174,http://localhost:3000'
)
  .split(',')
  .map((s) => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/search-history', searchHistoryRoutes);

// Serve product images from Product_db folder
// Supports two patterns:
// 1. /api/images/<uid>/<imageName> - looks for Product_db/<imageName>
// 2. /api/images/<uid> - looks for Product_db/<uid>.jpg or /<uid>.png
app.get('/api/images/:uid/:imageName?', (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const productDbPath = process.env.PRODUCT_DB_PATH
      ? path.resolve(process.env.PRODUCT_DB_PATH)
      : path.resolve(__dirname, '..', '..', 'Product_db');

    const { uid, imageName } = req.params;
    
    let filePath;
    if (imageName) {
      // Pattern: /api/images/<uid>/<imageName> - imageName is used directly
      filePath = path.join(productDbPath, imageName);
    } else {
      // Pattern: /api/images/<uid> - try uid.jpg or uid.png
      const jpgPath = path.join(productDbPath, `${uid}.jpg`);
      const pngPath = path.join(productDbPath, `${uid}.png`);
      
      if (fs.existsSync(jpgPath)) {
        filePath = jpgPath;
      } else if (fs.existsSync(pngPath)) {
        filePath = pngPath;
      } else {
        return res.status(404).json({ success: false, message: 'Image not found' });
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Image file not found' });
    }

    // Prevent directory traversal attacks
    const resolvedPath = path.resolve(filePath);
    const resolvedRoot = path.resolve(productDbPath);
    if (!resolvedPath.startsWith(resolvedRoot)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.sendFile(filePath);
  } catch (err) {
    console.error('Image serve error:', err);
    return res.status(500).json({ success: false, message: 'Failed to serve image' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
