# Implementation Plan: GOODVIET Production Improvements

## Overview

This document outlines the implementation tasks for transforming GOODVIET from a UI/UX prototype with mock data into a production-ready Vietnamese speech therapy platform. The implementation follows a 20-week roadmap broken into 9 phases, covering backend infrastructure, audio recording, AI-powered assessment, practice systems, chatbot integration, expert connections, security hardening, testing, and deployment.

**Technology Stack:**
- **Frontend**: React 19 + TypeScript + Vite 8 + Zustand
- **Backend**: Node.js 20 + Express + TypeScript + Prisma
- **Database**: PostgreSQL 15+
- **Storage**: AWS S3 or Google Cloud Storage
- **AI Services**: Pronunciation Analysis API + Google Gemma 4

**Key Features:**
- Real audio recording with MediaRecorder API
- Offline-first architecture with IndexedDB sync
- Three-phase assessment system (12 sentences, error confirmation, storytelling)
- AI pronunciation analysis for Vietnamese phonemes (L/N, TR/CH, S/X)
- Personalized practice pathways with daily check-ins and streak tracking
- Gemma 4-powered chatbot for motivation and guidance
- Expert connection and session booking system
- JWT authentication with bcrypt password hashing
- Production-ready security, performance, and monitoring

## Tasks

### Phase 1: Backend Foundation (Weeks 1-3)

- [x] 1. Set up backend project and database infrastructure
  - [x] 1.1 Initialize Node.js + TypeScript + Express backend project
    - Create `backend/` directory structure with src/, tests/, prisma/ folders
    - Initialize package.json with TypeScript, Express, Prisma, bcrypt, jsonwebtoken dependencies
    - Configure tsconfig.json for Node.js + ES modules
    - Set up .env file structure for environment variables
    - _Requirements: 9, 10, 23_

  - [x] 1.2 Set up PostgreSQL database and Prisma ORM
    - Provision PostgreSQL 15+ database (Railway/Supabase/local)
    - Create Prisma schema file with User, Assessment, AudioRecording models
    - Configure Prisma client generation
    - Run initial migrations to create database tables
    - Test database connection
    - _Requirements: 9, 10, 18_

  - [x] 1.3 Create User and Assessment database schemas
    - Define User model with id, email, passwordHash, fullName, profile fields
    - Define Assessment model with phases, scores, pronunciationIssues JSON field
    - Define AudioRecording model with file metadata and relationships
    - Add indexes for userId, timestamp fields for query performance
    - _Requirements: 10, 12, 18_

  - [x] 1.4 Implement user registration endpoint with password hashing
    - Create POST /api/users/register endpoint
    - Implement email format validation (RFC 5322)
    - Hash passwords using bcrypt with 12 salt rounds
    - Check for duplicate email addresses before registration
    - Return 201 with JWT token on success
    - Return 400 for validation errors, 409 for duplicate email
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 11.2, 11.3, 11.4_

  - [x] 1.5 Implement login endpoint with JWT token generation
    - Create POST /api/users/login endpoint
    - Verify email and password using bcrypt.compare()
    - Generate JWT token with 7-day expiration using jsonwebtoken
    - Include userId, email in JWT payload
    - Sign token with secret key from environment variables
    - Return 200 with user data and token on success
    - Return 401 for invalid credentials
    - _Requirements: 9.5, 9.6, 9.7, 11.3_

  - [x] 1.6 Implement JWT authentication middleware
    - Create middleware to extract JWT from Authorization header
    - Verify JWT signature and expiration using jsonwebtoken.verify()
    - Attach decoded user data to request object
    - Return 401 for expired or invalid tokens
    - Apply middleware to all protected routes
    - _Requirements: 9.8, 9.9, 9.10, 10.11, 10.12_

  - [x] 1.7 Add rate limiting for authentication endpoints
    - Install and configure express-rate-limit middleware
    - Set limit to 5 failed login attempts per email within 15 minutes
    - Block login attempts for 30 minutes after exceeding limit
    - Return 429 error when rate limit is exceeded
    - _Requirements: 9.12, 9.13_

  - [ ]* 1.8 Write unit tests for authentication service
    - Test password hashing with bcrypt
    - Test JWT token generation and validation
    - Test rate limiting behavior
    - Test invalid credentials handling
    - _Requirements: 9.1-9.13_

- [ ] 2. Implement core API endpoints and middleware
  - [x] 2.1 Create user profile GET and PATCH endpoints
    - Implement GET /api/users/profile with JWT authentication
    - Return user profile data including assessmentCompleted status
    - Implement PATCH /api/users/profile for updating profile fields
    - Validate updatable fields (fullName, phoneNumber, dateOfBirth, profileImageUrl)
    - Return 200 with updated user object
    - _Requirements: 10.3, 10.4_

  - [ ] 2.2 Set up cloud storage for audio files (AWS S3 or GCS)
    - Create S3 bucket or GCS bucket with appropriate IAM permissions
    - Configure bucket CORS for frontend uploads
    - Install AWS SDK or Google Cloud Storage SDK
    - Create storage service with upload, download, delete methods
    - Generate secure temporary URLs (presigned URLs) expiring after 3600 seconds
    - _Requirements: 12.1, 12.4, 12.9_

  - [ ] 2.3 Implement file upload endpoint with Multer middleware
    - Install and configure Multer for multipart/form-data handling
    - Create POST /api/assessments/:id/recordings endpoint
    - Validate file format (WAV or WebM only)
    - Validate file size (max 50MB)
    - Upload file to cloud storage with unique identifier
    - Store file metadata in database (duration, format, uploadedAt)
    - Return 201 with recordingId
    - _Requirements: 11.5, 11.6, 12.1, 12.2, 12.3_

  - [ ] 2.4 Create request validation middleware using Zod
    - Install Zod for TypeScript schema validation
    - Create validation schemas for registration, login, profile updates
    - Create validation middleware that validates req.body against schemas
    - Return 400 with specific error messages for validation failures
    - _Requirements: 11.1, 11.2, 11.4, 11.9, 11.10_

  - [ ] 2.5 Implement error handling middleware
    - Create centralized error handler middleware
    - Handle different error types (validation, authentication, not found, server errors)
    - Return appropriate HTTP status codes (400, 401, 403, 404, 500)
    - Log errors to console in development, use Winston in production
    - Prevent exposing stack traces to clients in production
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.10_

  - [ ] 2.6 Add input sanitization for SQL injection and XSS prevention
    - Use Prisma parameterized queries (built-in SQL injection protection)
    - Sanitize text inputs using validator.escape() or similar
    - Add Content Security Policy (CSP) headers
    - _Requirements: 11.7, 11.8, 18.6_

  - [ ]* 2.7 Write integration tests for core API endpoints
    - Test registration, login, profile endpoints with real database
    - Test file upload with mock S3/GCS
    - Test validation error responses
    - Test authentication middleware
    - _Requirements: 9, 10, 11, 12_

