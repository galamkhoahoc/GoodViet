# Design Document: GOODVIET Production Improvements

## Overview

This document provides the comprehensive technical design for transforming GOODVIET from a UI/UX prototype with mock data into a production-ready Vietnamese speech therapy platform. The system serves working adults aged 25-45 who need speech therapy to improve pronunciation of Vietnamese phonemes (L/N, TR/CH, S/X).

### System Purpose

GOODVIET provides:
- **AI-Powered Voice Assessment**: Three-phase screening system that diagnoses pronunciation issues
- **Personalized Practice Pathways**: Structured 1-1.5 month programs targeting specific phoneme errors
- **AI Companion Chatbot**: Gemma 4-powered conversational agent for motivation and guidance
- **Expert Connections**: Platform for booking 1:1 sessions with licensed speech therapists
- **Progress Tracking**: Daily check-ins, streak tracking, and detailed analytics

### Design Principles

1. **Security First**: JWT authentication, encrypted data storage, input sanitization
2. **Offline-First Audio Recording**: IndexedDB caching with automatic cloud sync
3. **Progressive Enhancement**: Core functionality works on mobile devices
4. **Maintain Existing UX**: Preserve Positivus design system and user experience
5. **Scalable Architecture**: Clean separation between frontend, backend, and AI services

### Stakeholders

- **End Users**: Adults 25-45 with Vietnamese pronunciation issues
- **Speech Therapy Experts**: Licensed professionals providing 1:1 consultations
- **Development Team**: Engineers building and maintaining the platform
- **Product Team**: Defining features and user experience

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │         React 19 + TypeScript Frontend             │    │
│  │  - Vite build system                               │    │
│  │  - Zustand state management                        │    │
│  │  - Positivus design system                         │    │
│  │  - MediaRecorder API for audio capture            │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↕                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │              IndexedDB (Offline Storage)            │    │
│  │  - Audio recordings (temp)                         │    │
│  │  - Upload queue                                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTPS/REST
┌─────────────────────────────────────────────────────────────┐
│                     Backend API Layer                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Node.js + Express REST API                │    │
│  │  - JWT authentication middleware                   │    │
│  │  - Request validation (Joi/Zod)                    │    │
│  │  - Rate limiting                                   │    │
│  │  - Error handling & logging                        │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↕                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │         PostgreSQL Database (Primary)              │    │
│  │  - Users, assessments, practice data               │    │
│  │  - Chat history, expert sessions                   │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↕                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Cloud Storage (AWS S3 / GCS)              │    │
│  │  - Audio recordings (WAV/WebM)                     │    │
│  │  - Assessment results                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↕ API Calls
┌─────────────────────────────────────────────────────────────┐
│                      AI Services Layer                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │     Vietnamese Pronunciation Analysis Service      │    │
│  │  - Phoneme detection (L/N, TR/CH, S/X)            │    │
│  │  - Clarity & fluency scoring                      │    │
│  │  - Confidence analysis                            │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↕                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │       Gemma 4 Chatbot Service (Google AI)         │    │
│  │  - Conversational responses                        │    │
│  │  - Context-aware engagement                        │    │
│  │  - Speech therapy guidance                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8.x
- **State Management**: Zustand 5.x
- **Routing**: React Router DOM 7.x
- **Design System**: Positivus (custom CSS, already implemented)
- **Audio Recording**: MediaRecorder API (native browser API)
- **Offline Storage**: IndexedDB (via `idb` library)
- **HTTP Client**: Fetch API with custom wrapper
- **Charts**: Recharts 3.x (already in use)
- **Icons**: Lucide React (already in use)

#### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.x
- **Language**: TypeScript
- **Authentication**: JWT (jsonwebtoken + bcrypt)
- **Validation**: Zod (type-safe schema validation)
- **Database ODM**: Mongoose 8.x (or Prisma 5.x for MongoDB)
- **File Upload**: Multer + multer-s3
- **Rate Limiting**: express-rate-limit
- **CORS**: cors middleware
- **Logging**: Winston + morgan
- **Error Tracking**: Sentry SDK

#### Database & Storage
- **Primary Database**: MongoDB Atlas (hosted on cloud)
- **ODM**: Mongoose 8.x (or Prisma for MongoDB)
- **Cloud Storage**: AWS S3 or Google Cloud Storage
- **Caching**: Redis (optional for sessions/rate limiting)

#### AI Services
- **Pronunciation Analysis**: Custom integration (TBD - may use Whisper API + custom model)
- **Chatbot**: Google Gemma 4 API (Generative AI)

#### DevOps & Infrastructure
- **Hosting**: Vercel (frontend) + Railway/Fly.io (backend)
- **CI/CD**: GitHub Actions
- **Environment Management**: dotenv
- **Testing**: Vitest (unit) + Playwright (E2E)

### Component Architecture

#### Frontend Architecture

```
src/
├── components/
│   ├── audio/
│   │   ├── AudioRecorder.tsx         # MediaRecorder wrapper
│   │   ├── AudioPlayer.tsx           # Playback component
│   │   └── WaveformVisualizer.tsx    # Visual feedback
│   ├── assessment/
│   │   ├── PhaseI.tsx                # 12 sentences recording
│   │   ├── PhaseII.tsx               # Dynamic error confirmation
│   │   ├── PhaseIII.tsx              # Storytelling
│   │   ├── ProcessingScreen.tsx      # AI analysis loading
│   │   └── ResultsDisplay.tsx        # Assessment results
│   ├── chat/
│   │   ├── ChatInterface.tsx         # Main chat UI
│   │   ├── MessageList.tsx           # Message display
│   │   ├── MessageInput.tsx          # User input
│   │   └── TypingIndicator.tsx       # Bot typing state
│   ├── practice/
│   │   ├── DailyExercise.tsx         # Practice session
│   │   ├── ProgressCalendar.tsx      # Completion tracking
│   │   └── StreakDisplay.tsx         # Motivation
│   ├── expert/
│   │   ├── ExpertList.tsx            # Browse experts
│   │   ├── ExpertProfile.tsx         # Expert details
│   │   └── SessionBooking.tsx        # Scheduling
│   ├── layout/
│   │   ├── Layout.tsx                # Main layout wrapper
│   │   ├── Navbar.tsx                # Navigation
│   │   └── Sidebar.tsx               # Side navigation
│   └── common/
│       ├── Button.tsx                # Reusable button
│       ├── Card.tsx                  # Card component
│       ├── LoadingSpinner.tsx        # Loading states
│       └── ErrorBoundary.tsx         # Error handling
├── services/
│   ├── api/
│   │   ├── auth.ts                   # Auth endpoints
│   │   ├── assessment.ts             # Assessment endpoints
│   │   ├── practice.ts               # Practice endpoints
│   │   ├── chat.ts                   # Chat endpoints
│   │   └── expert.ts                 # Expert endpoints
│   ├── audio/
│   │   ├── recorder.ts               # MediaRecorder logic
│   │   ├── processor.ts              # Audio processing
│   │   └── uploader.ts               # Upload management
│   ├── storage/
│   │   ├── indexedDB.ts              # IndexedDB wrapper
│   │   └── migrator.ts               # localStorage migration
│   └── utils/
│       ├── errorHandler.ts           # Error utilities
│       └── validators.ts             # Input validation
├── stores/
│   ├── authStore.ts                  # Authentication state
│   ├── assessmentStore.ts            # Assessment state
│   ├── practiceStore.ts              # Practice progress
│   ├── chatStore.ts                  # Chat history
│   ├── expertStore.ts                # Expert connections
│   └── notificationStore.ts          # Notifications
├── hooks/
│   ├── useAudioRecorder.ts           # Audio recording hook
│   ├── useOfflineSync.ts             # Offline sync logic
│   ├── useAuth.ts                    # Auth helpers
│   └── useMediaQuery.ts              # Responsive helpers
├── types/
│   ├── api.ts                        # API types
│   ├── models.ts                     # Data models
│   └── assessment.ts                 # Assessment types
└── config/
    ├── constants.ts                  # App constants
    └── env.ts                        # Environment config
```

