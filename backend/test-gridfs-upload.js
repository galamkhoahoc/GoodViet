const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testGridFSUpload() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import GridFS functions
    const { uploadToGridFS, downloadFromGridFS, deleteFromGridFS } = require('./src/config/gridfs');

    // Create a test audio buffer (1 second of silence in WAV format)
    const testBuffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
      0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20,
      0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x44, 0xAC, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
      0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
      0x00, 0x00, 0x00, 0x00
    ]);

    console.log('\n📤 Testing upload...');
    const fileId = await uploadToGridFS('test-audio.wav', testBuffer, {
      userId: 'test-user-123',
      mimetype: 'audio/wav',
      size: testBuffer.length
    });
    console.log('✅ Upload successful! File ID:', fileId.toString());

    console.log('\n📥 Testing download...');
    const downloadedBuffer = await downloadFromGridFS(fileId);
    console.log('✅ Download successful! Size:', downloadedBuffer.length, 'bytes');

    console.log('\n🗑️  Testing delete...');
    await deleteFromGridFS(fileId);
    console.log('✅ Delete successful!');

    console.log('\n🎉 All GridFS operations working correctly!');
    console.log('📦 Storage: MongoDB GridFS');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testGridFSUpload();