- [ ] 3. Complete database schema for all system modules
  - [x] 3.1 Create practice pathway and progress schemas
    - Define PracticePathway model with name, description, durationDays, weeks JSON
    - Define PracticeProgress model with currentWeek, currentDay, streaks
    - Define PracticeSession model with week, day, completedAt, recordings
    - Add foreign key relationships and cascade delete rules
    - _Requirements: 16.1, 16.2, 16.3, 16.9_

  - [x] 3.2 Create chat message schema
    - Define ChatMessage model with userId, senderType, content, timestamp
    - Add index on userId and timestamp for fast queries
    - Include optional fields for bot metadata (promptTokens, completionTokens)
    - _Requirements: 8.10_

  - [x] 3.3 Create expert system schemas
    - Define Expert model with fullName, licenseNumber, specializations, ratings
    - Define ExpertConnection model with userId, expertId, status, timestamps
    - Define ExpertSession model with scheduledAt, duration, sessionType, rating
    - Add unique constraint on userId + expertId for connections
    - _Requirements: 17.1, 17.3, 17.6, 17.7, 17.8_

  - [x] 3.4 Create notification schema
    - Define Notification model with userId, type, title, message, read, timestamp
    - Add index on userId, read status, and timestamp
    - Include actionUrl and actionData JSON fields
    - _Requirements: 8.7_

  - [x] 3.5 Seed database with initial practice pathways and expert data
    - Create seed script with at least 3 practice pathways (L/N, TR/CH, S/X focus)
    - Include complete pathway content with weekly exercises
    - Seed at least 5 expert profiles with varied specializations
    - Run seed script in development environment
    - _Requirements: 16.1, 17.1_

  - [x] 3.6 Add database indexes for performance optimization
    - Add index on User.email for fast login lookups
    - Add composite index on PracticeProgress(userId, pathwayId)
    - Add index on ChatMessage(userId, timestamp) for pagination
    - Add index on AudioRecording(assessmentId) and (practiceSessionId)
    - Verify index usage with EXPLAIN queries
    - _Requirements: 21.9_

- [ ] 4. Checkpoint - Backend foundation complete
  - Ensure all tests pass
  - Verify database migrations applied successfully
  - Test authentication flow end-to-end
  - Ask user if questions arise

### Phase 2: Audio Recording & Storage (Weeks 4-5)

- [ ] 5. Build frontend audio recording system
  - [ ] 5.1 Create AudioRecorder component with MediaRecorder API
    - Create React component in src/components/audio/AudioRecorder.tsx
    - Request microphone permission using navigator.mediaDevices.getUserMedia()
    - Display error message if permission denied with instructions to enable
    - Initialize MediaRecorder with audio/webm;codecs=opus MIME type
    - Fallback to audio/wav if WebM not supported
    - Configure 16kHz sample rate and 128kbps bit rate
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ] 5.2 Add recording controls and visual feedback
    - Create start, pause, stop, cancel recording buttons
    - Disable navigation/buttons while recording is in progress
    - Display elapsed time counter during recording
    - Add visual waveform animation using Web Audio API or canvas
    - Limit maximum recording duration to 300 seconds
    - Auto-stop recording if 300 seconds exceeded with notification
    - _Requirements: 1.3, 1.7, 1.8_

  - [ ] 5.3 Implement audio playback functionality
    - Create AudioPlayer component for playing back recordings
    - Allow user to review recording before submission
    - Display playback progress bar and time
    - Add play, pause, seek controls
    - _Requirements: 1.6_

  - [ ] 5.4 Handle browser compatibility for audio formats
    - Detect supported MIME types using MediaRecorder.isTypeSupported()
    - Prefer audio/webm, fallback to audio/wav
    - Test on Chrome, Firefox, Safari (iOS and desktop)
    - Handle Safari-specific MediaRecorder limitations
    - _Requirements: 1.4, 20.9_

  - [ ]* 5.5 Write unit tests for AudioRecorder component
    - Mock navigator.mediaDevices.getUserMedia()
    - Test permission request and denial handling
    - Test recording start, stop, cancel flows
    - Test maximum duration enforcement
    - _Requirements: 1.1-1.8_

- [ ] 6. Implement offline storage and synchronization
  - [ ] 6.1 Set up IndexedDB database with idb library
    - Install idb library for promise-based IndexedDB access
    - Create IndexedDB database named "goodviet-audio" with version 1
    - Define "recordings" object store with id keyPath
    - Add indexes for timestamp and uploadStatus fields
    - Create service wrapper in src/services/storage/indexedDB.ts
    - _Requirements: 13.1, 13.2_

  - [ ] 6.2 Implement recording storage service
    - Create saveRecording() method to store blob + metadata in IndexedDB
    - Generate unique ID for each recording
    - Store metadata: userId, sentenceId/exerciseId, duration, format, timestamp, uploadStatus
    - Mark initial uploadStatus as "pending"
    - Create getRecording() method to retrieve by ID
    - Create getPendingUploads() method to query uploadStatus="pending"
    - _Requirements: 1.9, 13.1, 13.2_

  - [ ] 6.3 Create offline sync manager with automatic upload
    - Create OfflineSyncManager class in src/services/storage/uploader.ts
    - Listen for online/offline events using window.addEventListener()
    - Automatically trigger upload on app start if online
    - Automatically trigger upload when connection restored (online event)
    - Upload recordings in FIFO order (oldest first)
    - _Requirements: 13.3, 13.7_

  - [ ] 6.4 Implement retry logic with exponential backoff
    - Retry failed uploads up to 3 times
    - Use exponential backoff delays: 5 seconds, 15 seconds, 45 seconds
    - Track retry count in metadata
    - Mark as "failed" after 3 retries and notify user
    - Provide manual retry button in UI
    - _Requirements: 13.8, 14.8_

  - [ ] 6.5 Add storage quota management
    - Create getStorageUsage() method to check available space
    - Display warning when available storage below 50 MB
    - Automatically delete oldest uploaded recordings when quota exceeded
    - Keep successfully uploaded recordings for 7 days before deletion
    - Delete failed recordings after 30 days
    - _Requirements: 1.10, 13.5, 13.6_

  - [ ] 6.6 Create sync status indicators in UI
    - Display "Offline Mode" badge when not connected
    - Show pending upload count
    - Display sync progress during upload
    - Show success/error notifications after sync
    - _Requirements: 13.7, 14.1_

  - [ ]* 6.7 Test offline-first workflow end-to-end
    - Test recording while offline saves to IndexedDB
    - Test automatic upload when connection restored
    - Test retry logic for failed uploads
    - Test storage quota management
    - Simulate network failures and recoveries
    - _Requirements: 13.1-13.8_

