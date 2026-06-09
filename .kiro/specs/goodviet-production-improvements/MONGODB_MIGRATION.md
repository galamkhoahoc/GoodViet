# MongoDB Atlas Migration Guide

## Overview

This document provides a complete guide for implementing the GOODVIET backend using **MongoDB Atlas** instead of PostgreSQL.

**Your MongoDB Atlas Connection:**
```
mongodb+srv://galamkhoahoctr_db_user:4VQsfyNTe6I3w4E3@glkh2.wtvyhjt.mongodb.net/goodviet?retryWrites=true&w=majority
```

---

## Key Technology Changes

### Before (Original Design)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Schema**: SQL tables with foreign keys
- **Deployment**: Railway/Supabase/AWS RDS

### After (MongoDB Version)
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 8.x (recommended) or Prisma for MongoDB
- **Schema**: Collections with embedded documents and references
- **Deployment**: MongoDB Atlas Cloud (already provisioned)

---

## MongoDB Atlas Setup

### 1. Connection Configuration

**Environment Variable (.env):**
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://galamkhoahoctr_db_user:4VQsfyNTe6I3w4E3@glkh2.wtvyhjt.mongodb.net/goodviet?retryWrites=true&w=majority

# Alternative format for local development
MONGODB_URI_LOCAL=mongodb://localhost:27017/goodviet
```

### 2. Install Dependencies

**Using Mongoose (Recommended):**
```bash
cd backend
npm install mongoose
npm install --save-dev @types/mongoose
```

**Using Prisma for MongoDB (Alternative):**
```bash
cd backend
npm install prisma @prisma/client
npx prisma init --datasource-provider mongodb
```

### 3. Test Connection

**Test script (backend/src/config/database.ts):**
```typescript
import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

---

## MongoDB Schema Design

### Design Principles for MongoDB

1. **Embed vs Reference**:
   - Embed: One-to-few relationships, data accessed together (user profile fields)
   - Reference: One-to-many, many-to-many (user → assessments, user → practice sessions)

2. **Denormalization**:
   - Duplicate frequently accessed data for read performance
   - Example: Store user name in chat messages to avoid joins

3. **Array Fields**:
   - Use arrays for one-to-many relationships when child count is bounded
   - Example: pronunciationIssues array in Assessment

### Complete Mongoose Schema Definitions

#### **User Schema**
```typescript
// backend/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  
  // Account status
  isActive: boolean;
  verifiedEmail: boolean;
  lastLoginAt?: Date;
  
  // Profile
  profileImageUrl?: string;
  targetGoals?: string;
  learningStyle?: string;
  
  // Assessment (embedded flag)
  assessmentCompleted: boolean;
  currentPathwayId?: mongoose.Types.ObjectId;
  
  // Timestamps (auto-managed)
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    index: true 
  },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, trim: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  
  isActive: { type: Boolean, default: true },
  verifiedEmail: { type: Boolean, default: false },
  lastLoginAt: Date,
  
  profileImageUrl: String,
  targetGoals: String,
  learningStyle: String,
  
  assessmentCompleted: { type: Boolean, default: false },
  currentPathwayId: { type: Schema.Types.ObjectId, ref: 'PracticePathway' }
}, { 
  timestamps: true,
  collection: 'users'
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
```

#### **Assessment Schema**
```typescript
// backend/src/models/Assessment.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IPronunciationIssue {
  phoneme: 'L/N' | 'TR/CH' | 'S/X';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  timestamps: number[]; // seconds into recording
  detectedWord?: string;
  expectedWord?: string;
}

export interface IAssessment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Completion status
  completedAt?: Date;
  phase: 'not_started' | 'phase_1' | 'phase_2' | 'phase_3' | 'processing' | 'completed';
  
  // Results (embedded)
  overallScore?: number;
  clarityScore?: number;
  fluencyScore?: number;
  speechRate?: number; // words per minute
  confidenceLevel?: 'low' | 'medium' | 'high';
  
  // Pronunciation issues (embedded array)
  pronunciationIssues: IPronunciationIssue[];
  
  // Recommended pathway
  recommendedPathwayId?: mongoose.Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const PronunciationIssueSchema = new Schema({
  phoneme: { type: String, enum: ['L/N', 'TR/CH', 'S/X'], required: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
  description: { type: String, required: true },
  timestamps: [{ type: Number }],
  detectedWord: String,
  expectedWord: String
}, { _id: false });

const AssessmentSchema = new Schema<IAssessment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  completedAt: Date,
  phase: { 
    type: String, 
    enum: ['not_started', 'phase_1', 'phase_2', 'phase_3', 'processing', 'completed'],
    default: 'not_started'
  },
  
  overallScore: { type: Number, min: 0, max: 100 },
  clarityScore: { type: Number, min: 0, max: 100 },
  fluencyScore: { type: Number, min: 0, max: 100 },
  speechRate: { type: Number, min: 0 },
  confidenceLevel: { type: String, enum: ['low', 'medium', 'high'] },
  
  pronunciationIssues: [PronunciationIssueSchema],
  
  recommendedPathwayId: { type: Schema.Types.ObjectId, ref: 'PracticePathway' }
}, { 
  timestamps: true,
  collection: 'assessments'
});

// Indexes
AssessmentSchema.index({ userId: 1 });
AssessmentSchema.index({ completedAt: -1 });
AssessmentSchema.index({ userId: 1, phase: 1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
```