#### Backend Architecture

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts        # Authentication logic
│   │   ├── user.controller.ts        # User management
│   │   ├── assessment.controller.ts  # Assessment endpoints
│   │   ├── practice.controller.ts    # Practice tracking
│   │   ├── chat.controller.ts        # Chat management
│   │   └── expert.controller.ts      # Expert system
│   ├── services/
│   │   ├── auth.service.ts           # JWT & bcrypt logic
│   │   ├── storage.service.ts        # S3/GCS integration
│   │   ├── ai.service.ts             # AI API integration
│   │   ├── email.service.ts          # Email notifications
│   │   └── migration.service.ts      # Data migration
│   ├── middleware/
│   │   ├── auth.middleware.ts        # JWT verification
│   │   ├── validation.middleware.ts  # Request validation
│   │   ├── rateLimit.middleware.ts   # Rate limiting
│   │   ├── error.middleware.ts       # Error handling
│   │   └── logger.middleware.ts      # Request logging
│   ├── models/
│   │   └── schema.prisma             # Prisma schema
│   ├── routes/
│   │   ├── auth.routes.ts            # Auth endpoints
│   │   ├── user.routes.ts            # User endpoints
│   │   ├── assessment.routes.ts      # Assessment endpoints
│   │   ├── practice.routes.ts        # Practice endpoints
│   │   ├── chat.routes.ts            # Chat endpoints
│   │   └── expert.routes.ts          # Expert endpoints
│   ├── utils/
│   │   ├── validator.ts              # Validation schemas
│   │   ├── logger.ts                 # Winston logger
│   │   └── errors.ts                 # Custom error classes
│   ├── config/
│   │   ├── database.ts               # Prisma client
│   │   ├── storage.ts                # S3/GCS config
│   │   └── env.ts                    # Environment validation
│   └── app.ts                        # Express app setup
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Migration files
├── tests/
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # End-to-end tests
└── package.json
```

## Data Models

### Database Schema (MongoDB with Mongoose)

**Connection String:**
```
mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
```

**Mongoose Schemas:**

```typescript
// MongoDB schemas using Mongoose

// User Schema (Mongoose)
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  
  // Account status
  isActive: boolean;
  verifiedEmail: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  
  // Profile
  profileImageUrl?: string;
  targetGoals?: string;
  learningStyle?: string;
  
  // Assessment status (embedded)
  assessmentCompleted: boolean;
  currentPathwayId?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: String,
  dateOfBirth: Date,
  gender: String,
  
  isActive: { type: Boolean, default: true },
  verifiedEmail: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: Date,
  
  profileImageUrl: String,
  targetGoals: String,
  learningStyle: String,
  
  assessmentCompleted: { type: Boolean, default: false },
  currentPathwayId: String
}, { 
  timestamps: true,
  collection: 'users'
});

export const User = mongoose.model<IUser>('User', UserSchema);

// Assessment System
model Assessment {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Completion status
  completedAt     DateTime?
  phase           String    @default("not_started") // not_started, phase_1, phase_2, phase_3, processing, completed
  
  // Results
  overallScore    Int?
  clarityScore    Int?
  fluencyScore    Int?
  speechRate      Int?      // words per minute
  confidenceLevel String?   // low, medium, high
  
  // Detected issues
  pronunciationIssues Json? // Array of { phoneme, severity, description, timestamps }
  
  // Recommended pathway
  recommendedPathwayId String?
  
  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relationships
  recordings      AudioRecording[]
  
  @@map("assessments")
}

model AudioRecording {
  id              String    @id @default(uuid())
  assessmentId    String?
  assessment      Assessment? @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  practiceSessionId String?
  practiceSession PracticeSession? @relation(fields: [practiceSessionId], references: [id], onDelete: Cascade)
  
  // Recording details
  phase           String?   // phase_1, phase_2, phase_3
  sentenceId      String?   // Reference to sentence in assessment
  exerciseId      String?   // Reference to exercise in practice
  
  // File information
  fileUrl         String
  fileSize        Int       // bytes
  duration        Int       // seconds
  format          String    // wav, webm
  sampleRate      Int       // Hz
  
  // Upload metadata
  uploadedAt      DateTime  @default(now())
  
  @@map("audio_recordings")
}

// Practice System
model PracticePathway {
  id              String    @id @default(uuid())
  name            String
  description     String
  durationDays    Int
  targetPhonemes  String[]  // ["L/N", "TR/CH", "S/X"]
  
  // Content
  weeks           Json      // Array of week data with exercises
  
  // Metadata
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  
  // Relationships
  userProgress    PracticeProgress[]
  
  @@map("practice_pathways")
}

model PracticeProgress {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  pathwayId       String
  pathway         PracticePathway @relation(fields: [pathwayId], references: [id])
  
  // Progress tracking
  currentWeek     Int       @default(1)
  currentDay      Int       @default(1)
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
  
  // Streaks
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  lastCheckIn     DateTime?
  
  // Relationships
  sessions        PracticeSession[]
  
  @@map("practice_progress")
}

model PracticeSession {
  id              String    @id @default(uuid())
  progressId      String
  progress        PracticeProgress @relation(fields: [progressId], references: [id], onDelete: Cascade)
  
  // Session details
  week            Int
  day             Int
  completedAt     DateTime  @default(now())
  
  // Performance
  exercisesCompleted Int
  accuracyScore   Int?
  
  // Relationships
  recordings      AudioRecording[]
  
  @@map("practice_sessions")
}

// Chat System
model ChatMessage {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Message details
  senderType      String    // user, bot
  content         String    @db.Text
  timestamp       DateTime  @default(now())
  
  // Bot metadata (if sender is bot)
  promptTokens    Int?
  completionTokens Int?
  
  @@map("chat_messages")
  @@index([userId, timestamp])
}

// Expert System
model Expert {
  id              String    @id @default(uuid())
  fullName        String
  email           String    @unique
  phoneNumber     String
  
  // Professional info
  licenseNumber   String
  specializations String[]  // ["pronunciation", "fluency", "confidence"]
  bio             String    @db.Text
  profileImageUrl String?
  
  // Ratings
  averageRating   Float     @default(0)
  totalRatings    Int       @default(0)
  
  // Availability
  isActive        Boolean   @default(true)
  
  // Relationships
  connections     ExpertConnection[]
  sessions        ExpertSession[]
  
  @@map("experts")
}

model ExpertConnection {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expertId        String
  expert          Expert    @relation(fields: [expertId], references: [id], onDelete: Cascade)
  
  // Connection status
  status          String    @default("pending") // pending, accepted, declined
  requestedAt     DateTime  @default(now())
  respondedAt     DateTime?
  
  // Relationships
  sessions        ExpertSession[]
  
  @@unique([userId, expertId])
  @@map("expert_connections")
}

model ExpertSession {
  id              String    @id @default(uuid())
  connectionId    String
  connection      ExpertConnection @relation(fields: [connectionId], references: [id], onDelete: Cascade)
  expertId        String
  expert          Expert    @relation(fields: [expertId], references: [id])
  
  // Session details
  scheduledAt     DateTime
  duration        Int       // minutes
  sessionType     String    // initial_consultation, follow_up, progress_review
  status          String    @default("scheduled") // scheduled, completed, cancelled
  
  // Meeting details
  meetingUrl      String?
  notes           String?   @db.Text
  
  // Rating (user rating of expert)
  rating          Int?      // 1-5 stars
  feedback        String?   @db.Text
  
  // Metadata
  createdAt       DateTime  @default(now())
  completedAt     DateTime?
  
  @@map("expert_sessions")
}

// Notification System
model Notification {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Notification details
  type            String    // reminder, milestone, alert, expert_session, new_content
  title           String
  message         String    @db.Text
  read            Boolean   @default(false)
  timestamp       DateTime  @default(now())
  
  // Action metadata
  actionUrl       String?
  actionData      Json?
  
  @@map("notifications")
  @@index([userId, read, timestamp])
}

// System Audit Logs
model AuditLog {
  id              String    @id @default(uuid())
  
  // Event details
  eventType       String    // login, logout, assessment_complete, etc.
  userId          String?
  entityType      String?   // User, Assessment, etc.
  entityId        String?
  
  // Request details
  ipAddress       String?
  userAgent       String?
  
  // Data
  changes         Json?
  
  // Timestamp
  createdAt       DateTime  @default(now())
  
  @@map("audit_logs")
  @@index([userId, createdAt])
  @@index([eventType, createdAt])
}
```

### Entity Relationship Diagram

```
User ──┬── Assessment ── AudioRecording
       │
       ├── PracticeProgress ── PracticeSession ── AudioRecording
       │                    │
       │                    └── PracticePathway
       │
       ├── ChatMessage
       │
       ├── ExpertConnection ── ExpertSession
       │                    │
       │                    └── Expert
       │
       └── Notification
