import mongoose from 'mongoose';
import OTP from '../models/OTP';

const updateOTPIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Get current indexes
    const currentIndexes = await OTP.collection.indexes();
    console.log('\nCurrent indexes:', currentIndexes);

    // Drop all existing indexes except _id
    const indexesToDrop = currentIndexes
      .filter(index => index.name !== '_id_')
      .map(index => index.name)
      .filter((name): name is string => name !== undefined);
    
    if (indexesToDrop.length > 0) {
      for (const indexName of indexesToDrop) {
        await OTP.collection.dropIndex(indexName);
        console.log(`Dropped index: ${indexName}`);
      }
    }

    // Create new indexes
    console.log('\nCreating new indexes...');

    // TTL index for expired OTPs
    await OTP.collection.createIndex(
      { expiry: 1 },
      { 
        expireAfterSeconds: 0,
        name: 'expiry_ttl'
      }
    );
    console.log('✅ Created TTL index on expiry field');

    // TTL index for rate limiting
    await OTP.collection.createIndex(
      { createdAt: 1 },
      { 
        expireAfterSeconds: 600, // 10 minutes
        name: 'createdAt_ttl'
      }
    );
    console.log('✅ Created TTL index on createdAt field');

    // Compound index for queries
    await OTP.collection.createIndex(
      { email: 1, expiry: 1 },
      { name: 'email_expiry' }
    );
    console.log('✅ Created compound index on email and expiry');

    // Index for rate limiting queries
    await OTP.collection.createIndex(
      { email: 1, createdAt: -1 },
      { name: 'email_createdAt' }
    );
    console.log('✅ Created index for rate limiting');

    // Verify indexes
    const updatedIndexes = await OTP.collection.indexes();
    console.log('\nUpdated indexes:', updatedIndexes);

    await mongoose.disconnect();
    console.log('\n✅ All indexes updated successfully');
  } catch (error) {
    console.error('❌ Error updating indexes:', error);
    process.exit(1);
  }
};

updateOTPIndexes().catch(console.error);
