import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropBadIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Current indexes:');
    indexes.forEach(idx => console.log('  -', idx.name, idx.key));

    // Drop the problematic username_1 index if it exists
    const hasUsernameIndex = indexes.some(idx => idx.name === 'username_1');
    if (hasUsernameIndex) {
      await collection.dropIndex('username_1');
      console.log('✅ Dropped problematic username_1 index');
    } else {
      console.log('ℹ️  username_1 index not found (already clean)');
    }

    // Create a new sparse unique index for username (allowing null values)
    await collection.createIndex({ username: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse unique index on username');

    console.log('✨ Migration complete!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

dropBadIndex();