```

### Key Data Model Design Decisions

1. **UUID Primary Keys**: Using UUIDs instead of auto-incrementing integers for better distributed system compatibility and security (no ID enumeration)

2. **Soft Deletes via Cascade**: Using Prisma's `onDelete: Cascade` to maintain referential integrity while allowing full deletion when user deletes account

3. **JSON Fields for Flexible Data**: Using JSON for pronunciation issues, pathway weeks, and action data to allow flexible schemas without constant migrations

4. **Indexed Fields**: Adding indexes on frequently queried fields (userId + timestamp for messages, userId + read for notifications)

5. **Normalized Audio Recordings**: Single table for both assessment and practice recordings with nullable foreign keys to avoid duplication

6. **Separate Progress and Session Tables**: Separating ongoing progress from individual sessions for better query performance

## Components and Interfaces

### Frontend Components

#### Audio Recording Component


**Purpose**: Encapsulates all MediaRecorder API logic for consistent audio recording across the application.

**Interface**:
```typescript
interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onError: (error: Error) => void;
  maxDuration?: number; // seconds, default 300
  minDuration?: number; // seconds, default 0
  visualize?: boolean; // show waveform
}

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // seconds
  hasPermission: boolean | null; // null = not asked yet
}
```

**Key Methods**:
- `requestPermission()`: Request microphone access
- `startRecording()`: Begin audio capture
- `pauseRecording()`: Pause capture (if supported)
- `stopRecording()`: End capture and return blob
- `cancelRecording()`: Abort without saving

**MediaRecorder Configuration**:
```typescript
const config = {
  mimeType: 'audio/webm;codecs=opus', // Fallback to 'audio/wav'
  audioBitsPerSecond: 128000,
  sampleRate: 16000
};
```

#### IndexedDB Storage Service

**Purpose**: Manage offline storage of audio recordings with automatic cloud sync.

**Interface**:
```typescript
interface StoredRecording {
  id: string;
  blob: Blob;
  metadata: {
    userId: string;
    sentenceId?: string;
    exerciseId?: string;
    duration: number;
    format: string;
    timestamp: string;
    uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
    retryCount: number;
  };
}

interface IndexedDBService {
  saveRecording(blob: Blob, metadata: RecordingMetadata): Promise<string>;
  getRecording(id: string): Promise<StoredRecording | null>;
  getPendingUploads(): Promise<StoredRecording[]>;
  markAsUploaded(id: string): Promise<void>;
  deleteRecording(id: string): Promise<void>;
  getStorageUsage(): Promise<{ used: number; quota: number }>;
  cleanupOldRecordings(olderThan: Date): Promise<void>;
}
```

**Database Schema**:
```typescript
// IndexedDB structure
const DB_NAME = 'goodviet-audio';
const DB_VERSION = 1;

const stores = {
  recordings: {
    keyPath: 'id',
    indexes: [
      { name: 'timestamp', keyPath: 'metadata.timestamp' },
      { name: 'uploadStatus', keyPath: 'metadata.uploadStatus' }
    ]
  }
};
```

#### Offline Sync Manager

**Purpose**: Automatically upload pending recordings when connection is restored.

**Interface**:
```typescript
interface OfflineSyncManager {
  start(): void; // Start monitoring
  stop(): void;
  syncNow(): Promise<SyncResult>;
  onStatusChange: (callback: (status: SyncStatus) => void) => void;
}

interface SyncResult {
  uploaded: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}
```

**Sync Strategy**:
1. Listen for `online` event
2. Check for pending uploads on app start
3. Upload in FIFO order with exponential backoff on failure
4. Retry up to 3 times with delays: 5s, 15s, 45s
5. Mark as failed after 3 retries and notify user


### Backend API Endpoints

#### Authentication Endpoints

**POST /api/users/register**
- **Purpose**: Create new user account
- **Request**:
```typescript
{
  email: string;
  password: string; // min 8 chars, 1 letter, 1 number
  fullName: string;
  phoneNumber?: string;
}
```
- **Response (201)**:
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
  };
  token: string; // JWT
}
```
- **Errors**: 400 (validation), 409 (email exists)

