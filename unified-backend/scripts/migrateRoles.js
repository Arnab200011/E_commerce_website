/**
 * Migration script to normalize user roles
 * Converts old role naming ('user', 'admin') to new naming ('USER', 'ADMIN')
 * 
 * Usage:
 *   node scripts/migrateRoles.js
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Migration from old systems (if applicable)
 * 3. Normalizes all role values
 * 4. Displays summary of changes
 */

import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const migrateRoles = async () => {
  try {
    console.log('🔄 Starting role migration script...\n');

    // Connect to database
    await connectDB();

    // Migration 1: Convert lowercase 'user' to 'USER'
    const userUpdateResult = await User.updateMany(
      { role: 'user' },
      { $set: { role: 'USER' } }
    );

    if (userUpdateResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${userUpdateResult.modifiedCount} 'user' → 'USER'`);
    }

    // Migration 2: Convert lowercase 'admin' to 'ADMIN'
    const adminUpdateResult = await User.updateMany(
      { role: 'admin' },
      { $set: { role: 'ADMIN' } }
    );

    if (adminUpdateResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${adminUpdateResult.modifiedCount} 'admin' → 'ADMIN'`);
    }

    // Migration 3: Convert 'moderator' to 'USER' (or 'ADMIN' depending on preference)
    const moderatorUpdateResult = await User.updateMany(
      { role: 'moderator' },
      { $set: { role: 'ADMIN' } } // Promote moderators to admin
    );

    if (moderatorUpdateResult.modifiedCount > 0) {
      console.log(`✅ Migrated ${moderatorUpdateResult.modifiedCount} 'moderator' → 'ADMIN'`);
    }

    // Get final statistics
    const finalStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Final Role Distribution:');
    finalStats.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count} users`);
    });

    const totalMigrated = 
      userUpdateResult.modifiedCount + 
      adminUpdateResult.modifiedCount + 
      moderatorUpdateResult.modifiedCount;

    console.log(`\n✨ Migration complete! Total: ${totalMigrated} users updated\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
};

// Run migration
migrateRoles();