### Phase 3: Assessment System (Weeks 6-8)

- [ ] 7. Build three-phase assessment UI
  - [ ] 7.1 Create Phase I recording interface (12 sentences)
    - Create AssessmentPhaseI component in src/components/assessment/
    - Display 12 predefined sentences one at a time
    - Show sentence text clearly before recording begins
    - Integrate AudioRecorder component for each sentence
    - Save each recording with unique sentenceId identifier
    - Display progress indicator (e.g., "3 of 12 completed")
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [ ] 7.2 Add navigation and validation for Phase I
    - Add "Previous" and "Next" buttons for sentence navigation
    - Disable navigation buttons while recording is active
    - Track completion status for all 12 sentences
    - Enable "Complete Phase I" button only when all sentences recorded
    - Prevent progression to Phase II without all 12 recordings
    - Display warning message if user attempts to skip sentences
    - _Requirements: 2.4, 2.5, 2.7, 2.8_

  - [ ] 7.3 Create Phase II dynamic error confirmation interface
    - Create AssessmentPhaseII component
    - Fetch Phase II sentence list from backend (incorrectly pronounced + verification sentences)
    - Display which sentences are re-recordings from Phase I
    - Display which sentences are new verification sentences
    - Use same recording interface as Phase I
    - Submit all Phase II recordings to backend
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_

  - [ ] 7.4 Create Phase III storytelling interface
    - Create AssessmentPhaseIII component
    - Display primary storytelling prompt about daily routine
    - Display 4-6 follow-up questions to encourage longer storytelling
    - Allow continuous recording for 120-300 seconds
    - Display recording timer during storytelling
    - Prevent submission if recording is shorter than 120 seconds
    - Show message requesting longer response if under 120 seconds
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 7.5 Add processing screen with loading animations
    - Create ProcessingScreen component
    - Display during AI analysis (after Phase III submission)
    - Show animated progress indicator
    - Display status text updates (e.g., "Analyzing pronunciation...", "Detecting errors...")
    - Show estimated time remaining (based on 180 second max processing time)
    - _Requirements: 5.1, 15.2, 15.6_

  - [ ] 7.6 Implement assessment state management with Zustand
    - Update assessmentStore.ts to track current phase, recordings, completion status
    - Store assessment ID from backend
    - Track which sentences have been recorded
    - Handle phase transitions (Phase I → Phase II → Phase III)
    - Store processing status (processing, completed, failed)
    - _Requirements: 2, 3, 4, 5_

- [ ] 8. Integrate AI pronunciation analysis
  - [ ] 8.1 Research and select AI pronunciation analysis service
    - Evaluate options: OpenAI Whisper API, Google Speech-to-Text, custom model
    - Test Vietnamese language support and phoneme detection accuracy
    - Assess cost, latency, and accuracy tradeoffs
    - Document selected service and rationale
    - _Requirements: 5_

  - [ ] 8.2 Implement AI service integration adapter
    - Create AI service wrapper in src/services/ai/analyzer.ts (backend)
    - Implement audio file submission to AI service
    - Parse AI service response for transcription and timing data
    - Handle API errors and timeouts gracefully
    - Add retry logic for transient failures
    - _Requirements: 5.1_

  - [ ] 8.3 Create pronunciation error detection algorithm
    - Implement L/N phoneme confusion detection with 85%+ accuracy
    - Implement TR/CH phoneme confusion detection with 85%+ accuracy
    - Implement S/X phoneme confusion detection with 85%+ accuracy
    - Extract timestamp locations for each detected error
    - Classify error severity as mild, moderate, or severe based on frequency
    - Ignore regional accent differences (Northern, Central, Southern Vietnamese)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.12_

  - [ ] 8.4 Calculate pronunciation scores and metrics
    - Calculate overall clarity score (0-100) based on error frequency
    - Calculate fluency score (0-100) based on speech rate and hesitation patterns
    - Measure speech rate in words per minute
    - Determine confidence level (low, medium, high) based on voice stability
    - Generate comprehensive Assessment_Result object
    - _Requirements: 5.7, 5.8, 5.9, 5.10, 5.11_

  - [x] 8.5 Create backend endpoint for AI analysis completion
    - Create webhook or polling endpoint for AI processing status
    - Update assessment record with analysis results
    - Store pronunciationIssues as JSON in database
    - Calculate and store all scores (overall, clarity, fluency)
    - Trigger pathway recommendation algorithm
    - _Requirements: 5.1, 5.11, 6.7_

  - [ ]* 8.6 Test AI analysis with sample Vietnamese audio files
    - Create test suite with 20+ Vietnamese audio samples
    - Validate L/N, TR/CH, S/X error detection accuracy
    - Test edge cases (unclear audio, background noise, multiple errors)
    - Verify score calculations are consistent
    - Measure processing time (must be under 180 seconds)
    - _Requirements: 5.1-5.12_

- [ ] 9. Build assessment results and pathway recommendation
  - [ ] 9.1 Implement pathway recommendation logic
    - Analyze pronunciationIssues to identify most severe phoneme errors
    - Map errors to appropriate practice pathways (L/N, TR/CH, S/X, or combined)
    - Select pathway with best match for user's detected issues
    - Return pathway details (id, name, description, duration, targetPhonemes)
    - _Requirements: 6.4, 6.5_

  - [ ] 9.2 Create assessment results display component
    - Create ResultsDisplay component in src/components/assessment/
    - Display overall pronunciation score prominently (large, colored badge)
    - Show breakdown: clarity score, fluency score, speech rate, confidence level
    - List each detected phoneme error with severity badge (mild/moderate/severe)
    - Show error descriptions in Vietnamese
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 9.3 Display recommended pathway with call-to-action
    - Show recommended pathway card with name, description, duration
    - Highlight targeted phoneme errors that pathway addresses
    - Add "Begin Practice Pathway" button
    - Link button to practice pathway start endpoint
    - _Requirements: 6.4, 6.5, 6.6_

  - [ ] 9.4 Implement one-time assessment enforcement
    - Check assessmentCompleted flag in user profile before allowing access
    - Redirect to results page if assessment already completed
    - Display message: "You have already completed the assessment"
    - Provide button to view past assessment results
    - Store assessmentCompleted status in database after Phase III completion
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 9.5 Persist assessment results to user profile
    - Save assessment result to database with all scores and errors
    - Link assessment to user profile
    - Allow users to view results anytime from profile page
    - Create GET /api/assessments/result endpoint
    - _Requirements: 6.7, 7.5, 10.5_

  - [ ]* 9.6 Test complete assessment flow end-to-end
    - Test Phase I → Phase II → Phase III progression
    - Test AI analysis triggering and result storage
    - Test pathway recommendation accuracy
    - Test one-time enforcement blocking repeat assessments
    - Test results display with various error combinations
    - _Requirements: 2, 3, 4, 5, 6, 7_