**POST /api/users/login**
- **Purpose**: Authenticate user
- **Request**:
```typescript
{
  email: string;
  password: string;
}
```
- **Response (200)**:
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string;
    lastLoginAt: string;
  };
  token: string; // JWT, expires in 7 days
}
```
- **Errors**: 401 (invalid credentials), 429 (rate limited)
- **Rate Limit**: 5 attempts per 15 minutes per email

**POST /api/users/logout**
- **Purpose**: Logout user (client-side token removal)
- **Auth**: Required
- **Response (200)**:
```typescript
{ success: true }
```

#### User Profile Endpoints

**GET /api/users/profile**
- **Purpose**: Get current user profile
- **Auth**: Required
- **Response (200)**:
```typescript
{
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  assessmentCompleted: boolean;
  currentPathwayId?: string;
  currentStreak: number;
  createdAt: string;
}
```

**PATCH /api/users/profile**
- **Purpose**: Update user profile
- **Auth**: Required
- **Request**:
```typescript
{
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
}
```
- **Response (200)**:
```typescript
{
  user: { /* updated user object */ }
}
```


#### Assessment Endpoints

**POST /api/assessments/start**
- **Purpose**: Initialize new assessment
- **Auth**: Required
- **Response (201)**:
```typescript
{
  assessmentId: string;
  phase: "phase_1";
  sentences: Array<{ id: string; text: string }>;
}
```
- **Errors**: 409 (assessment already completed)

**POST /api/assessments/:id/recordings**
- **Purpose**: Upload audio recording for assessment
- **Auth**: Required
- **Content-Type**: multipart/form-data
- **Request**:
```typescript
FormData {
  audio: File; // WAV or WebM, max 50MB
  phase: "phase_1" | "phase_2" | "phase_3";
  sentenceId?: string; // Required for phase_1 and phase_2
  metadata: JSON<{
    duration: number;
    format: string;
    sampleRate: number;
  }>;
}
```
- **Response (201)**:
```typescript
{
  recordingId: string;
  uploadedAt: string;
}
```

**POST /api/assessments/:id/complete-phase**
- **Purpose**: Mark phase as complete and trigger analysis
- **Auth**: Required
- **Request**:
```typescript
{
  phase: "phase_1" | "phase_2" | "phase_3";
}
```
- **Response (200)** for phase_1 & phase_2:
```typescript
{
  nextPhase: "phase_2" | "phase_3";
  sentences?: Array<{ id: string; text: string; isRetry: boolean }>;
  detectedErrors?: string[];
}
```
- **Response (202)** for phase_3:
```typescript
{
  message: "Analysis started";
  estimatedTime: number; // seconds
}
```

**GET /api/assessments/:id/status**
- **Purpose**: Check assessment processing status
- **Auth**: Required
- **Response (200)**:
```typescript
{
  assessmentId: string;
  status: "processing" | "completed" | "failed";
  progress?: number; // 0-100
  statusMessage?: string;
}
```

**GET /api/assessments/result**
- **Purpose**: Get user's assessment result
- **Auth**: Required
- **Response (200)**:
```typescript
{
  assessmentId: string;
  completedAt: string;
  overallScore: number;
  clarityScore: number;
  fluencyScore: number;
  speechRate: number;
  confidenceLevel: "low" | "medium" | "high";
  pronunciationIssues: Array<{
    phoneme: "L/N" | "TR/CH" | "S/X";
    severity: "mild" | "moderate" | "severe";
    description: string;
    timestamps: number[]; // seconds into recording
  }>;
  recommendedPathway: {
    id: string;
    name: string;
    description: string;
    durationDays: number;
    targetPhonemes: string[];
  };
}
```
- **Errors**: 404 (no assessment found)


#### Practice Endpoints

**GET /api/practice/pathways**
- **Purpose**: List available practice pathways
- **Auth**: Required
- **Response (200)**:
```typescript
{
  pathways: Array<{
    id: string;
    name: string;
    description: string;
    durationDays: number;
    targetPhonemes: string[];
  }>;
}
```

**POST /api/practice/start**
- **Purpose**: Start a practice pathway
- **Auth**: Required
- **Request**:
```typescript
{
  pathwayId: string;
}
```
- **Response (201)**:
```typescript
{
  progressId: string;
  pathwayId: string;
  currentWeek: 1;
  currentDay: 1;
  startedAt: string;
}
```

**GET /api/practice/progress**
- **Purpose**: Get user's practice progress
- **Auth**: Required
- **Response (200)**:
```typescript
{
  progressId: string;
  pathway: {
    id: string;
    name: string;
    durationDays: number;
  };
  currentWeek: number;
  currentDay: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  completedSessions: number;
  completionPercentage: number;
}
```

**GET /api/practice/day/:week/:day**
- **Purpose**: Get exercises for specific day
- **Auth**: Required
- **Response (200)**:
```typescript
{
  week: number;
  day: number;
  exercises: Array<{
    id: string;
    type: "reading" | "listening" | "speaking";
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
}
```

**POST /api/practice/checkin**
- **Purpose**: Record daily check-in
- **Auth**: Required
- **Request**:
```typescript
{
  week: number;
  day: number;
  exercisesCompleted: number;
}
```
- **Response (200)**:
```typescript
{
  sessionId: string;
  completedAt: string;
  newStreak: number;
  milestoneAchieved?: {
    type: "streak_7" | "streak_30" | "week_complete";
    message: string;
  };
}
```

**POST /api/practice/recording**
- **Purpose**: Upload practice recording
- **Auth**: Required
- **Content-Type**: multipart/form-data
- **Request**:
```typescript
FormData {
  audio: File;
  sessionId: string;
  exerciseId: string;
}
```
- **Response (201)**:
```typescript
{
  recordingId: string;
  uploadedAt: string;
}
```


#### Chat Endpoints

**GET /api/chat/history**
- **Purpose**: Get chat message history
- **Auth**: Required
- **Query Parameters**:
  - `limit` (optional, default 50, max 100)
  - `before` (optional, ISO timestamp for pagination)
- **Response (200)**:
```typescript
{
  messages: Array<{
    id: string;
    senderType: "user" | "bot";
    content: string;
    timestamp: string;
  }>;
  hasMore: boolean;
}
```

**POST /api/chat/messages**
- **Purpose**: Send message to chatbot
- **Auth**: Required
- **Request**:
```typescript
{
  content: string;
}
```
- **Response (200)**:
```typescript
{
  userMessage: {
    id: string;
    senderType: "user";
    content: string;
    timestamp: string;
  };
  botMessage: {
    id: string;
    senderType: "bot";
    content: string;
    timestamp: string;
  };
}
```
- **Rate Limit**: 20 messages per minute

**POST /api/chat/context**
- **Purpose**: Provide user context to chatbot for personalized responses
- **Auth**: Required
- **Request**:
```typescript
{
  contextType: "practice_progress" | "assessment_result" | "streak_milestone";
}
```
- **Response (200)**:
```typescript
{
  message: string; // Personalized message from bot
}
```

#### Expert Endpoints

**GET /api/experts**
- **Purpose**: List available experts
- **Auth**: Required
- **Query Parameters**:
  - `specialization` (optional)
  - `minRating` (optional, 1-5)
- **Response (200)**:
```typescript
{
  experts: Array<{
    id: string;
    fullName: string;
    profileImageUrl: string;
    specializations: string[];
    bio: string;
    averageRating: number;
    totalRatings: number;
  }>;
}
```

**POST /api/expert-connections**
- **Purpose**: Request connection with expert
- **Auth**: Required
- **Request**:
```typescript
{
  expertId: string;
  message?: string; // Optional message to expert
}
```
- **Response (201)**:
```typescript
{
  connectionId: string;
  status: "pending";
  requestedAt: string;
}
```

**GET /api/expert-connections**
- **Purpose**: Get user's expert connections
- **Auth**: Required
- **Response (200)**:
```typescript
{
  connections: Array<{
    id: string;
    expert: {
      id: string;
      fullName: string;
      profileImageUrl: string;
    };
    status: "pending" | "accepted" | "declined";
    requestedAt: string;
    respondedAt?: string;
  }>;
}
```

**POST /api/expert-sessions**
- **Purpose**: Schedule session with expert
- **Auth**: Required
- **Request**:
```typescript
{
  connectionId: string;
  scheduledAt: string; // ISO timestamp
  duration: number; // minutes
  sessionType: "initial_consultation" | "follow_up" | "progress_review";
}
```
- **Response (201)**:
```typescript
{
  sessionId: string;
  meetingUrl: string;
  scheduledAt: string;
}
```

**POST /api/expert-sessions/:id/rate**
- **Purpose**: Rate completed session
- **Auth**: Required
- **Request**:
```typescript
{
  rating: number; // 1-5
  feedback?: string;
}
```
- **Response (200)**:
```typescript
{
  success: true;
}
```


### AI Service Integration

#### Vietnamese Pronunciation Analysis Service

**Purpose**: Analyze audio recordings to detect Vietnamese phoneme errors (L/N, TR/CH, S/X) and calculate pronunciation metrics.

**Integration Approach**:

**Option 1: OpenAI Whisper + Custom Model** (Recommended)
1. Use Whisper API for speech-to-text transcription
2. Build custom phoneme detection model trained on Vietnamese speech data
3. Compare transcribed text against expected text to identify errors

**Option 2: Google Cloud Speech-to-Text**
1. Use Google Cloud Speech-to-Text API with Vietnamese language model
2. Analyze phoneme-level transcription
3. Post-process results to detect specific error patterns

**Option 3: Custom Vietnamese ASR**
1. Train/fine-tune a Vietnamese-specific model (e.g., Wav2Vec2)
2. Deploy as separate microservice
3. Higher accuracy but more infrastructure overhead

**API Interface** (Backend Service):
```typescript
interface PronunciationAnalysisService {
  analyzeRecording(
    audioUrl: string,
    expectedText?: string,
    phase: 'phase_1' | 'phase_2' | 'phase_3'
  ): Promise<AnalysisResult>;
}

interface AnalysisResult {
  overallScore: number; // 0-100
  clarityScore: number; // 0-100
  fluencyScore: number; // 0-100
  speechRate: number; // words per minute
  confidenceLevel: 'low' | 'medium' | 'high';
  pronunciationIssues: Array<{
    phoneme: 'L/N' | 'TR/CH' | 'S/X';
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    timestamps: number[]; // seconds
    detectedWord?: string;
    expectedWord?: string;
  }>;
  transcription?: string;
}
```

**Processing Flow**:
```
1. Audio Upload (Frontend) → S3/GCS
2. Backend triggers AI analysis job
3. AI Service:
   a. Downloads audio from cloud storage
   b. Converts to required format (if needed)
   c. Transcribes using Whisper/Google STT
   d. Analyzes phoneme-level accuracy
   e. Calculates metrics (clarity, fluency, confidence)
   f. Identifies error patterns
4. Backend stores results in database
5. Frontend polls status endpoint or receives webhook
```

**Performance Requirements**:
- Processing time: <180 seconds for 5-minute recording
- Accuracy: ≥85% for phoneme detection
- Cost: Optimize by batching requests


#### Gemma 4 Chatbot Integration

**Purpose**: Provide conversational AI companion for user motivation, guidance, and speech therapy Q&A.

**Integration Method**:
- Use Google AI Gemini API (Gemma 4 model)
- Server-side integration to protect API keys
- Implement conversation context management

**System Prompt**:
```
You are GoodBot, a friendly Vietnamese speech therapy companion for the GOODVIET platform. Your role is to:

1. Motivate users to complete their daily practice
2. Answer questions about Vietnamese pronunciation techniques
3. Provide encouragement and celebrate milestones
4. Guide users through the platform features

Guidelines:
- Always respond in Vietnamese
- Be warm, supportive, and encouraging
- Keep responses concise (2-3 sentences max)
- Avoid medical diagnoses
- Stay focused on speech therapy topics
- Reference user's practice progress when relevant
- Use emojis occasionally for friendliness

User Context:
- Name: {userName}
- Current Streak: {currentStreak} days
- Pathway: {pathwayName}
- Recent Progress: {recentSessions}
```

**Context Management**:
```typescript
interface ChatContext {
  userId: string;
  userName: string;
  currentStreak: number;
  pathwayName?: string;
  lastPracticeDate?: string;
  recentMilestones: string[];
  assessmentResult?: {
    mainIssue: string;
    overallScore: number;
  };
}

class GemmaService {
  async generateResponse(
    userMessage: string,
    context: ChatContext,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const prompt = this.buildPrompt(userMessage, context, conversationHistory);
    const response = await this.gemini.generateContent(prompt);
    return response.text();
  }
  
  private buildPrompt(
    message: string,
    context: ChatContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }>
  ): string {
    const systemPrompt = this.getSystemPrompt(context);
    const contextWindow = history.slice(-10); // Last 10 messages
    return `${systemPrompt}\n\nConversation:\n${this.formatHistory(contextWindow)}\n\nUser: ${message}\nAssistant:`;
  }
}
```

**Rate Limiting & Caching**:
- Limit: 20 messages per user per minute
- Cache common Q&A responses for 1 hour
- Implement exponential backoff for API errors

**Daily Check-in Messages**:
```typescript
// Automated messages triggered by cron job
const dailyCheckInTemplates = [
  "Chào {userName}! Hôm nay bạn đã sẵn sàng luyện tập chưa? 💪",
  "Đã {streak} ngày rồi đấy! Hôm nay cùng tiếp tục nhé! 🔥",
  "{userName} ơi, bài tập {dayName} đang chờ bạn đấy! 📚"
];

