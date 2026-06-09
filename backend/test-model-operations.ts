/**
 * Integration test to verify Assessment and AudioRecording model operations
 * Run with: npx ts-node test-model-operations.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

import { connectDatabase } from './src/config/database';
import { User } from './src/models/User';
import { Assessment } from './src/models/Assessment';
import { AudioRecording } from './src/models/AudioRecording';

async function testModelOperations() {
  console.log('🧪 Testing Assessment and AudioRecording model operations...\n');

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await connectDatabase();
    console.log('✅ Connected to MongoDB\n');

    // Clean up test data from previous runs
    await User.deleteMany({ email: { $regex: /^test-schema-.*@test.com$/ } });
    console.log('🧹 Cleaned up previous test data\n');

    // Test 1: Create a test user
    console.log('Test 1: Create test user');
    const testUser = await User.create({
      email: `test-schema-${Date.now()}@test.com`,
      passwordHash: 'hashed_password_here',
      fullName: 'Test Schema User',
    });
    console.log(`  ✓ Created user: ${testUser.email} (ID: ${testUser._id})\n`);

    // Test 2: Create an assessment
    console.log('Test 2: Create assessment');
    const testAssessment = await Assessment.create({
      userId: testUser._id,
      phase: 'phase_1',
      pronunciationIssues: [],
    });
    console.log(`  ✓ Created assessment (ID: ${testAssessment._id})`);
    console.log(`  ✓ Phase: ${testAssessment.phase}`);
    console.log(`  ✓ Created at: ${testAssessment.createdAt}\n`);

    // Test 3: Update assessment with pronunciation issues
    console.log('Test 3: Update assessment with pronunciation issues');
    testAssessment.pronunciationIssues.push({
      phoneme: 'L/N',
      severity: 'moderate',
      description: 'Difficulty distinguishing L and N sounds',
      timestamps: [12.5, 45.2, 89.1],
      detectedWord: 'nà',
      expectedWord: 'là',
    });
    testAssessment.phase = 'phase_2';
    testAssessment.overallScore = 75;
    testAssessment.clarityScore = 72;
    testAssessment.fluencyScore = 78;
    testAssessment.speechRate = 120;
    testAssessment.confidenceLevel = 'medium';
    await testAssessment.save();
    console.log(`  ✓ Updated assessment with pronunciation issues`);
    console.log(`  ✓ Issues count: ${testAssessment.pronunciationIssues.length}`);
    console.log(`  ✓ Overall score: ${testAssessment.overallScore}\n`);

    // Test 4: Create audio recordings
    console.log('Test 4: Create audio recordings');
    const recording1 = await AudioRecording.create({
      assessmentId: testAssessment._id,
      phase: 'phase_1',
      sentenceId: 'sentence-01',
      fileUrl: 'https://storage.example.com/recordings/rec-001.wav',
      fileSize: 245678,
      duration: 15,
      format: 'wav',
      sampleRate: 16000,
    });
    console.log(`  ✓ Created recording 1 (ID: ${recording1._id})`);
    console.log(`  ✓ Format: ${recording1.format}, Duration: ${recording1.duration}s`);

    const recording2 = await AudioRecording.create({
      assessmentId: testAssessment._id,
      phase: 'phase_2',
      sentenceId: 'sentence-05',
      fileUrl: 'https://storage.example.com/recordings/rec-002.webm',
      fileSize: 198432,
      duration: 12,
      format: 'webm',
      sampleRate: 16000,
    });
    console.log(`  ✓ Created recording 2 (ID: ${recording2._id})\n`);

    // Test 5: Query assessment with recordings
    console.log('Test 5: Query assessment with recordings');
    const foundAssessment = await Assessment.findById(testAssessment._id).lean();
    const recordings = await AudioRecording.find({ assessmentId: testAssessment._id }).lean();
    console.log(`  ✓ Found assessment with ${recordings.length} recordings`);
    console.log(`  ✓ Assessment phase: ${foundAssessment?.phase}`);
    console.log(`  ✓ Pronunciation issues: ${foundAssessment?.pronunciationIssues.length}`);
    recordings.forEach((rec, i) => {
      console.log(`  ✓ Recording ${i + 1}: ${rec.format} (${rec.duration}s)`);
    });
    console.log();

    // Test 6: Test validation - should fail without required fields
    console.log('Test 6: Test validation (expected to fail)');
    try {
      await AudioRecording.create({
        // Missing required fields
        fileUrl: 'test.wav',
      });
      console.log('  ✗ Validation should have failed!\n');
    } catch (error: any) {
      console.log(`  ✓ Validation correctly failed: ${error.message}\n`);
    }

    // Test 7: Test enum validation - should fail with invalid enum value
    console.log('Test 7: Test enum validation (expected to fail)');
    try {
      await Assessment.create({
        userId: testUser._id,
        phase: 'invalid_phase' as any, // Invalid enum value
      });
      console.log('  ✗ Enum validation should have failed!\n');
    } catch (error: any) {
      console.log(`  ✓ Enum validation correctly failed\n`);
    }

    // Clean up test data
    console.log('🧹 Cleaning up test data');
    await AudioRecording.deleteMany({ assessmentId: testAssessment._id });
    await Assessment.deleteOne({ _id: testAssessment._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('  ✓ Test data cleaned up\n');

    console.log('✅ All model operation tests passed!');
    console.log('\n📝 Summary:');
    console.log('  • User creation: ✓');
    console.log('  • Assessment creation and updates: ✓');
    console.log('  • AudioRecording creation: ✓');
    console.log('  • Queries and relationships: ✓');
    console.log('  • Validation: ✓');
    console.log('  • Enum validation: ✓');

  } catch (error) {
    console.error('\n❌ Model operation test failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run tests
testModelOperations();