#### **AudioRecording Schema**
```typescript
// backend/src/models/AudioRecording.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAudioRecording extends Document {
  _id: mongoose.Types.ObjectId;
  assessmentId?: mongoose.Types.ObjectId;
  practiceSessionId?: mongoose.Types.ObjectId;
  
  // Recording details
  phase?: 'phase_1' | 'phase_2' | 'phase_3';
  sentenceId?: string;
  exerciseId?: string;
  
  // File information
  fileUrl: string; // S3/GCS URL
  fileSize: number; // bytes
  duration: number; // seconds
  format: 'wav' | 'webm';
  sampleRate: number; // Hz
  
  // Upload metadata
  uploadedAt: Date;
}

const AudioRecordingSchema = new Schema<IAudioRecording>({
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', index: true },
  practiceSessionId: { type: Schema.Types.ObjectId, ref: 'PracticeSession', index: true },
  
  phase: { type: String, enum: ['phase_1', 'phase_2', 'phase_3'] },
  sentenceId: String,
  exerciseId: String,
  
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  duration: { type: Number, required: true },
  format: { type: String, enum: ['wav', 'webm'], required: true },
  sampleRate: { type: Number, required: true },
  
  uploadedAt: { type: Date, default: Date.now }
}, { 
  timestamps: false,
  collection: 'audio_recordings'
});

// Indexes
AudioRecordingSchema.index({ assessmentId: 1 });
AudioRecordingSchema.index({ practiceSessionId: 1 });
AudioRecordingSchema.index({ uploadedAt: -1 });

export const AudioRecording = mongoose.model<IAudioRecording>('AudioRecording', AudioRecordingSchema);
```

#### **PracticePathway Schema**
```typescript
// backend/src/models/PracticePathway.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IWeekContent {
  weekNumber: number;
  days: Array<{
    dayNumber: number;
    exercises: Array<{
      id: string;
      type: 'reading' | 'listening' | 'speaking';
      title: string;
      instructions: string;
      sentences?: string[];
      audioUrl?: string;
    }>;
    videoTutorial?: {
      url: string;
      duration: number;
      title: string;
    };
  }>;
}

export interface IPracticePathway extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  durationDays: number;
  targetPhonemes: string[]; // ['L/N', 'TR/CH', 'S/X']
  
  // Content (embedded)
  weeks: IWeekContent[];
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['reading', 'listening', 'speaking'], required: true },
  title: { type: String, required: true },
  instructions: { type: String, required: true },
  sentences: [String],
  audioUrl: String
}, { _id: false });

const DaySchema = new Schema({
  dayNumber: { type: Number, required: true },
  exercises: [ExerciseSchema],
  videoTutorial: {
    url: String,
    duration: Number,
    title: String
  }
}, { _id: false });

const WeekSchema = new Schema({
  weekNumber: { type: Number, required: true },
  days: [DaySchema]
}, { _id: false });

const PracticePathwaySchema = new Schema<IPracticePathway>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  durationDays: { type: Number, required: true },
  targetPhonemes: [{ type: String }],
  
  weeks: [WeekSchema],
  
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true,
  collection: 'practice_pathways'
});

// Indexes
PracticePathwaySchema.index({ isActive: 1 });
PracticePathwaySchema.index({ targetPhonemes: 1 });

export const PracticePathway = mongoose.model<IPracticePathway>('PracticePathway', PracticePathwaySchema);
```

#### **PracticeProgress Schema**
```typescript
// backend/src/models/PracticeProgress.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticeProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pathwayId: mongoose.Types.ObjectId;
  
  // Progress tracking
  currentWeek: number;
  currentDay: number;
  startedAt: Date;
  completedAt?: Date;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const PracticeProgressSchema = new Schema<IPracticeProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  pathwayId: { type: Schema.Types.ObjectId, ref: 'PracticePathway', required: true },
  
  currentWeek: { type: Number, default: 1, min: 1 },
  currentDay: { type: Number, default: 1, min: 1 },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  
  currentStreak: { type: Number, default: 0, min: 0 },
  longestStreak: { type: Number, default: 0, min: 0 },
  lastCheckIn: Date
}, { 
  timestamps: true,
  collection: 'practice_progress'
});

// Indexes
PracticeProgressSchema.index({ userId: 1 });
PracticeProgressSchema.index({ userId: 1, pathwayId: 1 });

export const PracticeProgress = mongoose.model<IPracticeProgress>('PracticeProgress', PracticeProgressSchema);
```

