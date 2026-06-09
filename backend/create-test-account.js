/**
 * Create test account directly in MongoDB (bypass rate limiting)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function createTestAccount() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define User schema directly (avoid TypeScript import)
    const UserSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      passwordHash: {
        type: String,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phoneNumber: String,
      dateOfBirth: Date,
      gender: String,
      isActive: { type: Boolean, default: true },
      verifiedEmail: { type: Boolean, default: false },
      lastLoginAt: Date,
      profileImageUrl: String,
      targetGoals: String,
      learningStyle: String,
      assessmentCompleted: { type: Boolean, default: false },
      currentPathwayId: mongoose.Schema.Types.ObjectId,
    }, { 
      timestamps: true,
      collection: 'users'
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const testEmail = 'quicktest@goodviet.com';
    const testPassword = 'Test1234';

    // Check if user already exists
    let user = await User.findOne({ email: testEmail });
    
    if (user) {
      console.log('✅ Test account already exists:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   User ID: ${user._id}`);
      console.log('\n💡 You can now run: node test-quick.js\n');
      process.exit(0);
      return;
    }

    // Create new test user
    console.log('📝 Creating test account...');
    const passwordHash = await bcrypt.hash(testPassword, 12);

    user = await User.create({
      email: testEmail,
      passwordHash: passwordHash,
      fullName: 'Quick Test User',
      phoneNumber: '0987654321',
      isActive: true,
      verifiedEmail: true,
      assessmentCompleted: false
    });

    console.log('✅ Test account created successfully!\n');
    console.log('📋 Account Details:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   User ID: ${user._id}`);
    console.log('\n💡 You can now run: node test-quick.js\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestAccount();