const reminderMessages = [
  "Hôm qua bạn bỏ lỡ buổi luyện tập rồi. Hôm nay làm bù nhé! 😊",
  "24 giờ rồi bạn chưa vào app. Mình lo cho streak của bạn quá! 🥺"
];
```


## State Management Architecture

### Zustand Store Design

**Design Principles**:
1. **Separation of Concerns**: Each store handles a specific domain
2. **Middleware**: Persist to localStorage for offline access
3. **Computed Values**: Derive data rather than store duplicates
4. **Optimistic Updates**: Update UI immediately, sync with server
5. **Error Recovery**: Rollback on API failures

### Store Specifications

#### Auth Store

```typescript
interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Internal
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

// Implementation
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
          // Store token in httpOnly cookie or secure storage
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        api.auth.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      // ... other actions
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```


#### Assessment Store

```typescript
interface AssessmentStore {
  // State
  currentAssessment: Assessment | null;
  phase: AssessmentPhase;
  recordings: Map<string, RecordingInfo>; // sentenceId -> recording
  phaseIErrors: string[];
  result: AssessmentResult | null;
  isProcessing: boolean;
  processingProgress: number;
  
  // Actions
  startAssessment: () => Promise<void>;
  uploadRecording: (sentenceId: string, blob: Blob, duration: number) => Promise<void>;
  completePhase: (phase: AssessmentPhase) => Promise<void>;
  getResult: () => Promise<AssessmentResult>;
  resetAssessment: () => void;
  
  // Computed
  get canProceed(): boolean;
  get recordedCount(): number;
  get totalRequired(): number;
}
```

#### Practice Store

```typescript
interface PracticeStore {
  // State
  progress: PracticeProgress | null;
  currentDay: DayContent | null;
  recordings: Map<string, RecordingInfo>; // exerciseId -> recording
  isLoadingDay: boolean;
  
  // Actions
  loadProgress: () => Promise<void>;
  loadDay: (week: number, day: number) => Promise<void>;
  recordExercise: (exerciseId: string, blob: Blob) => Promise<void>;
  completeDay: (week: number, day: number) => Promise<void>;
  
  // Computed
  get completionPercentage(): number;
  get canAccessDay(week: number, day: number): boolean;
}
```

#### Chat Store

```typescript
interface ChatStore {
  // State
  messages: ChatMessage[];
  isTyping: boolean;
  hasMore: boolean;
  
  // Actions
  loadHistory: (before?: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  requestContextMessage: (contextType: string) => Promise<void>;
  
  // Computed
  get unreadCount(): number;
}
```

#### Offline Sync Store

```typescript
interface OfflineSyncStore {
  // State
  pendingUploads: Array<{
    id: string;
    type: 'assessment' | 'practice';
    blob: Blob;
    metadata: any;
    retryCount: number;
  }>;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  
  // Actions
  addPendingUpload: (upload: PendingUpload) => void;
  syncAll: () => Promise<SyncResult>;
  removePending: (id: string) => void;
  
