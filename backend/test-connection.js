// Simple test script to verify MongoDB Atlas connection
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log(`📍 URI: ${process.env.MONGODB_URI?.substring(0, 50)}...`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🎯 Connection state: ${mongoose.connection.readyState}`);
    
    // Try to list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📂 Collections (${collections.length}):`, collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
