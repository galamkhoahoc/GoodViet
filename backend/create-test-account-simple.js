/**
 * Create or refresh a local test account using credentials supplied at runtime.
 *
 * Required environment variables:
 *   MONGODB_URI
 *   TEST_ACCOUNT_PASSWORD
 *
 * Optional environment variables:
 *   TEST_ACCOUNT_EMAIL (defaults to quicktest@goodviet.com)
 */

require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const TEST_ACCOUNT_EMAIL = process.env.TEST_ACCOUNT_EMAIL || 'quicktest@goodviet.com';
const TEST_ACCOUNT_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD;

if (!MONGODB_URI || !TEST_ACCOUNT_PASSWORD) {
  console.error('MONGODB_URI and TEST_ACCOUNT_PASSWORD are required.');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    email: String,
    passwordHash: String,
    fullName: String,
    phoneNumber: String,
    isActive: Boolean,
    verifiedEmail: Boolean,
    assessmentCompleted: Boolean,
  },
  { timestamps: true, collection: 'users' }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    const passwordHash = await bcrypt.hash(TEST_ACCOUNT_PASSWORD, 12);

    await User.findOneAndUpdate(
      { email: TEST_ACCOUNT_EMAIL.toLowerCase() },
      {
        $set: {
          passwordHash,
          fullName: 'Quick Test User',
          phoneNumber: '0987654321',
          isActive: true,
          verifiedEmail: true,
          assessmentCompleted: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Test account ${TEST_ACCOUNT_EMAIL} is ready.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Unable to create the test account:', error);
  process.exitCode = 1;
});