#### **PracticeSession Schema**
```typescript
// backend/src/models/PracticeSession.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticeSession extends Document {
  _id: mongoose.Types.ObjectId;
  progressId: mongoose.Types.ObjectId;
  
  // Session details
  week: number;
  day: number;
  completedAt: Date;
  
  // Performance
  exercisesCompleted: number;
  accuracyScore?: number;
}

const PracticeSessionSchema = new Schema<IPracticeSession>({
  progressId: { type: Schema.Types.ObjectId, ref: 'PracticeProgress', required: true, index: true },
  
  week: { type: Number, required: true },
  day: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  
  exercisesCompleted: { type: Number, required: true, min: 0 },
  accuracyScore: { type: Number, min: 0, max: 100 }
}, { 
  timestamps: false,
  collection: 'practice_sessions'
});

// Indexes
PracticeSessionSchema.index({ progressId: 1 });
PracticeSessionSchema.index({ completedAt: -1 });

export const PracticeSession = mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);
```

#### **ChatMessage Schema**
```typescript
// backend/src/models/ChatMessage.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Message details
  senderType: 'user' | 'bot';
  content: string;
  timestamp: Date;
  
  // Bot metadata (for bot messages)
  promptTokens?: number;
  completionTokens?: number;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  senderType: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  
  promptTokens: Number,
  completionTokens: Number
}, { 
  timestamps: false,
  collection: 'chat_messages'
});

// Compound index for efficient pagination
ChatMessageSchema.index({ userId: 1, timestamp: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
```

#### **Expert, ExpertConnection, ExpertSession Schemas**
```typescript
// backend/src/models/Expert.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IExpert extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
  
  // Professional info
  licenseNumber: string;
  specializations: string[];
  bio: string;
  profileImageUrl?: string;
  
  // Ratings
  averageRating: number;
  totalRatings: number;
  
  // Availability
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ExpertSchema = new Schema<IExpert>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  
  licenseNumber: { type: String, required: true },
  specializations: [{ type: String }],
  bio: { type: String, required: true },
  profileImageUrl: String,
  
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0, min: 0 },
  
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true,
  collection: 'experts'
});

// Indexes
ExpertSchema.index({ isActive: 1, averageRating: -1 });
ExpertSchema.index({ specializations: 1 });

export const Expert = mongoose.model<IExpert>('Expert', ExpertSchema);

// ExpertConnection Schema
export interface IExpertConnection extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  
  // Connection status
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: Date;
  respondedAt?: Date;
}

const ExpertConnectionSchema = new Schema<IExpertConnection>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true, index: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined'], 
    default: 'pending' 
  },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: Date
}, { 
  timestamps: false,
  collection: 'expert_connections'
});

// Unique constraint on user-expert pair
ExpertConnectionSchema.index({ userId: 1, expertId: 1 }, { unique: true });

export const ExpertConnection = mongoose.model<IExpertConnection>('ExpertConnection', ExpertConnectionSchema);

// ExpertSession Schema
export interface IExpertSession extends Document {
  _id: mongoose.Types.ObjectId;
  connectionId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  
  // Session details
  scheduledAt: Date;
  duration: number; // minutes
  sessionType: 'initial_consultation' | 'follow_up' | 'progress_review';
  status: 'scheduled' | 'completed' | 'cancelled';
  
  // Meeting details
  meetingUrl?: string;
  notes?: string;
  
  // Rating
  rating?: number; // 1-5
  feedback?: string;
  
  // Timestamps
  createdAt: Date;
  completedAt?: Date;
}

const ExpertSessionSchema = new Schema<IExpertSession>({
  connectionId: { type: Schema.Types.ObjectId, ref: 'ExpertConnection', required: true, index: true },
  expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true, index: true },
  
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true, min: 15 },
  sessionType: { 
    type: String, 
    enum: ['initial_consultation', 'follow_up', 'progress_review'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  meetingUrl: String,
  notes: String,
  
  rating: { type: Number, min: 1, max: 5 },
  feedback: String,
  
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
}, { 
  timestamps: false,
  collection: 'expert_sessions'
});

// Indexes
ExpertSessionSchema.index({ connectionId: 1 });
ExpertSessionSchema.index({ expertId: 1, scheduledAt: 1 });

export const ExpertSession = mongoose.model<IExpertSession>('ExpertSession', ExpertSessionSchema);
```

---

## Implementation Changes in Tasks

### Modified Task 1: Database Setup (Week 1)