- [ ] 10. Checkpoint - Assessment system complete
  - Ensure all tests pass
  - Test complete assessment flow with real audio
  - Verify AI analysis accuracy meets 85% threshold
  - Ask user if questions arise

### Phase 4: Practice System (Weeks 9-11)

- [ ] 11. Implement practice pathway system
  - [ ] 11.1 Create practice pathway data structure
    - Define pathway content structure with weeks array
    - Each week contains 7 days with exercises
    - Each exercise has type (reading, listening, speaking), title, instructions, sentences
    - Include video tutorial URLs and durations where applicable
    - Create at least 3 complete pathways (L/N focus, TR/CH focus, S/X focus)
    - _Requirements: 16.1_

  - [x] 11.2 Implement GET /api/practice/pathways endpoint
    - Return list of available practice pathways
    - Include pathway metadata (id, name, description, durationDays, targetPhonemes)
    - Filter by targetPhonemes if query parameter provided
    - _Requirements: 16.1_

  - [x] 11.3 Implement POST /api/practice/start endpoint
    - Accept pathwayId in request body
    - Create PracticeProgress record for user
    - Set currentWeek = 1, currentDay = 1
    - Initialize currentStreak = 0, longestStreak = 0
    - Return progressId and pathway details
    - _Requirements: 16.1, 16.9_

  - [x] 11.4 Create GET /api/practice/day/:week/:day endpoint
    - Validate user has unlocked requested week/day
    - Return exercises for the specific day
    - Include sentences, instructions, video tutorial if available
    - Return 403 if user tries to access future content
    - _Requirements: 16.9, 16.10_

  - [ ] 11.5 Build daily exercise UI component
    - Create DailyExercise component in src/components/practice/
    - Display exercise type, title, and instructions
    - Show sentences for reading/speaking exercises
    - Integrate AudioRecorder for speaking exercises
    - Add audio playback for listening exercises
    - Display video tutorial if available (embedded or linked)
    - _Requirements: 16.1_

  - [ ] 11.6 Add practice recording upload functionality
    - Reuse AudioRecorder component
    - Save recording to IndexedDB with exerciseId
    - Upload to backend via POST /api/practice/recording
    - Associate recording with current practice session
    - _Requirements: 16.3_

- [ ] 12. Build progress tracking and streak system
  - [x] 12.1 Implement daily check-in system
    - Create POST /api/practice/checkin endpoint
    - Accept week, day, exercisesCompleted in request body
    - Create PracticeSession record with completedAt timestamp
    - Calculate new streak based on consecutive check-ins
    - Reset streak to 0 if user missed previous day
    - _Requirements: 16.4, 16.5, 16.6_

  - [ ] 12.2 Create streak calculation logic
    - Query last check-in date from database
    - Compare with current date
    - Increment streak if last check-in was yesterday
    - Maintain current streak if last check-in was today (prevent double counting)
    - Reset to 1 if gap between check-ins is > 1 day
    - Update longestStreak if currentStreak exceeds it
    - _Requirements: 16.5_

  - [ ] 12.3 Build progress calendar UI
    - Create ProgressCalendar component in src/components/practice/
    - Display calendar grid showing completed and missed days
    - Highlight current day
    - Mark completed days with checkmark or color
    - Mark missed days with different visual indicator
    - Show week and day numbers
    - _Requirements: 16.8_

  - [ ] 12.4 Create streak display component
    - Create StreakDisplay component showing current streak prominently
    - Display fire icon or similar motivational graphic
    - Show "X days in a row" text
    - Display longest streak below current streak
    - Update in real-time when check-in completed
    - _Requirements: 16.7_

  - [ ] 12.5 Implement GET /api/practice/progress endpoint
    - Return user's current practice progress
    - Include pathway details, currentWeek, currentDay
    - Include currentStreak, longestStreak, lastCheckIn
    - Calculate completionPercentage based on days completed
    - Return count of completed sessions
    - _Requirements: 10.7, 16.5, 16.7, 16.8_

  - [ ] 12.6 Add milestone notifications
    - Detect milestone achievements (7-day streak, 30-day streak, week complete)
    - Return milestone data in check-in response
    - Display celebratory notification in UI
    - Store notification in database for later viewing
    - _Requirements: 16.4_

- [ ] 13. Add practice features and visualization
  - [ ] 13.1 Implement week unlocking logic
    - Check if current week is completed before allowing next week access
    - A week is complete when all 7 days have check-ins
    - Return 403 error if user tries to access locked week
    - Update currentWeek in PracticeProgress when week completed
    - _Requirements: 16.10_

  - [ ] 13.2 Create progress visualization with charts
    - Use Recharts library (already installed) for data visualization
    - Create line chart showing daily completion over time
    - Create bar chart showing weekly progress
    - Display completion percentage for entire pathway
    - Show days completed vs. total days
    - _Requirements: 16.2_

  - [ ] 13.3 Add video tutorial integration
    - Embed YouTube or Vimeo videos in exercise UI
    - Display video duration and title
    - Add lazy loading to prevent auto-loading all videos
    - Provide fallback if video fails to load
    - _Requirements: 21.6_

  - [ ] 13.4 Implement pathway completion tracking
    - Detect when user completes final day of pathway
    - Mark pathway as completed in database
    - Update completedAt timestamp in PracticeProgress
    - Display completion certificate or congratulations message
    - _Requirements: 16.9_

  - [ ]* 13.5 Test practice workflow end-to-end
    - Test pathway selection and start
    - Test daily exercise completion and recording
    - Test check-in system and streak calculation
    - Test week unlocking logic
    - Test milestone notifications
    - Test pathway completion
    - _Requirements: 16.1-16.10_

- [ ] 14. Checkpoint - Practice system complete
  - Ensure all tests pass
  - Test complete practice flow for at least one pathway
  - Verify streak calculations are accurate
  - Ask user if questions arise

### Phase 5: Gemma 4 Chatbot (Weeks 12-13)

