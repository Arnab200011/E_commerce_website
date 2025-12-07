import mongoose from 'mongoose';

const db = 'mongodb://localhost:27017/ecommerce';

async function checkProduct() {
  try {
    await mongoose.connect(db);
    const connection = mongoose.connection;
    
    // Get any collection and check first document
    const collections = await connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const productsCollection = connection.collection('products');
    const doc = await productsCollection.findOne({});
    
    if (doc) {
      console.log('\nSample Product Document:');
      console.log(JSON.stringify({
        _id: doc._id,
        u_id: doc.u_id,
        name: doc.name,
        images: doc.images,
        image: doc.image,
        rating: doc.rating,
        original_price: doc.original_price
      }, null, 2));
    } else {
      console.log('No products found');
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkProduct();