**Task 1.2: Set up MongoDB Atlas and Mongoose**
```
- Provision MongoDB Atlas cluster (already done)
- Create database user with appropriate permissions (already done)
- Whitelist IP addresses for backend servers
- Install Mongoose ODM: npm install mongoose @types/mongoose
- Create connection configuration in src/config/database.ts
- Test connection to MongoDB Atlas
- Requirements: 9, 10, 18
```

**Task 1.3: Create Mongoose schemas for User and Assessment**
```
- Define User schema with email, passwordHash, profile fields
- Define Assessment schema with phases, scores, pronunciationIssues (embedded array)
- Define AudioRecording schema with file metadata and references
- Add indexes for userId, email, timestamp fields
- Export models from src/models/
- Requirements: 10, 12, 18
```

### Modified Dependencies

**package.json changes:**
```json
{
  "dependencies": {
    "mongoose": "^8.0.0",
    // Remove: "prisma": "^5.0.0",
    // Remove: "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "@types/mongoose": "^5.11.97"
  }
}
```

---

## Query Examples (Mongoose vs Prisma)

### User Registration

**Mongoose:**
```typescript
import { User } from './models/User';
import bcrypt from 'bcrypt';

async function registerUser(email: string, password: string, fullName: string) {
  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Create user
  const user = await User.create({
    email,
    passwordHash,
    fullName
  });
  
  return user;
}
```

**Prisma (original):**
```typescript
import { prisma } from './config/database';

async function registerUser(email: string, password: string, fullName: string) {
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      fullName
    }
  });
  return user;
}
```

### Get Assessment with Recordings

**Mongoose:**
```typescript
import { Assessment } from './models/Assessment';
import { AudioRecording } from './models/AudioRecording';

async function getAssessmentWithRecordings(userId: string) {
  const assessment = await Assessment.findOne({ userId })
    .populate('recommendedPathwayId')
    .lean();
  
  if (!assessment) return null;
  
  const recordings = await AudioRecording.find({ 
    assessmentId: assessment._id 
  }).lean();
  
  return { ...assessment, recordings };
}
```

### Update Practice Streak

**Mongoose:**
```typescript
import { PracticeProgress } from './models/PracticeProgress';

async function updateStreak(userId: string) {
  const progress = await PracticeProgress.findOne({ userId });
  if (!progress) throw new Error('Progress not found');
  
  const lastCheckIn = progress.lastCheckIn;
  const now = new Date();
  
  // Calculate if streak continues
  if (lastCheckIn) {
    const daysDiff = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Continue streak
      progress.currentStreak += 1;
      progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
    } else if (daysDiff > 1) {
      // Streak broken
      progress.currentStreak = 1;
    }
    // daysDiff === 0 means already checked in today, no change
  } else {
    // First check-in
    progress.currentStreak = 1;
    progress.longestStreak = 1;
  }
  
  progress.lastCheckIn = now;
  await progress.save();
  
  return progress;
}
```

---

## Migration Checklist

### ✅ Completed
- [x] MongoDB Atlas cluster provisioned
- [x] Database credentials received
- [x] Connection string obtained

### 📝 To Do

**Phase 1: Schema Design**
- [ ] Review all Mongoose schemas above
- [ ] Adjust embedded vs referenced data based on your needs
- [ ] Define additional indexes for performance

**Phase 2: Backend Setup**
- [ ] Install Mongoose: `npm install mongoose @types/mongoose`
- [ ] Create `src/config/database.ts` with connection logic
- [ ] Create `src/models/` directory
- [ ] Implement all schemas (User, Assessment, AudioRecording, etc.)
- [ ] Test database connection

**Phase 3: API Implementation**
- [ ] Replace Prisma queries with Mongoose queries
- [ ] Update controllers to use Mongoose models
- [ ] Test all CRUD operations
- [ ] Verify indexes are created

**Phase 4: Testing**
- [ ] Unit test all models
- [ ] Integration test all API endpoints
- [ ] Test with real MongoDB Atlas connection

---

## Advantages of MongoDB for GOODVIET

✅ **Flexible Schema**: Easy to evolve without migrations
✅ **Embedded Documents**: Store pronunciationIssues array directly in Assessment
✅ **Horizontal Scalability**: MongoDB Atlas auto-scales
✅ **Cloud-Native**: MongoDB Atlas handles backups, monitoring, security
✅ **JSON-Native**: Perfect for storing assessment results, pathway content
✅ **Fast Reads**: Embedded data reduces joins

---

## Next Steps

1. **Install Mongoose** in your backend project
2. **Copy schema definitions** from this document
3. **Test connection** to your MongoDB Atlas cluster
4. **Implement API endpoints** using Mongoose queries
5. **Update tasks.md** with MongoDB-specific sub-tasks

Your MongoDB Atlas cluster is ready to use! 🎉