- [x] 15. Integrate Gemma 4 chatbot backend
  - [x] 15.1 Set up Google Gemini API integration
    - Create Google Cloud project and enable Gemini API
    - Obtain API key and store in environment variables
    - Install Google Generative AI SDK (@google/generative-ai)
    - Create AI service wrapper in backend/src/services/gemini.service.ts
    - Initialize Gemini model (gemini-4-flash or gemini-4-pro)
    - _Requirements: 8.1_

  - [x] 15.2 Create system prompt template for speech therapy context
    - Write system prompt defining chatbot role as motivational speech therapy companion
    - Include context about GOODVIET, Vietnamese phoneme issues (L/N, TR/CH, S/X)
    - Define chatbot personality: encouraging, patient, knowledgeable
    - Set boundaries: avoid medical diagnoses, stay within speech therapy domain
    - Add instructions to redirect off-topic questions politely
    - _Requirements: 8.5, 8.8, 8.9_

  - [x] 15.3 Implement conversation context management
    - Maintain conversation history in memory for current session
    - Include last 10 messages in context window for Gemini API
    - Fetch user's practice progress and inject into context for personalization
    - Include assessment results in context when relevant
    - Clear old context to stay within token limits
    - _Requirements: 8.3, 8.4_

  - [x] 15.4 Create POST /api/chat/messages endpoint
    - Accept user message content in request body
    - Validate message is not empty and under 2000 characters
    - Save user message to database with timestamp
    - Send message to Gemini API with context
    - Receive and save bot response to database
    - Return both user message and bot response
    - Ensure response time is under 3 seconds
    - _Requirements: 8.2, 8.10, 10.10_

  - [ ] 15.5 Add rate limiting for chat endpoint
    - Limit to 20 messages per minute per user
    - Return 429 error if limit exceeded
    - _Requirements: 10.10_

  - [ ] 15.6 Implement caching for common responses
    - Cache frequently asked questions and responses
    - Use in-memory cache (or Redis if available) with TTL
    - Reduce API calls and improve response times
    - _Requirements: 8.2_

- [ ] 16. Build chatbot UI
  - [ ] 16.1 Create chat interface component
    - Create ChatInterface component in src/components/chat/
    - Display chat container with message list and input area
    - Style with Positivus design system
    - Make responsive for mobile devices
    - _Requirements: 8_

  - [ ] 16.2 Create message list with auto-scroll
    - Create MessageList component
    - Display messages in chronological order (oldest at top)
    - Auto-scroll to bottom when new message arrives
    - Differentiate user vs. bot messages visually (alignment, colors)
    - Show timestamp for each message
    - _Requirements: 8.10_

  - [ ] 16.3 Add message input with send button
    - Create MessageInput component
    - Add textarea for user input
    - Add send button (or Enter key to send)
    - Disable input while bot is responding
    - Clear input after message sent
    - Validate message is not empty before sending
    - _Requirements: 8.2_

  - [ ] 16.4 Implement typing indicator
    - Create TypingIndicator component
    - Show animated "..." indicator while bot is generating response
    - Display below last message in chat
    - Hide when bot response received
    - _Requirements: 8.2, 15.4_

  - [x] 16.5 Implement GET /api/chat/history endpoint
    - Return paginated chat message history
    - Accept limit (default 50, max 100) and before (timestamp) query params
    - Return messages sorted by timestamp descending (newest first)
    - Include hasMore flag for pagination
    - _Requirements: 8.10, 10.9_

  - [ ] 16.6 Add conversation history loading in UI
    - Load last 50 messages on component mount
    - Implement infinite scroll or "Load More" button for older messages
    - Display messages in correct chronological order
    - _Requirements: 8.10_

  - [ ] 16.7 Create daily check-in message system
    - Implement scheduled job (cron) to send daily check-in message
    - Ask about practice completion and user mood
    - Personalize message based on user's progress
    - Store as bot message in database
    - _Requirements: 8.6_

  - [ ] 16.8 Add reminder notifications for inactive users
    - Detect when user hasn't practiced for 24 hours
    - Send gentle reminder message via chatbot
    - Avoid being pushy or negative
    - _Requirements: 8.7_

  - [ ]* 16.9 Test chatbot conversation flows
    - Test basic Q&A about Vietnamese pronunciation
    - Test motivational responses based on practice progress
    - Test off-topic question redirection
    - Test response quality and accuracy
    - Test rate limiting enforcement
    - _Requirements: 8.1-8.10_

- [ ] 17. Checkpoint - Chatbot integration complete
  - Ensure all tests pass
  - Test chatbot conversations with various scenarios
  - Verify response times are under 3 seconds
  - Ask user if questions arise

### Phase 6: Expert System (Weeks 14-15)

- [ ] 18. Build expert connection system
  - [x] 18.1 Create expert profile management
    - Implement expert profile schema (already done in Phase 1)
    - Seed database with 5-10 expert profiles
    - Include fullName, licenseNumber, specializations, bio, profileImageUrl
    - Set initial averageRating and totalRatings
    - _Requirements: 17.1_

  - [x] 18.2 Implement GET /api/experts endpoint
    - Return list of active experts
    - Accept optional specialization filter query parameter
    - Accept optional minRating filter
    - Include expert metadata (name, image, specializations, bio, ratings)
    - _Requirements: 17.1_

  - [ ] 18.3 Build expert browsing UI
    - Create ExpertList component in src/components/expert/
    - Display expert cards in grid layout
    - Show expert photo, name, specializations, rating
    - Add "View Profile" button for each expert
    - _Requirements: 17.1_

  - [ ] 18.4 Create expert profile detail page
    - Create ExpertProfile component
    - Display full bio, specializations, credentials
    - Show average rating and total number of ratings
    - Display rating breakdown (e.g., bar chart)
    - Add "Request Connection" button
    - _Requirements: 17.1, 17.8_

  - [x] 18.5 Implement POST /api/expert-connections endpoint
    - Accept expertId and optional message in request body
    - Create ExpertConnection record with status="pending"
    - Send user's assessment result and practice recordings to expert for review
    - Return connectionId and status
    - _Requirements: 17.2, 17.3_

  - [ ] 18.6 Create connection request UI
    - Create modal or form for connection request
    - Allow user to add optional message to expert
    - Show user's assessment summary and progress
    - Display confirmation after request submitted
    - _Requirements: 17.2_

  - [x] 18.7 Implement GET /api/expert-connections endpoint
    - Return user's expert connections
    - Include connection status (pending, accepted, declined)
    - Include expert details
    - Include request and response timestamps
    - _Requirements: 17.3_

  - [ ] 18.8 Add connection notification system
    - Send email notification to user when expert accepts connection
    - Send in-app notification
    - _Requirements: 17.4_