  // Internal
  setOnlineStatus: (isOnline: boolean) => void;
}
```

### Store Composition Pattern

```typescript
// Compose stores for complex operations
function useAssessmentWorkflow() {
  const { uploadRecording: uploadToServer } = useAssessmentStore();
  const { addPendingUpload, isOnline } = useOfflineSyncStore();
  
  const uploadRecording = async (sentenceId: string, blob: Blob, duration: number) => {
    // Save to IndexedDB first
    const recordingId = await indexedDB.saveRecording(blob, {
      sentenceId,
      duration,
      uploadStatus: 'pending'
    });
    
    // Try immediate upload if online
    if (isOnline) {
      try {
        await uploadToServer(sentenceId, blob, duration);
        await indexedDB.markAsUploaded(recordingId);
      } catch (error) {
        // Keep in IndexedDB for later sync
        addPendingUpload({
          id: recordingId,
          type: 'assessment',
          blob,
          metadata: { sentenceId, duration }
        });
      }
    } else {
      // Queue for later
      addPendingUpload({
        id: recordingId,
        type: 'assessment',
        blob,
        metadata: { sentenceId, duration }
      });
    }
  };
  
  return { uploadRecording };
}
```


## Error Handling

### Error Handling Strategy

**Principles**:
1. **User-Friendly Messages**: Never show technical errors to users
2. **Vietnamese Language**: All user-facing errors in Vietnamese
3. **Actionable Guidance**: Tell users what to do next
4. **Retry Mechanisms**: Allow users to retry failed operations
5. **Silent Recovery**: Auto-retry transient errors without bothering user

### Error Categories

#### Network Errors
```typescript
class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

// User-facing messages
const networkErrorMessages: Record<string, string> = {
  'OFFLINE': 'Mất kết nối internet. Vui lòng kiểm tra và thử lại.',
  'TIMEOUT': 'Kết nối quá chậm. Vui lòng thử lại.',
  'SERVER_ERROR': 'Lỗi hệ thống. Chúng tôi đang khắc phục.',
};

// Handler
function handleNetworkError(error: NetworkError): void {
  const message = networkErrorMessages[error.message] || networkErrorMessages['SERVER_ERROR'];
  
  notificationStore.show({
    type: 'error',
    message,
    action: {
      label: 'Thử lại',
      onClick: () => retryLastRequest()
    }
  });
  
  // Log for debugging
  logger.error('Network error', {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack
  });
}
```

#### Authentication Errors
```typescript
const authErrorMessages: Record<number, string> = {
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền truy cập tính năng này.',
  409: 'Email này đã được đăng ký.',
  429: 'Quá nhiều lần thử. Vui lòng đợi {minutes} phút.',
};

function handleAuthError(statusCode: number, details?: any): void {
  if (statusCode === 401) {
    // Auto-logout and redirect to login
    authStore.logout();
    router.push('/login');
  }
  
  const message = authErrorMessages[statusCode] || 'Lỗi xác thực. Vui lòng thử lại.';
  notificationStore.show({ type: 'error', message });
}
```

#### Validation Errors
```typescript
interface ValidationError {
  field: string;
  message: string;
}

function handleValidationErrors(errors: ValidationError[]): void {
  // Show inline errors on form fields
  errors.forEach(error => {
    formStore.setFieldError(error.field, error.message);
  });
  
  // Show summary notification
  notificationStore.show({
    type: 'warning',
    message: 'Vui lòng kiểm tra lại thông tin đã nhập.'
  });
}
```

#### Audio Recording Errors
```typescript
const audioErrorMessages: Record<string, string> = {
  'PERMISSION_DENIED': 'Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt.',
  'NOT_SUPPORTED': 'Trình duyệt không hỗ trợ ghi âm. Vui lòng dùng Chrome hoặc Edge.',
  'DEVICE_ERROR': 'Không thể truy cập microphone. Vui lòng kiểm tra thiết bị.',
  'STORAGE_FULL': 'Bộ nhớ thiết bị đã đầy. Vui lòng giải phóng dung lượng.',
};

function handleAudioError(error: DOMException): void {
  let key = 'DEVICE_ERROR';
  
  if (error.name === 'NotAllowedError') key = 'PERMISSION_DENIED';
  else if (error.name === 'NotSupportedError') key = 'NOT_SUPPORTED';
  else if (error.name === 'QuotaExceededError') key = 'STORAGE_FULL';
  
  notificationStore.show({
    type: 'error',
    message: audioErrorMessages[key],
    duration: 8000 // Longer duration for important errors
  });
}
```

### Global Error Boundary

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    logger.error('React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h2>Đã có lỗi xảy ra</h2>
          <p>Chúng tôi đã ghi nhận sự cố và sẽ khắc phục sớm nhất.</p>
          <button onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof NetworkError && error.statusCode && error.statusCode < 500) {
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Usage
const uploadRecording = async (blob: Blob) => {
  return retryWithBackoff(
    () => api.uploadAudio(blob),
    3, // Max 3 retries
    5000 // Start with 5s delay
  );
};
```


## Testing Strategy

### Testing Pyramid

```
                    ▲
                   / \
                  /   \
                 /  E2E \ (10-15%)
                /-------\
               /         \
              / Integration\ (25-35%)
             /-------------\
            /               \
           /   Unit Tests    \ (50-65%)
          /___________________\
```

### Unit Tests

**Tools**: Vitest, Testing Library

**Coverage Targets**:
- Authentication functions: 80%+
- Data validation: 90%+
- State management stores: 80%+
- API client functions: 80%+
- Utility functions: 90%+

**Example Test Cases**:

```typescript
// auth.service.test.ts
describe('AuthService', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'TestPass123';
    const hash = await authService.hashPassword(password);
    
    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });
  
  it('should generate valid JWT token', async () => {
    const user = { id: '123', email: 'test@example.com' };
    const token = authService.generateToken(user);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(user.id);
    expect(decoded.email).toBe(user.email);
  });
  
  it('should reject expired tokens', async () => {
    const expiredToken = jwt.sign(
      { userId: '123' },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Already expired
    );
    
    expect(() => authService.verifyToken(expiredToken))
      .toThrow('Token expired');
  });
});

// validator.test.ts
describe('Validator', () => {
  it('should validate email format', () => {
    expect(validator.isValidEmail('test@example.com')).toBe(true);
    expect(validator.isValidEmail('invalid-email')).toBe(false);
  });
  
  it('should validate password requirements', () => {
    expect(validator.isValidPassword('Test123')).toBe(true);
    expect(validator.isValidPassword('test123')).toBe(false); // No uppercase
    expect(validator.isValidPassword('TestPass')).toBe(false); // No number
    expect(validator.isValidPassword('Test12')).toBe(false); // Too short
  });
});

// audioRecorder.test.ts
describe('AudioRecorder', () => {
  it('should request microphone permission', async () => {
    const mockGetUserMedia = vi.fn().mockResolvedValue({});
    global.navigator.mediaDevices = { getUserMedia: mockGetUserMedia };
    
    const recorder = new AudioRecorder();
    await recorder.requestPermission();
    
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });
  
  it('should stop recording after max duration', async () => {
    const recorder = new AudioRecorder({ maxDuration: 5 });
    const onComplete = vi.fn();
    
    await recorder.start();
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    expect(recorder.isRecording).toBe(false);
    expect(onComplete).toHaveBeenCalled();
  });
});
```

### Integration Tests

**Tools**: Supertest (API), Testing Library (Frontend)

**Test Scenarios**:
- API endpoint workflows
- Database operations
- Authentication flows
- File upload/download

**Example Integration Tests**:

```typescript
// assessment.integration.test.ts
describe('Assessment API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Create test user and get token
    const response = await request(app)
      .post('/api/users/register')
      .send({
        email: 'test@example.com',
        password: 'Test123',
        fullName: 'Test User'
      });
    authToken = response.body.token;
  });
  
  it('should create new assessment', async () => {
    const response = await request(app)
      .post('/api/assessments/start')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);
    
    expect(response.body).toHaveProperty('assessmentId');
    expect(response.body.phase).toBe('phase_1');
    expect(response.body.sentences).toHaveLength(12);
  });
  
  it('should prevent duplicate assessment', async () => {
    // Complete first assessment
    await completeAssessment(authToken);
    
    // Try to start another
    await request(app)
      .post('/api/assessments/start')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(409);
  });
  
  it('should upload audio recording', async () => {
    const assessment = await createAssessment(authToken);
    
    const response = await request(app)
      .post(`/api/assessments/${assessment.id}/recordings`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('audio', Buffer.from('fake audio data'), 'test.wav')
      .field('phase', 'phase_1')
      .field('sentenceId', 'sent-001')
      .expect(201);
    
    expect(response.body).toHaveProperty('recordingId');
  });
});
```

### End-to-End Tests

**Tools**: Playwright

**Critical Flows**:
1. User registration → Login → Assessment → Results
2. Assessment → Pathway enrollment → Daily practice → Check-in
3. Chat interaction → Context-aware responses
4. Expert browsing → Connection request → Session booking

**Example E2E Test**:

```typescript
// assessment.e2e.test.ts
test('complete assessment flow', async ({ page }) => {
  // Register and login
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Test123');
  await page.fill('[name="fullName"]', 'Test User');
  await page.click('button[type="submit"]');
  
  // Start assessment
  await page.waitForURL('/dashboard');
  await page.click('a[href="/assessment"]');
  await page.click('button:has-text("Bắt đầu bài test")');
  
  // Record Phase I (mock recording)
  for (let i = 0; i < 12; i++) {
    await page.click('[data-testid="record-button"]');
    await page.waitForTimeout(2000); // Simulate recording
    await page.click('[data-testid="stop-button"]');
    
    if (i < 11) {
      await page.click('button:has-text("Câu tiếp")');
    }
  }
  
  await page.click('button:has-text("Hoàn thành giai đoạn")');
  
  // Verify results page
  await page.waitForSelector('[data-testid="assessment-results"]');
  const score = await page.textContent('[data-testid="overall-score"]');
  expect(parseInt(score!)).toBeGreaterThan(0);
});

test('offline recording with sync', async ({ page, context }) => {
  await page.goto('/assessment');
  
  // Go offline
  await context.setOffline(true);
  
  // Record audio
  await page.click('[data-testid="record-button"]');
  await page.waitForTimeout(2000);
  await page.click('[data-testid="stop-button"]');
  
  // Verify offline indicator
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
  
  // Go back online
  await context.setOffline(false);
  
  // Verify sync happens
  await page.waitForSelector('[data-testid="sync-complete"]', { timeout: 10000 });
});
```

### Property-Based Testing (Not Applicable)

**Assessment**: Property-based testing is **NOT** appropriate for this feature because:

1. **External Service Dependencies**: The system heavily relies on external APIs (Gemma 4, pronunciation analysis), file storage (S3/GCS), and databases - these are integration points, not pure functions

2. **UI-Heavy Application**: Large portions of functionality are UI rendering and user interactions (recording interface, assessment flow, chat UI) which are better tested with example-based tests

3. **Non-Deterministic AI**: AI pronunciation analysis and chatbot responses are inherently non-deterministic

4. **CRUD Operations**: Most backend endpoints are straightforward CRUD operations without complex transformation logic

**Alternative Testing Strategies**:
- **Example-based unit tests** for validation functions, authentication logic
- **Integration tests** for API endpoints with database
- **E2E tests** for complete user workflows
- **Mock-based tests** for AI service integration
- **Snapshot tests** for UI components


## Security Architecture

### Authentication Flow

```
┌─────────┐                 ┌─────────┐                 ┌──────────┐
│ Client  │                 │ Backend │                 │ Database │
└────┬────┘                 └────┬────┘                 └────┬─────┘
     │                           │                           │
     │ POST /api/users/register  │                           │
     │ { email, password, ... }  │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │ Hash password (bcrypt)    │
     │                           │ 12 salt rounds            │
     │                           │                           │
     │                           │ INSERT user               │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │ <─────────────────────────┤
     │                           │ user created              │
     │                           │                           │
     │                           │ Generate JWT              │
     │                           │ Sign with secret key      │
     │                           │ Expire in 7 days          │
     │                           │                           │
     │ { user, token }           │                           │
     │ <─────────────────────────┤                           │
     │                           │                           │
     │ Store token in            │                           │
     │ httpOnly cookie or        │                           │
     │ secure storage            │                           │
     │                           │                           │
     │ Subsequent requests       │                           │
     │ Authorization: Bearer ... │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │ Verify JWT                │
     │                           │ Check expiration          │
     │                           │ Validate signature        │
     │                           │                           │
     │                           │ If valid, proceed         │
     │                           │ If expired, 401           │
     │                           │ If invalid, 401           │
```

### JWT Implementation

**Token Structure**:
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  iat: number; // Issued at
  exp: number; // Expires at
}

// Token generation
function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '7d',
      issuer: 'goodviet-api',
      audience: 'goodviet-client'
    }
  );
}

// Token verification middleware
async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.substring(7);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
      {
        issuer: 'goodviet-api',
        audience: 'goodviet-client'
      }
    ) as JWTPayload;
    
    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      next(error);
    }
  }
}
```

### Password Security

**Bcrypt Configuration**:
```typescript
const SALT_ROUNDS = 12; // Adjust based on server performance

async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Password requirements
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Quá nhiều yêu cầu từ địa chỉ IP này',
  standardHeaders: true,
  legacyHeaders: false
});

