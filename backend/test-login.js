/**
 * Test Login with Demo Account
 * 
 * Usage: node test-login.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const TEST_CREDENTIALS = {
  email: 'demo@goodviet.com',
  password: 'Demo123!'
};

async function testLogin() {
  try {
    console.log('🧪 Testing login with demo account...');
    console.log('');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Define User model
    const UserSchema = new mongoose.Schema({
      email: String,
      passwordHash: String,
      fullName: String,
      phoneNumber: String,
      isActive: Boolean,
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Find user by email
    console.log('🔍 Looking for user:', TEST_CREDENTIALS.email);
    const user = await User.findOne({ email: TEST_CREDENTIALS.email });

    if (!user) {
      console.log('❌ User not found!');
      console.log('');
      console.log('💡 Run: node create-demo-account.js');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.fullName);
    console.log('   Phone:', user.phoneNumber);
    console.log('   Active:', user.isActive);
    console.log('');

    // Verify password
    console.log('🔐 Verifying password...');
    const isValid = await bcrypt.compare(TEST_CREDENTIALS.password, user.passwordHash);

    if (isValid) {
      console.log('✅ PASSWORD CORRECT! Login would succeed.');
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('   ✅ DEMO ACCOUNT IS WORKING!');
      console.log('═══════════════════════════════════════');
      console.log('');
      console.log('📧 Email:    ', TEST_CREDENTIALS.email);
      console.log('🔑 Password: ', TEST_CREDENTIALS.password);
      console.log('');
    } else {
      console.log('❌ PASSWORD INCORRECT! Login would fail.');
      console.log('');
      console.log('💡 Run: node create-demo-account.js to recreate account');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run
testLogin();
