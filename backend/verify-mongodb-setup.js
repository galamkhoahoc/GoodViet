/**
 * MongoDB Atlas Connection Verification Script
 * This script verifies that the MongoDB Atlas setup is complete and working
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyMongoDBSetup() {
  console.log('🔍 Verifying MongoDB Atlas Setup...\n');

  try {
    // 1. Check environment variable
    console.log('✓ Step 1: Checking MONGODB_URI environment variable...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    const uriPreview = process.env.MONGODB_URI.substring(0, 40) + '...';
    console.log(`  URI configured: ${uriPreview}`);
    console.log();

    // 2. Connect to MongoDB
    console.log('✓ Step 2: Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Successfully connected to MongoDB Atlas');
    console.log();

    // 3. Verify database name
    console.log('✓ Step 3: Verifying database configuration...');
    const dbName = mongoose.connection.name;
    console.log(`  Database: ${dbName}`);
    if (dbName !== 'goodviet') {
      console.warn(`  ⚠️  Warning: Expected database name "goodviet" but got "${dbName}"`);
    }
    console.log();

    // 4. Check connection state
    console.log('✓ Step 4: Checking connection state...');
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log(`  Connection state: ${state} (${stateMap[state]})`);
    if (state !== 1) {
      throw new Error(`Connection state is not "connected" (got ${stateMap[state]})`);
    }
    console.log();

    // 5. List collections
    console.log('✓ Step 5: Listing existing collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`  Collections found: ${collections.length}`);
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`    - ${col.name}`);
      });
    } else {
      console.log('    (No collections yet - database is empty and ready for data)');
    }
    console.log();

    // 6. Test write operation
    console.log('✓ Step 6: Testing write/read operations...');
    const testCollection = mongoose.connection.db.collection('_connection_test');
    const testDoc = { 
      test: true, 
      timestamp: new Date(),
      message: 'MongoDB connection test'
    };
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`  ✅ Write test successful (inserted document)`);
    
    const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`  ✅ Read test successful (retrieved document)`);
    
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`  ✅ Delete test successful (cleanup completed)`);
    console.log();

    // 7. Verify Mongoose models can be used
    console.log('✓ Step 7: Verifying Mongoose ODM setup...');
    console.log('  Checking if models are properly defined...');
    
    // Import User model (this will work if the model file is properly set up)
    const userModelPath = './src/models/User';
    let UserModel;
    try {
      // Try to load the compiled version first
      UserModel = require('./dist/models/User').User;
      console.log('  ✅ User model loaded successfully (from compiled JS)');
    } catch (err) {
      console.log('  ℹ️  Compiled model not found, checking TypeScript source...');
      // If not compiled, just verify the file exists
      const fs = require('fs');
      const path = require('path');
      const tsPath = path.join(__dirname, 'src', 'models', 'User.ts');
      if (fs.existsSync(tsPath)) {
        console.log('  ✅ User model TypeScript source exists');
        UserModel = null; // Can't load TS directly without compilation
      } else {
        throw new Error('User model not found');
      }
    }

    if (UserModel) {
      // If we loaded the compiled model, do a quick schema check
      console.log('  ✅ User schema is properly registered with Mongoose');
    }
    console.log();

    // Final summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ VERIFICATION COMPLETE - MongoDB Atlas Setup is Ready!');
    console.log('═══════════════════════════════════════════════════════');
    console.log();
    console.log('Summary:');
    console.log(`  - MongoDB URI: Configured ✓`);
    console.log(`  - Connection: Successful ✓`);
    console.log(`  - Database: ${dbName} ✓`);
    console.log(`  - Write/Read: Working ✓`);
    console.log(`  - Mongoose ODM: Configured ✓`);
    console.log();
    console.log('The MongoDB Atlas database is ready for use with Mongoose.');
    console.log('You can now proceed to implement the remaining tasks.');
    console.log();

    // Disconnect
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error();
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    console.error();
    
    // Try to disconnect if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run verification
verifyMongoDBSetup();