// Login rate limit (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => req.body.email, // Limit by email, not IP
  handler: (req, res) => {
    res.status(429).json({
      error: 'Quá nhiều lần đăng nhập thất bại. Vui lòng đợi 15 phút.'
    });
  }
});

// Chat rate limit
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  keyGenerator: (req) => req.userId, // Limit per user
  message: 'Bạn gửi tin nhắn quá nhanh. Vui lòng chậm lại.'
});

// Apply to routes
app.use('/api', globalLimiter);
app.post('/api/users/login', loginLimiter, authController.login);
app.post('/api/chat/messages', authMiddleware, chatLimiter, chatController.sendMessage);
```

### Input Validation & Sanitization

```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Za-z]/, 'Mật khẩu phải có ít nhất 1 chữ cái')
    .regex(/\d/, 'Mật khẩu phải có ít nhất 1 số'),
  fullName: z.string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được quá 100 ký tự'),
  phoneNumber: z.string()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
    .optional()
});

// Validation middleware
function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      } else {
        next(error);
      }
    }
  };
}

// XSS prevention for text content
function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // Strip all HTML
    ALLOWED_ATTR: []
  });
}

// SQL injection prevention (via Prisma ORM)
// Prisma automatically parameterizes queries
async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email } // Automatically safe from SQL injection
  });
}
```


### File Upload Security

```typescript
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import FileType from 'file-type';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// File upload configuration
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME!,
    acl: 'private', // Not publicly accessible
    metadata: (req, file, cb) => {
      cb(null, {
        userId: req.userId,
        uploadedAt: new Date().toISOString()
      });
    },
    key: (req, file, cb) => {
      const filename = `${req.userId}/${Date.now()}-${crypto.randomUUID()}.${file.originalname.split('.').pop()}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
    files: 1 // One file at a time
  },
  fileFilter: async (req, file, cb) => {
    try {
      // Check MIME type
      const allowedMimeTypes = ['audio/wav', 'audio/webm', 'audio/x-wav'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only WAV and WebM allowed.'));
      }
      
      // Verify actual file type (not just extension)
      const buffer = await file.stream.read();
      const fileType = await FileType.fromBuffer(buffer);
      
      if (!fileType || !['audio/wav', 'audio/webm'].includes(fileType.mime)) {
        return cb(new Error('File content does not match declared type.'));
      }
      
      cb(null, true);
    } catch (error) {
      cb(error as Error);
    }
  }
});

// Generate signed URL for secure download
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

async function getSecureAudioUrl(fileKey: string, userId: string): Promise<string> {
  // Verify user owns this file
  const recording = await prisma.audioRecording.findFirst({
    where: {
      fileUrl: fileKey,
      assessment: { userId }
    }
  });
  
  if (!recording) {
    throw new ForbiddenError('Access denied');
  }
  
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey
  });
  
  // URL expires in 1 hour
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://goodviet.com',
      'https://www.goodviet.com',
      'https://app.goodviet.com'
    ];
    
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
```

### Content Security Policy

```typescript
import helmet from 'helmet';

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for Vite dev mode
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      mediaSrc: ["'self'", 'blob:', process.env.S3_BUCKET_URL!],
      connectSrc: [
        "'self'",
        process.env.API_URL!,
        'https://generativelanguage.googleapis.com' // Gemma API
      ],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  })
);

app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
```

### Environment Variables Security

```typescript
// .env.example (committed to repo)
```
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/goodviet

# JWT
JWT_SECRET=your-secret-key-here

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=goodviet-audio

# Google AI
GEMINI_API_KEY=your-gemini-api-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
```

```typescript
// config/env.ts - Validate on startup
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  GEMINI_API_KEY: z.string()
});