- [ ] 19. Build session booking and rating system
  - [ ] 19.1 Create session scheduling interface
    - Create SessionBooking component
    - Display calendar for selecting session date/time
    - Show expert's availability
    - Allow user to select session type (initial consultation, follow-up, progress review)
    - Allow user to select duration (30, 60, 90 minutes)
    - _Requirements: 17.5_

  - [x] 19.2 Implement POST /api/expert-sessions endpoint
    - Accept connectionId, scheduledAt, duration, sessionType in request body
    - Validate connection is accepted before allowing booking
    - Create ExpertSession record with status="scheduled"
    - Return sessionId and confirmation details
    - _Requirements: 17.5_

  - [x] 19.3 Add video meeting URL generation
    - Generate unique meeting URL for each session (Zoom, Google Meet, or custom WebRTC)
    - Store meetingUrl in ExpertSession record
    - Include in confirmation email and session details
    - _Requirements: 17.5_

  - [ ] 19.4 Create session management UI
    - Display list of scheduled sessions
    - Show session details (date, time, expert, type, duration)
    - Provide "Join Session" button when session time arrives
    - Allow cancellation with confirmation
    - _Requirements: 17.6_

  - [ ] 19.5 Implement session rating system
    - Create POST /api/expert-sessions/:id/rating endpoint
    - Accept rating (1-5 stars) and optional feedback text
    - Update ExpertSession record with rating and feedback
    - Recalculate expert's averageRating and totalRatings
    - Return updated rating data
    - _Requirements: 17.7, 17.8_

  - [ ] 19.6 Add post-session rating prompt
    - Display rating modal after session marked as completed
    - Show 1-5 star selector
    - Add optional text feedback field
    - Send rating to backend
    - Thank user for feedback
    - _Requirements: 17.7_

  - [ ] 19.7 Implement expert quality flagging
    - Create automated job to check expert ratings periodically
    - Flag experts with averageRating < 4.5 and totalRatings >= 10
    - Store flag in database for admin review
    - _Requirements: 17.9_

  - [ ] 19.8 Add email notifications for sessions
    - Send session confirmation email after booking
    - Send reminder email 24 hours before session
    - Send reminder email 1 hour before session
    - Include meeting URL and session details
    - _Requirements: 17.4_

  - [ ]* 19.9 Test expert system end-to-end
    - Test expert browsing and profile viewing
    - Test connection request flow
    - Test session booking
    - Test session rating and expert rating calculation
    - Test email notifications
    - _Requirements: 17.1-17.10_

- [ ] 20. Checkpoint - Expert system complete
  - Ensure all tests pass
  - Test complete expert connection and booking flow
  - Verify rating calculations are accurate
  - Ask user if questions arise

### Phase 7: Security & Performance (Weeks 16-17)

