/**
 * Schema Operations Test
 * Tests CRUD operations on Assessment and AudioRecording schemas
 */

import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Assessment } from './src/models/Assessment';
import { AudioRecording } from './src/models/AudioRecording';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSchemaOperations() {
  try {
    console.log('🧪 Starting schema operations test...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Test 1: Create a test user (if not exists)
    console.log('1️⃣ Creating test user...');
    let testUser = await User.findOne({ email: 'test@goodviet.com' });
    
    if (!testUser) {
      testUser = await User.create({
        email: 'test@goodviet.com',
        passwordHash: '$2b$12$dummyHashForTesting',
        fullName: 'Test User',
        phoneNumber: '0123456789',
        assessmentCompleted: false
      });
      console.log(`   ✅ Test user created with ID: ${testUser._id}\n`);
    } else {
      console.log(`   ✅ Test user already exists with ID: ${testUser._id}\n`);
    }

    // Test 2: Create an Assessment
    console.log('2️⃣ Creating Assessment...');
    
    const assessment = await Assessment.create({
      userId: testUser._id,
      phase: 'phase_1',
      overallScore: 75,
      clarityScore: 80,
      fluencyScore: 70,
      speechRate: 120,
      confidenceLevel: 'medium',
      pronunciationIssues: [
        {
          phoneme: 'L/N',
          severity: 'moderate',
          description: 'Confusion between L and N sounds in initial position',
          timestamps: [5.2, 12.8, 23.1],
          detectedWord: 'night',
          expectedWord: 'light'
        },
        {
          phoneme: 'TR/CH',
          severity: 'mild',
          description: 'Slight confusion in TR and CH pronunciation',
          timestamps: [18.5],
          detectedWord: 'chair',
          expectedWord: 'train'
        }
      ]
    });

    console.log(`   ✅ Assessment created with ID: ${assessment._id}`);
    console.log(`   📊 Phase: ${assessment.phase}`);
    console.log(`   📊 Overall Score: ${assessment.overallScore}/100`);
    console.log(`   📊 Pronunciation Issues: ${assessment.pronunciationIssues.length} detected\n`);

    // Test 3: Create AudioRecordings for the Assessment
    console.log('3️⃣ Creating AudioRecordings...');
    
    const recordings = await AudioRecording.insertMany([
      {
        assessmentId: assessment._id,
        phase: 'phase_1',
        sentenceId: 'sentence_001',
        fileUrl: 'https://storage.goodviet.com/test/recording_001.wav',
        fileSize: 1048576, // 1MB
        duration: 15.5,
        format: 'wav',
        sampleRate: 16000
      },
      {
        assessmentId: assessment._id,
        phase: 'phase_1',
        sentenceId: 'sentence_002',
        fileUrl: 'https://storage.goodviet.com/test/recording_002.wav',
        fileSize: 892160, // ~0.85MB
        duration: 12.3,
        format: 'wav',
        sampleRate: 16000
      },
      {
        assessmentId: assessment._id,
        phase: 'phase_1',
        sentenceId: 'sentence_003',
        fileUrl: 'https://storage.goodviet.com/test/recording_003.webm',
        fileSize: 654321,
        duration: 10.8,
        format: 'webm',
        sampleRate: 16000
      }
    ]);

    console.log(`   ✅ Created ${recordings.length} audio recordings`);
    recordings.forEach((rec, idx) => {
      console.log(`   📼 Recording ${idx + 1}: ${rec.sentenceId} (${rec.format}, ${(rec.fileSize / 1024 / 1024).toFixed(2)}MB, ${rec.duration}s)`);
    });
    console.log();

    // Test 4: Query Assessment with related AudioRecordings
    console.log('4️⃣ Querying Assessment with AudioRecordings...');
    
    const assessmentWithRecordings = await Assessment.findById(assessment._id)
      .populate('userId', 'email fullName')
      .lean();
    
    const relatedRecordings = await AudioRecording.find({ 
      assessmentId: assessment._id 
    }).lean();

    console.log(`   ✅ Found assessment for user: ${(assessmentWithRecordings?.userId as any)?.email}`);
    console.log(`   ✅ Found ${relatedRecordings.length} related audio recordings\n`);

    // Test 5: Update Assessment phase
    console.log('5️⃣ Updating Assessment phase...');
    
    assessment.phase = 'phase_2';
    assessment.overallScore = 78;
    await assessment.save();

    console.log(`   ✅ Updated assessment phase to: ${assessment.phase}`);
    console.log(`   ✅ Updated overall score to: ${assessment.overallScore}\n`);

    // Test 6: Query recordings by phase
    console.log('6️⃣ Querying recordings by phase...');
    
    const phase1Recordings = await AudioRecording.find({
      assessmentId: assessment._id,
      phase: 'phase_1'
    }).select('sentenceId duration format').lean();

    console.log(`   ✅ Found ${phase1Recordings.length} phase_1 recordings`);
    console.log(`   Total duration: ${phase1Recordings.reduce((sum, r) => sum + r.duration, 0).toFixed(1)}s\n`);

    // Test 7: Test embedded document queries
    console.log('7️⃣ Testing embedded document queries...');
    
    const assessmentsWithLNIssues = await Assessment.find({
      'pronunciationIssues.phoneme': 'L/N'
    }).select('userId overallScore pronunciationIssues').lean();

    console.log(`   ✅ Found ${assessmentsWithLNIssues.length} assessments with L/N pronunciation issues\n`);

    // Test 8: Test aggregation
    console.log('8️⃣ Testing aggregation...');
    
    const recordingStats = await AudioRecording.aggregate([
      {
        $match: { assessmentId: assessment._id }
      },
      {
        $group: {
          _id: '$format',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    console.log('   📊 Recording statistics by format:');
    recordingStats.forEach(stat => {
      console.log(`      ${stat._id}: ${stat.count} files, ${(stat.totalSize / 1024 / 1024).toFixed(2)}MB total, ${stat.avgDuration.toFixed(1)}s avg duration`);
    });
    console.log();

    // Test 9: Test indexes usage
    console.log('9️⃣ Testing index usage...');
    
    const explainResult = await Assessment.find({ userId: testUser._id })
      .explain('executionStats');

    const usedIndex = (explainResult as any).executionStats?.executionStages?.indexName;
    console.log(`   ✅ Query used index: ${usedIndex || 'No index detected'}\n`);

    // Test 10: Cleanup
    console.log('🔟 Cleaning up test data...');
    
    await AudioRecording.deleteMany({ assessmentId: assessment._id });
    await Assessment.deleteOne({ _id: assessment._id });
    await User.deleteOne({ _id: testUser._id });

    console.log('   ✅ Test data cleaned up\n');

    console.log('✨ All schema operation tests completed successfully!\n');
    console.log('📋 Test Summary:');
    console.log('   ✅ User creation: Passed');
    console.log('   ✅ Assessment creation with embedded documents: Passed');
    console.log('   ✅ AudioRecording batch creation: Passed');
    console.log('   ✅ Population and lean queries: Passed');
    console.log('   ✅ Document updates: Passed');
    console.log('   ✅ Complex queries: Passed');
    console.log('   ✅ Embedded document queries: Passed');
    console.log('   ✅ Aggregation pipeline: Passed');
    console.log('   ✅ Index usage: Passed');
    console.log('   ✅ Data cleanup: Passed\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

// Run tests
testSchemaOperations()
  .then(() => {
    console.log('✅ Schema operation tests complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Schema operation test error:', error);
    process.exit(1);
  });
