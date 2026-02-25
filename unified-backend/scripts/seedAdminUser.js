/**
 * Seed admin user script
 * Creates or promotes a user to ADMIN role
 * 
 * Usage:
 *   node scripts/seedAdminUser.js
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Creates an admin user or promotes existing one
 * 3. Displays admin credentials
 */

import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import { ROLES } from '../constants/roles.js';
import User from '../models/User.js';

dotenv.config();

const seedAdminUser = async () => {
  try {
    console.log('🔑 Starting admin user creation...\n');

    // Connect to database
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecommerce.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123';

    // Check if admin already exists
    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      // Promote to admin if not already
      if (adminUser.role !== ROLES.ADMIN) {
        adminUser.role = ROLES.ADMIN;
        await adminUser.save();
        console.log(`✅ Promoted existing user to ADMIN: ${adminEmail}\n`);
      } else {
        console.log(`⚠️ Admin user already exists: ${adminEmail}\n`);
        console.log(`📊 Admin Details:`);
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   Created: ${adminUser.createdAt}\n`);
      }
    } else {
      // Create new admin user
      adminUser = new User({
        name: 'Administrator',
        email: adminEmail,
        passwordHash: adminPassword, // Will be hashed by pre-save middleware
        role: ROLES.ADMIN,
        isActive: true,
        isEmailVerified: true
      });

      await adminUser.save();

      console.log(`✅ Created admin user successfully!\n`);
      console.log(`📊 Admin Credentials:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   Role: ${ROLES.ADMIN}\n`);
      console.log(`⚠️  IMPORTANT: Change the password after first login!`);
    }

    console.log(`🔒 Login URL: http://localhost:5173/login\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Admin creation error:', error.message);
    process.exit(1);
  }
};

// Run seed
seedAdminUser();
