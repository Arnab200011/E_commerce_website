# Cloudinary Integration Guide

Complete guide for Cloudinary image storage integration in the E-commerce Product Management System.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [Architecture](#architecture)
5. [API Usage](#api-usage)
6. [Data Migration](#data-migration)
7. [Error Handling](#error-handling)
8. [Production Considerations](#production-considerations)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This integration enables:

✅ **Image Upload to Cloudinary** - Store product images in cloud storage  
✅ **Secure URLs Only** - Database stores only Cloudinary URLs, not binary data  
✅ **Backward Compatibility** - Existing products without images continue to work  
✅ **Automatic Cleanup** - Images deleted from Cloudinary when products are deleted  
✅ **Production-Ready** - Error handling, validation, and optimization built-in  
✅ **Optional Images** - Image uploads are optional; products work without them  

### Key Components

| Component | Purpose |
|-----------|---------|
| `config/cloudinary.js` | Cloudinary SDK configuration |
| `middleware/upload.js` | Multer & file validation |
| `utils/cloudinaryUtils.js` | Upload/delete operations |
| `models/Product.js` | Schema updates (imageUrl, imagePublicId) |
| `controllers/adminProductController.js` | Enhanced create/update/delete logic |
| `routes/adminRoutes.js` | Multipart/form-data support |

---

## Prerequisites

### 1. Cloudinary Account

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Navigate to **Dashboard**
3. Copy your credentials:
   - **Cloud Name** - under your profile
   - **API Key** - in API Keys section
   - **API Secret** - marked with lock icon

### 2. Node.js Dependencies

```bash
cd unified-backend
npm install cloudinary multer sharp
```

**Dependency Details:**
- `cloudinary@^1.40.0` - Cloudinary SDK
- `multer@^1.4.5-lts.1` - Multipart form data parsing
- `sharp@^0.33.0` - Image optimization (optional, for future enhancements)

---

## Setup Instructions

### Step 1: Update Environment Variables

Create or update `.env` file in `unified-backend/`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Example (from Dashboard):**
```env
CLOUDINARY_CLOUD_NAME=dh7n3ka9x
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

**Security Notes:**
- ✅ Never expose `CLOUDINARY_API_SECRET` to frontend
- ✅ `.env` file is gitignored by default
- ✅ Use environment variables in production, never hardcode

### Step 2: Install Dependencies

```bash
cd unified-backend
npm install
```

This will install all new dependencies including `cloudinary`, `multer`, and `sharp`.

### Step 3: Verify Configuration

Start the backend:

```bash
npm run dev
```

Check logs for Cloudinary status:

```
✅ Cloudinary configured successfully
```

If you see:
```
⚠️ WARNING: Cloudinary environment variables are not fully configured. Image uploads will be disabled.
```

Then verify your `.env` file has all three required variables.

---

## Architecture

### Data Flow

```
┌─────────────┐
│ Admin       │
│ (Browser)   │
└──────┬──────┘
       │ POST/PUT multipart/form-data
       ▼
┌─────────────────────────────┐
│ Express Backend             │
│ /api/admin/products         │
├─────────────────────────────┤
│ 1. Multer parses file       │
│ 2. File validation          │
│ 3. Upload to Cloudinary     │
│ 4. Save URL to MongoDB      │
│ 5. Cleanup temp file        │
└──────┬──────────────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
  ┌─────────────┐    ┌──────────────┐
  │ Cloudinary  │    │ MongoDB      │
  │ (Image)     │    │ (Metadata)   │
  │ - Stores    │    │ - imageUrl   │
  │   binary    │    │ - imageId    │
  └─────────────┘    └──────────────┘
```

### Schema Updates

New fields added to Product model:

```javascript
// Primary Product Image (Cloudinary URL)
imageUrl: String,           // Cloudinary secure_url
imagePublicId: String,      // For image deletion
```

**Backward Compatibility:**
- Both fields are optional (`default: null`)
- Existing products without images work normally
- No schema breaking changes

---

## API Usage

### 1. Create Product with Image

**Request:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=iPhone 15 Pro" \
  -F "price=999.99" \
  -F "category=Electronics" \
  -F "stock=50" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "iPhone 15 Pro",
    "price": 999.99,
    "imageUrl": "https://res.cloudinary.com/dh7n3ka9x/image/upload/v1234567890/products/abc123.jpg",
    "imagePublicId": "products/abc123",
    ...
  }
}
```

### 2. Create Product without Image (Backward Compatible)

**Request (JSON):**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "price": 99.99,
    "category": "Electronics",
    "stock": 10
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Product Name",
    "imageUrl": null,
    "imagePublicId": null,
    ...
  }
}
```

### 3. Update Product with New Image

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/products/{id} \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Updated Name" \
  -F "price=89.99" \
  -F "image=@/path/to/new-image.jpg"
```

**Behavior:**
- Old image automatically deleted from Cloudinary
- New image uploaded
- `imagePublicId` updated for future deletions

### 4. Delete Image from Product

**Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/products/{id} \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deleteImage": "true"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "imageUrl": null,
    "imagePublicId": null,
    ...
  }
}
```

### 5. Delete Product (Image Auto-Deleted)

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/admin/products/{id} \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Behavior:**
- Product marked inactive (soft delete)
- Associated image automatically deleted from Cloudinary
- No orphaned images in cloud storage

---

## Data Migration

### For Existing Products (Without Images)

**No migration needed!** 

Existing products:
- Continue to work as before
- `imageUrl` defaults to `null`
- Can be updated with images any time

### Optional: Add Images to Existing Products

Use the update endpoint to add images to existing products:

```bash
# Add image to existing product
curl -X PUT http://localhost:5000/api/admin/products/{product_id} \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Bulk Migration (If Needed)

Create a Node.js script to batch update products:

```javascript
// scripts/migrateProductImages.js
import Product from '../models/Product.js';
import { uploadToCloudinary } from '../utils/cloudinaryUtils.js';

async function migrateImages() {
  const products = await Product.find()
    .limit(10); // Process in batches

  for (const product of products) {
    // Custom logic to source images (e.g., from old storage)
    // Then: await uploadToCloudinary(filepath);
    // Update product with new URL
  }

  console.log('✅ Migration complete');
}

migrateImages().catch(console.error);
```

---

## Error Handling

### File Validation Errors

**Scenario:** Invalid file type

```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Product" \
  -F "price=99" \
  -F "image=@/path/to/video.mp4"
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid file type. Allowed types: image/jpeg, image/png, image/webp, image/gif"
}
```

**Allowed Types:**
- `image/jpeg` - JPEG/JPG
- `image/png` - PNG
- `image/webp` - WebP
- `image/gif` - GIF

### File Size Errors

**Scenario:** File exceeds 10MB

```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB"
}
```

### Cloudinary Upload Failures

**Scenario:** Network error or Cloudinary issue

**Behavior:**
- Product is still created
- `imageUrl` remains `null`
- Error logged: `⚠️ Image upload failed: ...`
- Frontend should retry image upload later

**Retry Image Upload:**
```bash
curl -X PUT http://localhost:5000/api/admin/products/{id} \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Graceful Degradation

If Cloudinary is not configured:
- Image field validation runs but upload is skipped
- Products created/updated normally
- System logs warning but continues
- Images can be added later when Cloudinary is configured

---

## Production Considerations

### 1. API Key Security

**Never expose API_SECRET to frontend:**

```javascript
// ✅ Backend only - secure
import cloudinary from '../config/cloudinary.js';
const result = await uploadToCloudinary(filepath);

// ❌ Frontend - risky
// Don't send API_SECRET to browser
```

**Environment secrets management:**
- Use platform-specific secrets management (AWS Secrets Manager, etc.)
- Rotate API keys regularly
- Monitor Cloudinary usage dashboard

### 2. Image Optimization

Cloudinary automatically optimizes:
- Format selection (`f_auto`)
- Quality (`q_auto`)
- Responsive delivery

Custom transformation available via `getTransformedUrl()`:

```javascript
import { getTransformedUrl } from '../utils/cloudinaryUtils.js';

const thumbnailUrl = getTransformedUrl(product.imageUrl, {
  width: 200,
  height: 200,
  crop: 'fill',
  quality: 'auto'
});
```

### 3. Storage Limits

Cloudinary free tier:
- 25 GB total storage
- Unlimited bandwidth
- Unlimited requests

Monitor usage:
- Cloudinary Dashboard → Usage
- Set up alerts if needed

### 4. Performance Optimization

**Temporary File Cleanup:**
- Automatic cleanup after successful upload
- Failed uploads cleaned up to prevent disk bloat

**Monitoring:**
```bash
# Check temp directory size
du -sh /tmp/product-uploads/
```

### 5. Backup & Recovery

**No manual backups needed:**
- Original images stored on Cloudinary (backed up)
- URLs stored in MongoDB (backed up)
- Can rebuild relationship with Cloudinary API

**Disaster recovery:**
- If MongoDB lost: restore from backup
- If Cloudinary lost: Cloudinary has backups
- If both lost: use Cloudinary backup/export features

---

## Troubleshooting

### Cloudinary Not Configured Warning

**Issue:**
```
⚠️ WARNING: Cloudinary environment variables are not fully configured
```

**Solution:**
1. Verify `.env` file exists in `unified-backend/`
2. Check all three variables are present:
   ```env
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
3. Restart backend: `npm run dev`
4. Check logs for `✅ Cloudinary configured successfully`

### Image Upload Returns 413 Payload Too Large

**Issue:** File exceeds 10MB limit

**Solution:**
- Reduce image file size before upload
- Change `MAX_FILE_SIZE` in `middleware/upload.js` if needed:
  ```javascript
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  ```

### Image Upload Fails Silently

**Issue:** Image not uploaded but product created

**Check logs:**
```bash
npm run dev
# Look for: ⚠️ Image upload failed: ...
```

**Solutions:**
1. Verify Cloudinary credentials in Dashboard
2. Check network connectivity
3. Ensure API keys haven't been rotated
4. Check Cloudinary API usage limits

### Temp Files Not Deleted

**Issue:** Disk space fills up

**Solution:**
```bash
# Manual cleanup (Linux/Mac)
rm -rf /tmp/product-uploads/

# Windows
rmdir C:\Users\%username%\AppData\Local\Temp\product-uploads /s
```

**Prevention:**
- Monitor temp directory size
- Restart backend regularly
- Check error logs for failed cleanups

### CORS Errors on Image Display

**Issue:** Frontend can't load Cloudinary images

**Solution:**
- Cloudinary URLs are publicly readable by default
- No CORS configuration needed
- Verify image URL is correct: `https://res.cloudinary.com/...`

### MongoDB Storage Growing

**Issue:** Database size increasing unexpectedly

**Check:**
```bash
# List products with images
db.products.find({ imageUrl: { $exists: true, $ne: null } }).count()

# Typical JSON size per product: ~100-200 bytes for URL
```

This is normal - URLs are small strings (typically 100-200 bytes each).

---

## Testing

### Postman Collection Example

```json
{
  "info": {
    "name": "Product Image Upload",
    "description": "Test Cloudinary integration"
  },
  "item": [
    {
      "name": "Create Product with Image",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "url": "{{base_url}}/admin/products",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "name",
              "value": "Test Product",
              "type": "text"
            },
            {
              "key": "price",
              "value": "99.99",
              "type": "text"
            },
            {
              "key": "image",
              "type": "file",
              "src": "path/to/image.jpg"
            }
          ]
        }
      }
    }
  ]
}
```

### cURL Testing

```bash
# Create product with image
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Test Product" \
  -F "price=99.99" \
  -F "image=@test-image.jpg"

# Verify image was uploaded
PRODUCT_ID="..."
curl http://localhost:5000/api/admin/products/$PRODUCT_ID

# Should show imageUrl in response
```

---

## Support & Documentation

- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Multer Docs:** https://github.com/expressjs/multer
- **Backend README:** See `unified-backend/README.md`

---

**Last Updated:** 2026-02-25  
**Version:** 1.0.0  
**Status:** Production Ready ✅
