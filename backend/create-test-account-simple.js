/**
 * Simple script to create test account via API (using MongoDB shell)
 */

const { execSync } = require('child_process');

const MONGODB_URI = 'mongodb+srv://galamkhoahoctr_db_user:4VQsfyNTe6I3w4E3@glkh2.wtvyhjt.mongodb.net/goodviet?retryWrites=true&w=majority';

console.log('🔧 Creating test account directly in MongoDB...\n');

// Hash for password "Test1234" with bcrypt 12 rounds (pre-computed)
const BCRYPT_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIRQh8p0Ji';

const mongoCommand = `
db.users.findOne({ email: 'quicktest@goodviet.com' }) || 
db.users.insertOne({
  email: 'quicktest@goodviet.com',
  passwordHash: '${BCRYPT_HASH}',
  fullName: 'Quick Test User',
  phoneNumber: '0987654321',
  isActive: true,
  verifiedEmail: true,
  assessmentCompleted: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
`;

try {
  console.log('📝 Executing MongoDB command...');
  const result = execSync(
    `mongosh "${MONGODB_URI}" --eval "${mongoCommand.replace(/\n/g, ' ')}"`,
    { encoding: 'utf-8' }
  );
  
  console.log('\n✅ Success!');
  console.log('\n📋 Test Account:');
  console.log('   Email: quicktest@goodviet.com');
  console.log('   Password: Test1234');
  console.log('\n💡 Run: node test-quick.js\n');
} catch (error) {
  console.log('\n⚠️  MongoDB Shell (mongosh) not found.');
  console.log('Using alternative method...\n');
  
  // Alternative: Create using axios directly
  const axios = require('axios');
  const bcrypt = require('bcrypt');
  
  (async () => {
    const mongoose = require('mongoose');
    await mongoose.connect(MONGODB_URI);
    
    const UserSchema = new mongoose.Schema({
      email: String,
      passwordHash: String,
      fullName: String,
      phoneNumber: String,
      isActive: Boolean,
      verifiedEmail: Boolean,
      assessmentCompleted: Boolean,
    }, { timestamps: true, collection: 'users' });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    const existing = await User.findOne({ email: 'quicktest@goodviet.com' });
    if (existing) {
      console.log('✅ Test account already exists!');
    } else {
      const hash = await bcrypt.hash('Test1234', 12);
      await User.create({
        email: 'quicktest@goodviet.com',
        passwordHash: hash,
        fullName: 'Quick Test User',
        phoneNumber: '0987654321',
        isActive: true,
        verifiedEmail: true,
        assessmentCompleted: false,
      });
      console.log('✅ Test account created!');
    }
    
    console.log('\n📋 Test Account:');
    console.log('   Email: quicktest@goodviet.com');
    console.log('   Password: Test1234');
    console.log('\n💡 Run: node test-quick.js\n');
    
    process.exit(0);
  })();
}