- [x] 21. Implement security hardening
  - [x] 21.1 Configure CORS policies
    - Install and configure cors middleware in Express
    - Restrict requests to official GOODVIET domain (https://goodviet.com)
    - Allow credentials (cookies, authorization headers)
    - Set appropriate Access-Control headers
    - _Requirements: 18.4_

  - [x] 21.2 Add Content Security Policy (CSP) headers
    - Install helmet middleware for security headers
    - Configure CSP to prevent XSS attacks
    - Whitelist allowed script sources, style sources, image sources
    - Block inline scripts and eval()
    - _Requirements: 18.6_

  - [ ] 21.3 Set up HTTPS with TLS 1.3
    - Configure production hosting (Vercel, Railway) to use HTTPS
    - Enforce HTTPS redirects (HTTP → HTTPS)
    - Use TLS 1.3 or higher
    - Enable HSTS (HTTP Strict Transport Security)
    - _Requirements: 18.1_

  - [ ] 21.4 Implement data encryption at rest
    - Configure PostgreSQL database encryption
    - Encrypt sensitive fields (passwordHash already handled by bcrypt)
    - Use AES-256 encryption for stored sensitive data if needed
    - _Requirements: 18.2_

  - [ ] 21.5 Add audit logging for security events
    - Create AuditLog model (already done in Phase 1)
    - Log all authentication attempts (success and failure)
    - Log sensitive operations (profile updates, data exports, deletions)
    - Include IP address, user agent, timestamp
    - _Requirements: 18.10, 23.1_

  - [ ] 21.6 Validate file uploads for malicious content
    - Check file MIME types match file extensions
    - Scan uploaded files for malware (use ClamAV or cloud service)
    - Reject suspicious files
    - _Requirements: 18.5_

  - [ ] 21.7 Implement request size limits
    - Set maximum request body size (10MB for JSON, 50MB for audio files)
    - Prevent denial-of-service attacks via large payloads
    - Return 413 Payload Too Large error
    - _Requirements: 18.9_

  - [ ] 21.8 Secure JWT token storage
    - Store JWT tokens in httpOnly cookies (not localStorage)
    - Set Secure flag (cookies only sent over HTTPS)
    - Set SameSite attribute to prevent CSRF
    - Never expose tokens in URL query parameters
    - _Requirements: 18.7, 18.8_

  - [ ]* 21.9 Conduct security audit and penetration testing
    - Run automated security scanner (OWASP ZAP, Burp Suite)
    - Test for common vulnerabilities (SQL injection, XSS, CSRF)
    - Test authentication and authorization logic
    - Document findings and remediate issues
    - _Requirements: 18.1-18.10_

- [ ] 22. Optimize performance
  - [ ] 22.1 Implement code splitting for frontend
    - Configure Vite to split code by routes
    - Use React.lazy() for route components
    - Reduce initial bundle size
    - _Requirements: 21.3_

  - [ ] 22.2 Add lazy loading for routes and components
    - Lazy load non-critical routes (profile, expert pages)
    - Lazy load heavy components (charts, video players)
    - Show loading indicators during lazy load
    - _Requirements: 21.3_

  - [ ] 22.3 Optimize images and static assets
    - Compress images using modern formats (WebP, AVIF)
    - Reduce image file sizes by at least 50% without quality loss
    - Use responsive images with srcset
    - _Requirements: 21.5, 21.7_

  - [ ] 22.4 Set up CDN for static files
    - Configure CloudFlare or similar CDN
    - Serve fonts, images, icons from CDN
    - Set cache headers for 7 days on static assets
    - _Requirements: 21.4_

  - [ ] 22.5 Optimize database queries
    - Add EXPLAIN ANALYZE to slow queries
    - Ensure indexes are used efficiently
    - Optimize N+1 query problems with Prisma includes
    - _Requirements: 21.9_

  - [ ] 22.6 Add debouncing for search and filter inputs
    - Debounce search inputs with 300ms delay
    - Prevent excessive API calls while typing
    - _Requirements: 21.7_

  - [ ] 22.7 Implement pagination for large lists
    - Add pagination to expert lists, chat history, practice sessions
    - Use cursor-based pagination for chat (based on timestamp)
    - Use offset-based pagination for experts (page numbers)
    - Limit to 50 items per page
    - _Requirements: 21.8_

  - [ ] 22.8 Run Lighthouse performance audit
    - Run Lighthouse on all major pages
    - Aim for performance score of 85+
    - Optimize based on Lighthouse recommendations
    - Test on mobile and desktop
    - _Requirements: 21.2_

  - [ ] 22.9 Test initial page load time
    - Measure page load time on 4G mobile connection
    - Ensure initial load under 3 seconds
    - Test with throttled network in DevTools
    - _Requirements: 21.1_

  - [ ]* 22.10 Test API response times
    - Measure 95th percentile response time for all endpoints
    - Ensure authenticated endpoints respond within 500ms (p95)
    - Optimize slow endpoints
    - _Requirements: 21.9_

- [ ] 23. Checkpoint - Security and performance hardening complete
  - Ensure all tests pass
  - Verify Lighthouse performance score >= 85
  - Verify security audit passes with no critical issues
  - Ask user if questions arise

### Phase 8: Testing & Migration (Weeks 18-19)

- [ ] 24. Write comprehensive test suite
  - [ ]* 24.1 Achieve 80% unit test coverage
    - Write unit tests for all services, utilities, and helpers
    - Test authentication logic, JWT generation/verification
    - Test audio processing, storage services
    - Test AI analysis algorithms
    - Test streak calculation logic
    - Measure coverage with Vitest coverage tools
    - _Requirements: 25.1_

  - [ ]* 24.2 Write integration tests for API endpoints
    - Test all authentication endpoints
    - Test assessment flow endpoints
    - Test practice tracking endpoints
    - Test chat endpoints
    - Test expert system endpoints
    - Use real database (test instance) for integration tests
    - _Requirements: 25.2_

  - [ ]* 24.3 Write end-to-end tests for critical user flows
    - Install Playwright for E2E testing
    - Test complete registration → login → assessment → results flow
    - Test practice pathway selection → daily exercise → check-in flow
    - Test chatbot conversation flow
    - Test expert connection request → booking → rating flow
    - _Requirements: 25.3_

  - [ ]* 24.4 Perform cross-browser testing
    - Test on Chrome (desktop and Android)
    - Test on Firefox (desktop)
    - Test on Safari (desktop and iOS)
    - Test on Edge (desktop)
    - Document any browser-specific issues
    - _Requirements: 20.9, 25.4_

  - [ ]* 24.5 Perform mobile device testing
    - Test on real iOS devices (iPhone 12+, Safari)
    - Test on real Android devices (Samsung, Pixel, Chrome)
    - Test audio recording on mobile browsers
    - Test responsive design on various screen sizes (320px - 1920px)
    - Test touch interactions and gestures
    - _Requirements: 20.1, 20.2, 20.3, 20.8_

  - [ ]* 24.6 Conduct load testing
    - Use k6 or Artillery for load testing
    - Simulate 100 concurrent users
    - Test authentication, file uploads, API endpoints under load
    - Identify performance bottlenecks
    - Verify API response times remain acceptable under load
    - _Requirements: 21.9, 25.5_

- [x] 25. Implement localStorage to backend migration
  - [x] 25.1 Create localStorage migration utility
    - Create migration service in src/services/storage/migrator.ts
    - Detect existing localStorage data (user profile, assessment, chat, practice)
    - Parse localStorage data structures
    - Map old data to new API data structures
    - _Requirements: 19.1, 19.2_

  - [x] 25.2 Implement migration flow in frontend
    - Trigger migration check on login
    - Show migration progress indicator
    - Upload user profile data to backend
    - Upload assessment completion status and results
    - Upload chat history messages
    - Upload practice progress and check-in records
    - _Requirements: 19.2, 19.3, 19.4, 19.5, 19.6, 19.9_

  - [ ] 25.3 Add migration error handling
    - Preserve localStorage data if migration fails
    - Display error message with retry button
    - Log migration errors for debugging
    - Allow user to skip migration temporarily
    - _Requirements: 19.8, 19.10_

  - [ ] 25.4 Create migration rollback mechanism
    - Keep localStorage backup during migration
    - Allow user to revert to localStorage if issues arise
    - Clear backup after successful migration confirmed
    - _Requirements: 19.10_

  - [ ] 25.5 Clear localStorage after successful migration
    - Delete migrated data from localStorage
    - Keep migration completion flag
    - Prevent duplicate migrations
    - _Requirements: 19.7_

  - [ ]* 25.6 Test migration with sample localStorage data
    - Create test localStorage data representing various user states
    - Test migration of complete assessment results
    - Test migration of partial assessment progress
    - Test migration of chat history
    - Test migration of practice data
    - Test error handling when backend fails
    - _Requirements: 19.1-19.10_

- [ ] 26. Checkpoint - Testing and migration complete
  - Ensure all tests pass with 80%+ coverage
  - Verify E2E tests cover critical flows
  - Test migration with various localStorage states
  - Ask user if questions arise

### Phase 9: Deployment & Monitoring (Week 20)

- [ ] 27. Set up production environment and deployment
  - [ ] 27.1 Create production environment configurations
    - Set up production PostgreSQL database (Railway/Supabase/AWS RDS)
    - Create production S3 bucket or GCS bucket
    - Configure environment variables for production
    - Set up separate staging environment for pre-production testing
    - _Requirements: 23.2, 23.3_

  - [ ] 27.2 Deploy backend to Railway or Fly.io
    - Create Railway/Fly.io project
    - Configure Dockerfile for backend
    - Set environment variables (DATABASE_URL, JWT_SECRET, S3 credentials, etc.)
    - Deploy backend API
    - Verify API is accessible via HTTPS
    - _Requirements: 23.2_

  - [ ] 27.3 Run database migrations in production
    - Run Prisma migrate deploy command
    - Verify all tables and indexes created
    - Run seed script for initial pathways and experts
    - Test database connectivity from backend
    - _Requirements: 23.2_

  - [ ] 27.4 Deploy frontend to Vercel
    - Create Vercel project
    - Connect GitHub repository for automatic deployments
    - Configure environment variables (API_URL, etc.)
    - Set up custom domain (goodviet.com)
    - Enable automatic HTTPS and CDN
    - _Requirements: 23.3_

  - [ ] 27.5 Set up error tracking with Sentry
    - Create Sentry project
    - Install Sentry SDK in backend and frontend
    - Configure Sentry DSN in environment variables
    - Test error reporting (trigger test error)
    - Set up Sentry alerts for critical errors
    - _Requirements: 14.7, 23.1, 23.4_

  - [ ] 27.6 Configure logging with Winston
    - Install Winston logger in backend
    - Configure log levels (debug, info, warn, error)
    - Log to console in development, to files/service in production
    - Implement request logging middleware with morgan
    - _Requirements: 23.1_

  - [ ] 27.7 Set up monitoring dashboards
    - Create health check endpoint (GET /health)
    - Monitor API response times, error rates, database connections
    - Set up uptime monitoring (Pingdom, UptimeRobot)
    - Configure alerts for downtime, high error rates, slow responses
    - _Requirements: 23.4, 23.5, 23.6_

  - [ ] 27.8 Implement database backup strategy
    - Configure automated daily backups (2 AM)
    - Upload backups to S3 with retention policy (30 days)
    - Test backup restoration process
    - Document backup and recovery procedures
    - _Requirements: 23.7_

  - [ ] 27.9 Set up CI/CD pipeline with GitHub Actions
    - Create GitHub Actions workflow for automated testing
    - Run linter, unit tests, integration tests on every push
    - Automatically deploy to staging on push to staging branch
    - Manually deploy to production from main branch
    - _Requirements: 25.6_

  - [ ] 27.10 Create deployment runbook and documentation
    - Document deployment process step-by-step
    - Document rollback procedures
    - Document environment variables and configuration
    - Document troubleshooting common issues
    - _Requirements: 23.2, 23.3_

- [ ] 28. Launch and post-launch monitoring
  - [ ] 28.1 Conduct soft launch with beta users
    - Invite 10-20 beta testers
    - Collect feedback on usability, bugs, performance
    - Monitor error rates and performance metrics
    - Fix critical issues before full launch
    - _Requirements: 25.7_

  - [ ] 28.2 Monitor error rates and performance
    - Check Sentry for error reports hourly in first 48 hours
    - Monitor API response times and database performance
    - Monitor user registration and authentication success rates
    - Track assessment completion rates
    - _Requirements: 23.4, 23.5, 23.6_

  - [ ] 28.3 Fix critical bugs and performance issues
    - Prioritize bugs by severity and user impact
    - Deploy hotfixes for critical issues
    - Communicate issues and fixes to users
    - _Requirements: 25.8_

  - [ ] 28.4 Full production launch
    - Announce launch via email, social media, website
    - Monitor user onboarding and retention
    - Provide customer support for user questions
    - _Requirements: 25.7_

- [ ] 29. Checkpoint - Production deployment complete
  - Verify all systems operational in production
  - Confirm monitoring and alerting working
  - Ensure backup strategy tested and functional
  - Ask user if questions arise

## Notes

- **Tasks marked with `*` are optional** and can be skipped for faster MVP delivery. These are primarily testing tasks.
- **Each task references specific requirements** from the requirements document for traceability.
- **Checkpoints ensure incremental validation** at the end of each major phase.
- **The implementation uses TypeScript** for both frontend (React + TypeScript) and backend (Node.js + TypeScript + Express).
- **Testing tasks are marked optional** to allow focus on core implementation, but comprehensive testing is strongly recommended before production launch.
- **Security and performance tasks are critical** and should not be skipped.
- **The design document provides complete technical specifications** including database schemas, API endpoints, component structures, and deployment architecture.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "1.6", "1.7"] },
    { "id": 3, "tasks": ["1.8", "2.1", "2.2"] },
    { "id": 4, "tasks": ["2.3", "2.4", "2.5", "2.6"] },
    { "id": 5, "tasks": ["2.7", "3.1", "3.2", "3.3", "3.4"] },
    { "id": 6, "tasks": ["3.5", "3.6"] },
    { "id": 7, "tasks": ["5.1"] },
    { "id": 8, "tasks": ["5.2", "5.3", "5.4"] },
    { "id": 9, "tasks": ["5.5", "6.1"] },
    { "id": 10, "tasks": ["6.2", "6.3"] },
    { "id": 11, "tasks": ["6.4", "6.5", "6.6"] },
    { "id": 12, "tasks": ["6.7", "7.1"] },
    { "id": 13, "tasks": ["7.2", "7.3", "7.4", "7.5"] },
    { "id": 14, "tasks": ["7.6", "8.1"] },
    { "id": 15, "tasks": ["8.2"] },
    { "id": 16, "tasks": ["8.3", "8.4"] },
    { "id": 17, "tasks": ["8.5", "8.6"] },
    { "id": 18, "tasks": ["9.1", "9.2"] },
    { "id": 19, "tasks": ["9.3", "9.4", "9.5"] },
    { "id": 20, "tasks": ["9.6", "11.1"] },
    { "id": 21, "tasks": ["11.2", "11.3", "11.4"] },
    { "id": 22, "tasks": ["11.5", "11.6"] },
    { "id": 23, "tasks": ["12.1", "12.2"] },
    { "id": 24, "tasks": ["12.3", "12.4", "12.5", "12.6"] },
    { "id": 25, "tasks": ["13.1", "13.2", "13.3", "13.4"] },
    { "id": 26, "tasks": ["13.5", "15.1"] },
    { "id": 27, "tasks": ["15.2", "15.3"] },
    { "id": 28, "tasks": ["15.4", "15.5", "15.6"] },
    { "id": 29, "tasks": ["16.1"] },
    { "id": 30, "tasks": ["16.2", "16.3", "16.4"] },
    { "id": 31, "tasks": ["16.5", "16.6"] },
    { "id": 32, "tasks": ["16.7", "16.8"] },
    { "id": 33, "tasks": ["16.9", "18.1"] },
    { "id": 34, "tasks": ["18.2", "18.3", "18.4"] },
    { "id": 35, "tasks": ["18.5", "18.6", "18.7", "18.8"] },
    { "id": 36, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 37, "tasks": ["19.4", "19.5", "19.6"] },
    { "id": 38, "tasks": ["19.7", "19.8"] },
    { "id": 39, "tasks": ["19.9", "21.1", "21.2", "21.3"] },
    { "id": 40, "tasks": ["21.4", "21.5", "21.6", "21.7", "21.8"] },
    { "id": 41, "tasks": ["21.9", "22.1", "22.2"] },
    { "id": 42, "tasks": ["22.3", "22.4", "22.5", "22.6", "22.7"] },
    { "id": 43, "tasks": ["22.8", "22.9", "22.10"] },
    { "id": 44, "tasks": ["24.1", "24.2", "24.3"] },
    { "id": 45, "tasks": ["24.4", "24.5", "24.6"] },
    { "id": 46, "tasks": ["25.1"] },
    { "id": 47, "tasks": ["25.2", "25.3", "25.4"] },
    { "id": 48, "tasks": ["25.5", "25.6"] },
    { "id": 49, "tasks": ["27.1", "27.2"] },
    { "id": 50, "tasks": ["27.3"] },
    { "id": 51, "tasks": ["27.4", "27.5", "27.6", "27.7"] },
    { "id": 52, "tasks": ["27.8", "27.9", "27.10"] },
    { "id": 53, "tasks": ["28.1"] },
    { "id": 54, "tasks": ["28.2", "28.3"] },
    { "id": 55, "tasks": ["28.4"] }
  ]
}
```
