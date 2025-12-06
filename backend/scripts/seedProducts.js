import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import Product from '../src/models/Product.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Seed products from Products.json file
 */
const seedProducts = async () => {
  try {
    console.log('Starting product seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read Products.json file
    const productsFilePath = join(__dirname, '../data/Products.json');
    console.log(`Reading products from: ${productsFilePath}`);

    const productsData = JSON.parse(readFileSync(productsFilePath, 'utf-8'));

    if (!Array.isArray(productsData)) {
      throw new Error('Products.json must contain an array of products');
    }

    console.log(`Found ${productsData.length} products in JSON file`);

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    // Insert or update products
    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const productData of productsData) {
      try {
        // Check if product exists by productId or name
        const query = productData.productId
          ? { productId: productData.productId }
          : { name: productData.name };

        const existingProduct = await Product.findOne(query);

        if (existingProduct) {
          // Update existing product
          await Product.findByIdAndUpdate(existingProduct._id, productData, {
            runValidators: true
          });
          updatedCount++;
          console.log(`Updated: ${productData.name}`);
        } else {
          // Create new product
          await Product.create(productData);
          insertedCount++;
          console.log(`Inserted: ${productData.name}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing product "${productData.name}":`, error.message);
      }
    }

    console.log('\n--- Seeding Summary ---');
    console.log(`Total products in file: ${productsData.length}`);
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('----------------------\n');

    console.log('Product seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedProducts();
