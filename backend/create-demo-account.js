/**
 * Create Demo Account for GoodViet
 * 
 * Usage: node create-demo-account.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Demo account credentials
const DEMO_ACCOUNT = {
  email: 'demo@goodviet.com',
  password: 'Demo123!',
  fullName: 'Demo User',
  phoneNumber: '0123456789',
  targetGoals: 'Test all features of GoodViet platform',
  assessmentCompleted: false
};

async function createDemoAccount() {
  try {
    console.log('🚀 Creating demo account...');
    console.log('');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Define User model
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      fullName: { type: String, required: true },
      phoneNumber: String,
      targetGoals: String,
      assessmentCompleted: { type: Boolean, default: false },
      currentPathwayId: mongoose.Schema.Types.ObjectId,
      createdAt: { type: Date, default: Date.now },
      lastLoginAt: Date
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if demo account already exists
    const existingUser = await User.findOne({ email: DEMO_ACCOUNT.email });
    
    if (existingUser) {
      console.log('⚠️  Demo account already exists!');
      console.log('');
      console.log('📧 Email:', DEMO_ACCOUNT.email);
      console.log('🔑 Password:', DEMO_ACCOUNT.password);
      console.log('');
      console.log('Deleting existing demo account...');
      await User.deleteOne({ email: DEMO_ACCOUNT.email });
      console.log('✅ Deleted existing demo account');
      console.log('');
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(DEMO_ACCOUNT.password, 10);

    // Create demo user
    console.log('👤 Creating demo user...');
    const demoUser = await User.create({
      ...DEMO_ACCOUNT,
      password: hashedPassword
    });

    console.log('✅ Demo account created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('        DEMO ACCOUNT CREDENTIALS        ');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📧 Email:    ', DEMO_ACCOUNT.email);
    console.log('🔑 Password: ', DEMO_ACCOUNT.password);
    console.log('👤 Name:     ', DEMO_ACCOUNT.fullName);
    console.log('📱 Phone:    ', DEMO_ACCOUNT.phoneNumber);
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🌐 Use this account to login at:');
    console.log('   https://glkh-good-viet.vercel.app');
    console.log('');
    console.log('💡 Features you can test:');
    console.log('   ✓ User registration & login');
    console.log('   ✓ Chat with AI bot (Gemini)');
    console.log('   ✓ Audio pronunciation assessment');
    console.log('   ✓ Practice sessions');
    console.log('   ✓ Progress tracking');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating demo account:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run
createDemoAccount();