export const env = envSchema.parse(process.env);
```

### Audit Logging

```typescript
async function logAuditEvent(event: {
  eventType: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.auditLog.create({
    data: event
  });
}

// Middleware to log sensitive operations
function auditMiddleware(eventType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      // Log after successful response
      if (res.statusCode < 400) {
        logAuditEvent({
          eventType,
          userId: req.userId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          changes: { request: req.body, response: body }
        }).catch(console.error);
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

// Usage
app.post('/api/users/login', auditMiddleware('user_login'), authController.login);
app.delete('/api/users/profile', auditMiddleware('user_delete'), authController.deleteAccount);
```


## Implementation Roadmap

### Phase 1: Backend Foundation (Weeks 1-3)

**Week 1: Database & Authentication**
- [ ] Set up PostgreSQL database (Railway/Supabase)
- [ ] Create Prisma schema
- [ ] Run initial migrations
- [ ] Implement user registration endpoint
- [ ] Implement login endpoint with JWT
- [ ] Implement bcrypt password hashing
- [ ] Add rate limiting middleware
- [ ] Write unit tests for auth service

**Week 2: Core API Endpoints**
- [ ] Implement user profile endpoints
- [ ] Implement assessment start endpoint
- [ ] Set up AWS S3 or Google Cloud Storage
- [ ] Implement file upload for audio recordings
- [ ] Add validation middleware (Zod)
- [ ] Implement error handling middleware
- [ ] Write integration tests for API endpoints

**Week 3: Database Schema Completion**
- [ ] Create practice pathway schema
- [ ] Create chat message schema
- [ ] Create expert system schema
- [ ] Seed database with initial data (pathways, experts)
- [ ] Implement remaining CRUD endpoints
- [ ] Add database indexes for performance

### Phase 2: Audio Recording & Storage (Weeks 4-5)

**Week 4: Frontend Audio Recording**
- [ ] Create AudioRecorder component
- [ ] Implement MediaRecorder API integration
- [ ] Add waveform visualization
- [ ] Implement playback functionality
- [ ] Add permission handling
- [ ] Handle browser compatibility (WebM/WAV fallback)
- [ ] Write unit tests for audio recorder

**Week 5: Offline Storage & Sync**
- [ ] Set up IndexedDB with idb library
- [ ] Implement recording storage service
- [ ] Create offline sync manager
- [ ] Add online/offline detection
- [ ] Implement retry logic with exponential backoff
- [ ] Add sync status indicators in UI
- [ ] Test offline-first workflow

### Phase 3: Assessment System (Weeks 6-8)

**Week 6: Assessment UI**
- [ ] Create Phase I recording interface
- [ ] Create Phase II dynamic interface
- [ ] Create Phase III storytelling interface
- [ ] Add progress tracking
- [ ] Implement navigation between phases
- [ ] Add loading states during processing

**Week 7: AI Pronunciation Analysis Integration**
- [ ] Research and select AI service (Whisper/Google STT)
- [ ] Implement AI service adapter
- [ ] Create pronunciation analysis algorithm
- [ ] Implement phoneme error detection (L/N, TR/CH, S/X)
- [ ] Calculate clarity and fluency scores
- [ ] Test with sample Vietnamese audio

**Week 8: Results & Pathway Recommendation**
- [ ] Create results display component
- [ ] Implement pathway recommendation logic
- [ ] Add assessment result persistence
- [ ] Implement one-time assessment enforcement
- [ ] Create results API endpoint
- [ ] Test complete assessment flow E2E

### Phase 4: Practice System (Weeks 9-11)

**Week 9: Practice Pathways**
- [ ] Design pathway content structure
- [ ] Create pathway data (sentences, exercises)
- [ ] Implement day/week content loading
- [ ] Create daily exercise UI
- [ ] Add exercise recording functionality

**Week 10: Progress Tracking**
- [ ] Implement daily check-in system
- [ ] Create streak calculation logic
- [ ] Build progress calendar UI
- [ ] Add milestone notifications
- [ ] Implement pathway completion logic

**Week 11: Practice Features**
- [ ] Add practice recording upload
- [ ] Create progress visualization (charts)
- [ ] Implement week unlocking logic
- [ ] Add video tutorial integration
- [ ] Test practice workflow E2E

### Phase 5: Gemma 4 Chatbot (Weeks 12-13)

**Week 12: Chatbot Backend**
- [ ] Set up Google Gemini API integration
- [ ] Implement context management
- [ ] Create system prompt template
- [ ] Add conversation history storage
- [ ] Implement rate limiting for chat
- [ ] Add caching for common responses

**Week 13: Chatbot UI**
- [ ] Create chat interface component
- [ ] Add typing indicator
- [ ] Implement message sending
- [ ] Add conversation history loading
- [ ] Create daily check-in message system
- [ ] Add reminder notifications

### Phase 6: Expert System (Weeks 14-15)

**Week 14: Expert Features**
- [ ] Create expert profile schema
- [ ] Implement expert listing endpoint
- [ ] Create expert connection request system
- [ ] Build expert browsing UI
- [ ] Add connection request UI

**Week 15: Session Booking**
- [ ] Implement session scheduling
- [ ] Add calendar integration
- [ ] Create session rating system
- [ ] Build session management UI
- [ ] Add email notifications for sessions

### Phase 7: Security & Performance (Weeks 16-17)

**Week 16: Security Hardening**
- [ ] Implement CORS policies
- [ ] Add CSP headers
- [ ] Set up HTTPS (TLS 1.3)
- [ ] Implement data encryption at rest
- [ ] Add audit logging
- [ ] Security audit and penetration testing

**Week 17: Performance Optimization**
- [ ] Implement code splitting
- [ ] Add lazy loading for routes
- [ ] Optimize images and assets
- [ ] Set up CDN for static files
- [ ] Database query optimization
- [ ] Run Lighthouse performance audit
- [ ] Achieve target performance scores

### Phase 8: Testing & Migration (Weeks 18-19)

**Week 18: Comprehensive Testing**
- [ ] Write remaining unit tests (80% coverage)
- [ ] Complete integration test suite
- [ ] Write E2E tests for critical flows
- [ ] Perform cross-browser testing
- [ ] Mobile device testing (iOS Safari, Chrome Android)
- [ ] Load testing with realistic traffic

**Week 19: Data Migration**
- [ ] Create localStorage migration utility
- [ ] Implement migration flow in frontend
- [ ] Test migration with sample data
- [ ] Add migration error handling
- [ ] Create rollback mechanism

### Phase 9: Deployment & Monitoring (Week 20)

**Week 20: Production Launch**
- [ ] Set up production environment
- [ ] Configure environment variables
- [ ] Deploy backend to Railway/Fly.io
- [ ] Deploy frontend to Vercel
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging (Winston)
- [ ] Set up monitoring dashboards
- [ ] Create deployment runbook
- [ ] Soft launch with beta users
- [ ] Monitor and fix critical issues
- [ ] Full production launch

### Post-Launch: Maintenance & Iteration

**Ongoing Tasks**:
- Monitor error rates and performance metrics
- Respond to user feedback
- Fix bugs and security issues
- Optimize AI analysis accuracy
- Add new practice pathways
- Expand expert network
- Improve chatbot responses


## Deployment Architecture

### Infrastructure Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        CloudFlare CDN                        │
│                  (Static Assets, Caching)                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌────────────────┐
│  Vercel       │          │  Railway/Fly.io│
│  (Frontend)   │          │  (Backend API) │
│  - React App  │◄────────►│  - Node.js     │
│  - SSR/SSG    │  HTTPS   │  - Express     │
└───────────────┘          └────────┬───────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
           ┌────────────┐  ┌────────────┐  ┌────────────┐
           │ PostgreSQL │  │ AWS S3 /   │  │ Google AI  │
           │ (Supabase/ │  │ GCS        │  │ (Gemini)   │
           │ Railway)   │  │ (Audio)    │  │            │
           └────────────┘  └────────────┘  └────────────┘
```

### Environment Configurations

#### Development Environment
```yaml
Frontend:
  - Local: http://localhost:5173
  - Hot reload: Enabled
  - Source maps: Enabled
  - API endpoint: http://localhost:3000

Backend:
  - Local: http://localhost:3000
  - Database: Local PostgreSQL or Docker
  - Storage: Local filesystem or S3 dev bucket
  - Logging: Debug level
  - CORS: Allow localhost
```

#### Staging Environment
```yaml
Frontend:
  - URL: https://staging.goodviet.com
  - Build: Production build
  - API endpoint: https://api-staging.goodviet.com

Backend:
  - URL: https://api-staging.goodviet.com
  - Database: Staging PostgreSQL (isolated)
  - Storage: S3 staging bucket
  - Logging: Info level
  - Feature flags: Enabled for testing
```

#### Production Environment
```yaml
Frontend:
  - URL: https://goodviet.com
  - Build: Optimized production build
  - API endpoint: https://api.goodviet.com
  - CDN: CloudFlare
  - Analytics: Google Analytics

Backend:
  - URL: https://api.goodviet.com
  - Database: Production PostgreSQL (with replicas)
  - Storage: S3 production bucket (multi-region)
  - Logging: Warn level
  - Monitoring: Enabled (Sentry, DataDog)
  - Auto-scaling: Enabled
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
      
      - name: Build
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: goodviet-api
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Database Backup Strategy

```typescript
// Automated daily backups
cron.schedule('0 2 * * *', async () => {
  // 2 AM daily backup
  const backupName = `goodviet-${new Date().toISOString().split('T')[0]}.sql`;
  
  await exec(`pg_dump ${process.env.DATABASE_URL} > /backups/${backupName}`);
  
  // Upload to S3
  await s3.upload({
    Bucket: 'goodviet-backups',
    Key: backupName,
    Body: fs.createReadStream(`/backups/${backupName}`)
  });
  
  // Delete local backup
  fs.unlinkSync(`/backups/${backupName}`);
  
  // Clean old backups (keep 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const oldBackups = await s3.listObjects({
    Bucket: 'goodviet-backups',
    Prefix: 'goodviet-'
  });
  
  for (const backup of oldBackups.Contents) {
    if (backup.LastModified < thirtyDaysAgo) {
      await s3.deleteObject({
        Bucket: 'goodviet-backups',
        Key: backup.Key
      });
    }
  }
});
```

### Monitoring & Alerting

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check S3 connection
    await s3.headBucket({ Bucket: process.env.S3_BUCKET_NAME! });
    
    // Check AI service
    const aiHealthy = await checkAIService();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        storage: 'up',
        ai: aiHealthy ? 'up' : 'degraded'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Sentry error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // Sample 10% of transactions
  beforeSend(event, hint) {
    // Don't send sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.['authorization'];
    }
    return event;
  }
});

// Custom metrics
const metrics = {
  apiResponseTime: new Histogram({
    name: 'api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['method', 'route', 'status']
  }),
  
  audioUploads: new Counter({
    name: 'audio_uploads_total',
    help: 'Total number of audio uploads',
    labelNames: ['type', 'status']
  }),
  
  activeUsers: new Gauge({
    name: 'active_users',
    help: 'Number of active users'
  })
};

// Alert rules (configured in monitoring platform)
const alerts = [
  {
    name: 'High Error Rate',
    condition: 'error_rate > 5%',
    severity: 'critical',
    notification: 'email, slack'
  },
  {
    name: 'Slow API Response',
    condition: 'p95_response_time > 1000ms',
    severity: 'warning',
    notification: 'slack'
  },
  {
    name: 'Database Connection Issues',
    condition: 'database_errors > 10 per 5min',
    severity: 'critical',
    notification: 'email, slack, pagerduty'
  }
];
```

## Conclusion

This design document provides a comprehensive technical blueprint for transforming GOODVIET into a production-ready Vietnamese speech therapy platform. The architecture prioritizes:

1. **User Experience**: Offline-first audio recording, smooth state management, Vietnamese error messages
2. **Security**: JWT authentication, bcrypt password hashing, rate limiting, input validation
3. **Scalability**: Clean separation of concerns, database indexes, CDN caching
4. **Maintainability**: TypeScript everywhere, comprehensive testing, clear documentation
5. **Production Readiness**: Monitoring, logging, automated backups, CI/CD pipeline

The implementation roadmap spans 20 weeks, broken into logical phases that build upon each other. Each phase delivers working functionality that can be tested and refined before moving forward.

### Next Steps

1. **Review & Approval**: Stakeholders review this design document
2. **Technical Refinement**: Team discusses specific technology choices and tradeoffs
3. **Sprint Planning**: Break down roadmap into 2-week sprints
4. **Environment Setup**: Set up development, staging, and production environments
5. **Begin Phase 1**: Start with backend foundation and database setup

### Open Questions

1. **AI Pronunciation Analysis**: Which service/model provides best accuracy for Vietnamese phoneme detection? May require custom model training.
2. **Expert Payment System**: Payment processing integration (Stripe, PayPal, local Vietnamese payment gateways) not specified in requirements.
3. **Video Chat Integration**: Expert 1:1 sessions require video chat - integrate Zoom, Google Meet, or custom WebRTC solution?
4. **Scalability Limits**: At what user count do we need to scale horizontally? Plan for Redis caching and load balancing.
5. **Regional Dialects**: Requirement states AI should ignore regional dialects, but this is technically very challenging and may require dialect-specific models.

