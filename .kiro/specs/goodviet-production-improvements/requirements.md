# Requirements Document

## Introduction

This document specifies the requirements for transforming the GOODVIET web application from a UI/UX prototype with mock data into a production-ready Vietnamese speech therapy platform. GOODVIET serves working adults aged 25-45 who need speech therapy to improve their pronunciation of Vietnamese phonemes (L/N, TR/CH, S/X). The system provides AI-powered voice screening, personalized practice pathways, daily engagement through a chatbot companion, and optional expert consultations.

The production improvements address critical gaps in functionality, security, and data management while maintaining the existing Positivus design system and user experience.

## Glossary

- **GOODVIET_System**: The complete web application including frontend, backend, AI services, and data storage
- **Assessment_Module**: The three-phase voice screening system (Phase I: 12 sentences, Phase II: error confirmation, Phase III: storytelling)
- **Audio_Recorder**: The browser-based audio capture system using MediaRecorder API
- **AI_Analyzer**: The AI-powered pronunciation analysis engine that detects Vietnamese phoneme errors
- **Gemma_Chatbot**: The AI-powered companion chatbot using Gemma 4 model for user motivation and guidance
- **Backend_API**: The server-side REST API handling authentication, data storage, and business logic
- **Auth_Service**: The authentication and authorization service using JWT tokens
- **Practice_Pathway**: A structured 1-1.5 month program of daily exercises targeting specific pronunciation issues
- **Expert_System**: The platform for connecting users with licensed speech therapy experts for 1:1 sessions
- **User**: A registered adult (25-45 years old) with speech therapy needs
- **Expert**: A licensed speech therapy professional providing 1:1 consultations
- **IndexedDB_Store**: Browser-based offline storage for audio recordings
- **Cloud_Storage**: Server-side persistent storage for user data and audio files
- **Assessment_Result**: The output of the three-phase screening including detected errors and recommended pathway
- **Phoneme_Error**: A specific Vietnamese pronunciation issue (L/N confusion, TR/CH confusion, S/X confusion)
- **Daily_Checkin**: The end-of-day completion ritual where users mark practice as complete
- **Streak**: Consecutive days of completed practice tracked by the system

## Requirements

### Requirement 1: Real Audio Recording System

**User Story:** As a user, I want to record my voice using my device's microphone, so that the system can analyze my pronunciation accurately.

#### Acceptance Criteria

1. WHEN a user clicks the record button, THE Audio_Recorder SHALL request microphone permission from the browser
2. IF microphone permission is denied, THEN THE Audio_Recorder SHALL display an error message explaining how to enable microphone access
3. WHILE the user is recording, THE Audio_Recorder SHALL display a visual waveform animation and elapsed time counter
4. WHEN a user clicks the stop button during recording, THE Audio_Recorder SHALL save the audio as a WAV or WebM file format
5. THE Audio_Recorder SHALL capture audio at a minimum sample rate of 16000 Hz and bit depth of 16 bits
6. WHEN a recording is completed, THE Audio_Recorder SHALL allow the user to play back the recording before submission
7. THE Audio_Recorder SHALL limit individual recordings to a maximum duration of 300 seconds
8. IF a recording exceeds 300 seconds, THEN THE Audio_Recorder SHALL automatically stop recording and notify the user
9. WHEN a recording is saved, THE Audio_Recorder SHALL store it temporarily in IndexedDB_Store before upload
10. THE Audio_Recorder SHALL display remaining storage space when available storage is below 50 MB

### Requirement 2: Assessment Phase I Recording

**User Story:** As a user, I want to record 12 predefined sentences during Phase I assessment, so that the system can detect my basic pronunciation errors.

#### Acceptance Criteria

1. WHEN Phase I begins, THE Assessment_Module SHALL present 12 sentences one at a time in sequential order
2. FOR each sentence, THE Assessment_Module SHALL display the sentence text clearly before recording begins
3. WHEN a user completes recording a sentence, THE Assessment_Module SHALL save the audio with a unique identifier linking it to the specific sentence
4. THE Assessment_Module SHALL allow users to navigate between sentences using previous and next buttons
5. WHILE recording is in progress for a sentence, THE Assessment_Module SHALL disable navigation buttons
6. THE Assessment_Module SHALL display a progress indicator showing how many sentences have been recorded out of 12
7. WHEN all 12 sentences are recorded, THE Assessment_Module SHALL enable the "Complete Phase I" button
8. IF a user attempts to proceed to Phase II without recording all 12 sentences, THEN THE Assessment_Module SHALL prevent progression and display a warning message

### Requirement 3: Assessment Phase II Dynamic Error Confirmation

**User Story:** As a user, I want to re-record sentences that had detected errors plus additional verification sentences, so that the system can confirm my specific pronunciation issues.

#### Acceptance Criteria

1. WHEN Phase I analysis is complete, THE AI_Analyzer SHALL identify which sentences contained pronunciation errors
2. THE Assessment_Module SHALL generate a Phase II sentence list containing all incorrectly pronounced sentences from Phase I
3. WHEN specific error types are detected in Phase I, THE Assessment_Module SHALL add 3 to 5 additional sentences targeting those error types to Phase II
4. THE Assessment_Module SHALL present Phase II sentences in the same recording interface as Phase I
5. IF a user pronounces previously flagged sentences correctly in Phase II, THEN THE AI_Analyzer SHALL require the user to restart the assessment from Phase I
6. WHEN a user completes Phase II recordings, THE Assessment_Module SHALL submit all Phase II audio files to the AI_Analyzer
7. THE Assessment_Module SHALL display which sentences are re-recordings from Phase I and which are new verification sentences

### Requirement 4: Assessment Phase III Storytelling

**User Story:** As a user, I want to record a 2-3 minute story about my daily life, so that the system can assess my natural speech patterns, confidence, and pronunciation in context.

#### Acceptance Criteria

1. WHEN Phase III begins, THE Assessment_Module SHALL display a primary storytelling prompt asking about the user's daily routine
2. THE Assessment_Module SHALL display 4 to 6 follow-up questions to encourage longer storytelling
3. THE Audio_Recorder SHALL allow continuous recording for a minimum of 120 seconds and maximum of 300 seconds during Phase III
4. IF a user stops recording before 120 seconds, THEN THE Assessment_Module SHALL display a message requesting a longer response
5. WHEN Phase III recording is complete, THE Assessment_Module SHALL submit the audio to the AI_Analyzer for comprehensive analysis
6. THE Assessment_Module SHALL analyze breath control, tone variation, confidence level, and pronunciation errors in the Phase III recording

### Requirement 5: AI Pronunciation Analysis Engine

**User Story:** As a user, I want AI to analyze my recorded speech and detect Vietnamese pronunciation errors, so that I receive accurate feedback on my speech issues.

#### Acceptance Criteria

1. WHEN audio files are submitted, THE AI_Analyzer SHALL process recordings within 180 seconds
2. THE AI_Analyzer SHALL detect L/N phoneme confusion with a minimum accuracy of 85 percent
3. THE AI_Analyzer SHALL detect TR/CH phoneme confusion with a minimum accuracy of 85 percent
4. THE AI_Analyzer SHALL detect S/X phoneme confusion with a minimum accuracy of 85 percent
5. FOR each detected error, THE AI_Analyzer SHALL provide the timestamp location within the audio recording
6. THE AI_Analyzer SHALL classify each detected error as mild, moderate, or severe based on frequency and impact
7. THE AI_Analyzer SHALL calculate an overall pronunciation clarity score from 0 to 100
8. THE AI_Analyzer SHALL calculate a fluency score from 0 to 100 based on speech rate and hesitation patterns
9. THE AI_Analyzer SHALL measure speech rate in words per minute
10. THE AI_Analyzer SHALL determine confidence level as low, medium, or high based on voice stability and hesitation
11. WHEN analysis is complete, THE AI_Analyzer SHALL generate an Assessment_Result containing all detected errors and scores
12. THE AI_Analyzer SHALL ignore regional accent differences between Northern, Central, and Southern Vietnamese dialects when detecting errors

### Requirement 6: Assessment Results Display

**User Story:** As a user, I want to view my assessment results with detected errors and recommended pathway, so that I understand my speech issues and know what to practice.

#### Acceptance Criteria

1. WHEN assessment processing is complete, THE Assessment_Module SHALL display the overall pronunciation score prominently
2. THE Assessment_Module SHALL display a breakdown showing clarity score, fluency score, speech rate, and confidence level
3. FOR each detected Phoneme_Error, THE Assessment_Module SHALL display the phoneme pair, description, and severity badge
4. THE Assessment_Module SHALL recommend a specific Practice_Pathway based on the most severe detected errors
5. THE Assessment_Module SHALL display the recommended pathway name, duration, and targeted phoneme errors
6. THE Assessment_Module SHALL provide a button to begin the recommended Practice_Pathway immediately
7. THE Assessment_Module SHALL save the Assessment_Result permanently to the user's profile
8. THE Assessment_Module SHALL mark the user account as having completed the assessment to prevent retakes

### Requirement 7: One-Time Assessment Enforcement

**User Story:** As a user, I want the assessment to be taken only once per account, so that the system maintains consistent baseline data for my speech therapy journey.

#### Acceptance Criteria

1. WHEN a user account is created, THE GOODVIET_System SHALL mark the assessment as not completed
2. IF a user attempts to access the assessment page after completing it, THEN THE Assessment_Module SHALL display a message stating the assessment is complete
3. THE Assessment_Module SHALL provide a button to view past Assessment_Result on the blocked assessment page
4. THE GOODVIET_System SHALL store the assessment completion status persistently in the Backend_API database
5. THE Assessment_Module SHALL allow users to view their original Assessment_Result at any time through their profile

### Requirement 8: Gemma 4 Chatbot Integration

**User Story:** As a user, I want to chat with an AI companion that motivates me and answers my speech therapy questions, so that I stay engaged with my practice routine.

#### Acceptance Criteria

1. THE Gemma_Chatbot SHALL use the Gemma 4 language model for generating responses
2. WHEN a user sends a message, THE Gemma_Chatbot SHALL respond within 3 seconds
3. THE Gemma_Chatbot SHALL maintain conversation context for the current chat session
4. THE Gemma_Chatbot SHALL access the user's practice progress data to provide personalized encouragement
5. THE Gemma_Chatbot SHALL answer questions about Vietnamese pronunciation techniques
6. THE Gemma_Chatbot SHALL provide daily check-in messages asking about practice completion and user mood
7. WHEN a user has not practiced for 24 hours, THE Gemma_Chatbot SHALL send a gentle reminder message
8. THE Gemma_Chatbot SHALL avoid providing medical diagnoses or advice beyond speech practice guidance
9. IF a user asks a question outside the domain of speech therapy, THEN THE Gemma_Chatbot SHALL politely redirect to speech-related topics
10. THE Gemma_Chatbot SHALL store all chat messages persistently in the Backend_API database

### Requirement 9: Backend API Authentication

**User Story:** As a user, I want secure account authentication, so that my personal data and recordings are protected.

#### Acceptance Criteria

1. WHEN a user registers, THE Auth_Service SHALL validate that the email address is in a valid format
2. THE Auth_Service SHALL reject registration if the email address already exists in the database
3. WHEN a user registers, THE Auth_Service SHALL hash the password using bcrypt with a minimum of 12 salt rounds
4. THE Auth_Service SHALL never store passwords in plaintext
5. WHEN a user logs in with valid credentials, THE Auth_Service SHALL generate a JWT token with an expiration time of 7 days
6. THE Auth_Service SHALL include the user ID, email, and token expiration in the JWT payload
7. THE Auth_Service SHALL sign JWT tokens using a secret key stored in environment variables
8. WHEN a user makes an API request, THE Backend_API SHALL validate the JWT token in the Authorization header
9. IF a JWT token is expired, THEN THE Backend_API SHALL return a 401 Unauthorized error
10. IF a JWT token signature is invalid, THEN THE Backend_API SHALL return a 401 Unauthorized error
11. WHEN a user logs out, THE GOODVIET_System SHALL invalidate the JWT token on the client side
12. THE Auth_Service SHALL implement rate limiting of 5 failed login attempts per email address within a 15 minute window
13. IF rate limit is exceeded, THEN THE Auth_Service SHALL temporarily block login attempts for that email address for 30 minutes

### Requirement 10: Backend API Endpoints for User Data

**User Story:** As a user, I want my profile information and practice progress saved securely on a server, so that I can access my data from any device.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a POST endpoint at /api/users/register for user registration
2. THE Backend_API SHALL provide a POST endpoint at /api/users/login for user authentication
3. THE Backend_API SHALL provide a GET endpoint at /api/users/profile for retrieving user profile data
4. THE Backend_API SHALL provide a PATCH endpoint at /api/users/profile for updating user profile data
5. THE Backend_API SHALL provide a GET endpoint at /api/assessments/result for retrieving the user's Assessment_Result
6. THE Backend_API SHALL provide a POST endpoint at /api/assessments/recordings for uploading assessment audio files
7. THE Backend_API SHALL provide a GET endpoint at /api/practice/progress for retrieving practice completion data
8. THE Backend_API SHALL provide a POST endpoint at /api/practice/checkin for recording Daily_Checkin events
9. THE Backend_API SHALL provide a GET endpoint at /api/chat/history for retrieving chat message history
10. THE Backend_API SHALL provide a POST endpoint at /api/chat/messages for sending new chat messages
11. FOR each endpoint requiring authentication, THE Backend_API SHALL validate the JWT token before processing the request
12. IF authentication fails for a protected endpoint, THEN THE Backend_API SHALL return a 401 Unauthorized response
13. THE Backend_API SHALL return appropriate HTTP status codes for success (200, 201) and errors (400, 401, 403, 404, 500)

### Requirement 11: Backend API Data Validation

**User Story:** As a developer, I want the API to validate all incoming data, so that invalid data does not corrupt the database.

#### Acceptance Criteria

1. WHEN the Backend_API receives a request, THE Backend_API SHALL validate all required fields are present
2. IF required fields are missing, THEN THE Backend_API SHALL return a 400 Bad Request error with a descriptive message
3. THE Backend_API SHALL validate email addresses match the RFC 5322 standard format
4. THE Backend_API SHALL validate passwords are at least 8 characters long and contain at least one letter and one number
5. THE Backend_API SHALL validate audio file uploads are in WAV or WebM format
6. THE Backend_API SHALL validate audio file uploads do not exceed 50 MB in size
7. THE Backend_API SHALL sanitize all text input to prevent SQL injection attacks
8. THE Backend_API SHALL sanitize all text input to prevent cross-site scripting (XSS) attacks
9. THE Backend_API SHALL validate date fields are in ISO 8601 format
10. IF validation fails, THEN THE Backend_API SHALL return specific error messages identifying which fields are invalid

### Requirement 12: Audio File Storage and Retrieval

**User Story:** As a user, I want my audio recordings stored securely and accessible for review, so that I can track my progress over time.

#### Acceptance Criteria

1. WHEN an audio file is uploaded, THE Backend_API SHALL store the file in Cloud_Storage with a unique identifier
2. THE Backend_API SHALL associate each audio file with the user ID and recording type (assessment or practice)
3. THE Backend_API SHALL store audio file metadata including duration, format, upload timestamp, and file size
4. THE Backend_API SHALL generate a secure temporary URL for accessing audio files that expires after 3600 seconds
5. WHEN a user requests an audio file, THE Backend_API SHALL validate the user owns the audio file before providing access
6. IF a user requests an audio file they do not own, THEN THE Backend_API SHALL return a 403 Forbidden error
7. THE Backend_API SHALL support retrieving audio files by assessment phase (Phase I, Phase II, Phase III)
8. THE Backend_API SHALL support retrieving practice audio files by date range
9. THE Backend_API SHALL compress audio files using efficient codecs before storage to minimize storage costs
10. THE Backend_API SHALL retain assessment audio files indefinitely while the user account is active

### Requirement 13: IndexedDB Offline Storage

**User Story:** As a user, I want my recordings temporarily saved locally if my internet connection is lost, so that I do not lose my progress.

#### Acceptance Criteria

1. WHEN a recording is completed, THE GOODVIET_System SHALL save the audio file to IndexedDB_Store immediately
2. THE GOODVIET_System SHALL store audio files in IndexedDB_Store with metadata including timestamp, sentence ID, and upload status
3. WHEN internet connectivity is available, THE GOODVIET_System SHALL automatically upload pending audio files from IndexedDB_Store to Cloud_Storage
4. THE GOODVIET_System SHALL mark audio files as uploaded in IndexedDB_Store after successful upload
5. THE GOODVIET_System SHALL delete successfully uploaded audio files from IndexedDB_Store after 7 days
6. IF IndexedDB_Store exceeds 200 MB, THEN THE GOODVIET_System SHALL delete the oldest successfully uploaded files first
7. THE GOODVIET_System SHALL display a notification when operating in offline mode with pending uploads
8. THE GOODVIET_System SHALL retry failed uploads up to 3 times with exponential backoff delays

### Requirement 14: Error Handling for API Failures

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to fix it.

#### Acceptance Criteria

1. WHEN an API request fails with a network error, THE GOODVIET_System SHALL display a message indicating loss of internet connectivity
2. WHEN an API request fails with a 500 Internal Server Error, THE GOODVIET_System SHALL display a generic error message and log the error details
3. WHEN an API request fails with a 400 Bad Request error, THE GOODVIET_System SHALL display the specific validation error messages from the API
4. WHEN an API request fails with a 401 Unauthorized error, THE GOODVIET_System SHALL redirect the user to the login page
5. WHEN an API request fails with a 403 Forbidden error, THE GOODVIET_System SHALL display a message indicating the user lacks permission
6. THE GOODVIET_System SHALL provide a retry button for failed requests that can be retried
7. THE GOODVIET_System SHALL log all errors to a client-side error tracking service for debugging
8. WHEN a file upload fails, THE GOODVIET_System SHALL preserve the file in IndexedDB_Store and allow manual retry
9. THE GOODVIET_System SHALL display user-friendly error messages in Vietnamese language
10. THE GOODVIET_System SHALL avoid displaying technical error details (stack traces, error codes) to end users

### Requirement 15: Loading States for Asynchronous Operations

**User Story:** As a user, I want to see loading indicators when the system is processing my request, so that I know the application is working and not frozen.

#### Acceptance Criteria

1. WHEN an API request is in progress, THE GOODVIET_System SHALL display a loading spinner or progress indicator
2. WHILE the Assessment_Module is processing audio files, THE GOODVIET_System SHALL display a progress animation with status text updates
3. THE GOODVIET_System SHALL disable action buttons while asynchronous operations are in progress to prevent duplicate requests
4. WHEN the Gemma_Chatbot is generating a response, THE GOODVIET_System SHALL display a typing indicator
5. WHEN audio files are uploading, THE GOODVIET_System SHALL display upload progress as a percentage
6. THE GOODVIET_System SHALL provide estimated time remaining for operations exceeding 5 seconds
7. IF an operation exceeds 30 seconds, THEN THE GOODVIET_System SHALL display a message indicating the operation is taking longer than expected
8. WHEN a loading state begins, THE GOODVIET_System SHALL announce it to screen readers for accessibility
9. WHEN a loading state completes, THE GOODVIET_System SHALL remove the loading indicator and restore interactive elements

### Requirement 16: Practice Pathway Data Management

**User Story:** As a user, I want my daily practice progress saved automatically, so that I can resume where I left off and track my improvement.

#### Acceptance Criteria

1. THE Backend_API SHALL store which Practice_Pathway is assigned to each user
2. THE Backend_API SHALL store completion status for each daily practice session
3. THE Backend_API SHALL store all practice audio recordings with date and exercise identifier
4. WHEN a user completes a daily practice session, THE GOODVIET_System SHALL save a Daily_Checkin record with timestamp
5. THE GOODVIET_System SHALL calculate the user's current Streak based on consecutive Daily_Checkin records
6. IF a user misses a day without completing practice, THEN THE GOODVIET_System SHALL reset the Streak to zero
7. THE GOODVIET_System SHALL display the current Streak prominently on the dashboard
8. THE GOODVIET_System SHALL allow users to view their practice calendar showing completed and missed days
9. THE GOODVIET_System SHALL track which week and day of the Practice_Pathway the user is currently on
10. THE GOODVIET_System SHALL prevent users from accessing future weeks' content until the current week is completed

### Requirement 17: Expert Connection System

**User Story:** As a user, I want to request a connection with a speech therapy expert for 1:1 sessions, so that I can receive personalized guidance.

#### Acceptance Criteria

1. THE GOODVIET_System SHALL provide a list of available Expert profiles with ratings, specializations, and availability
2. WHEN a user requests an expert connection, THE GOODVIET_System SHALL send the user's Assessment_Result and practice recordings to the Expert for review
3. THE Expert_System SHALL allow experts to review user data and accept or decline connection requests
4. WHEN an expert accepts a connection, THE GOODVIET_System SHALL notify the user via email and in-app notification
5. THE Expert_System SHALL provide a scheduling interface for booking 1:1 video sessions
6. THE GOODVIET_System SHALL track all 1:1 sessions with date, duration, and session type
7. AFTER each 1:1 session, THE GOODVIET_System SHALL request a rating from 1 to 5 stars from the user
8. THE GOODVIET_System SHALL calculate each expert's average rating based on all user ratings
9. IF an expert's average rating falls below 4.5 stars after at least 10 ratings, THEN THE GOODVIET_System SHALL flag the expert for quality review
10. THE GOODVIET_System SHALL display expert ratings prominently to help users choose qualified experts

### Requirement 18: Security for Sensitive Data

**User Story:** As a user, I want my personal information and audio recordings protected from unauthorized access, so that my privacy is maintained.

#### Acceptance Criteria

1. THE Backend_API SHALL encrypt all data in transit using TLS 1.3 or higher
2. THE Backend_API SHALL encrypt sensitive user data at rest in the database using AES-256 encryption
3. THE Backend_API SHALL never log or expose passwords, JWT tokens, or encryption keys
4. THE Backend_API SHALL implement CORS (Cross-Origin Resource Sharing) policies restricting requests to the official GOODVIET domain
5. THE Backend_API SHALL validate all file uploads for malicious content before storage
6. THE Backend_API SHALL implement Content Security Policy (CSP) headers to prevent XSS attacks
7. THE GOODVIET_System SHALL never transmit JWT tokens in URL query parameters
8. THE GOODVIET_System SHALL store JWT tokens in httpOnly cookies or secure storage mechanisms
9. THE Backend_API SHALL implement request size limits to prevent denial-of-service attacks
10. THE Backend_API SHALL log all authentication attempts (success and failure) for security auditing

### Requirement 19: Migration from localStorage to Backend

**User Story:** As a developer, I want to migrate existing users from localStorage to the Backend_API, so that current users do not lose their data during the upgrade.

#### Acceptance Criteria

1. WHEN a user logs in after the backend migration, THE GOODVIET_System SHALL check for existing data in localStorage
2. IF localStorage data is found, THEN THE GOODVIET_System SHALL upload the data to the Backend_API
3. THE GOODVIET_System SHALL migrate user profile information including name, email, and preferences
4. THE GOODVIET_System SHALL migrate assessment completion status and results
5. THE GOODVIET_System SHALL migrate chat history messages
6. THE GOODVIET_System SHALL migrate practice progress and Daily_Checkin records
7. AFTER successful migration, THE GOODVIET_System SHALL clear the localStorage data
8. IF migration fails, THEN THE GOODVIET_System SHALL preserve localStorage data and display a retry option
9. THE GOODVIET_System SHALL display a migration progress indicator during the data transfer
10. THE GOODVIET_System SHALL log migration events for tracking and debugging

### Requirement 20: Responsive Design for Mobile Devices

**User Story:** As a user, I want to use GOODVIET on my mobile phone, so that I can practice on the go.

#### Acceptance Criteria

1. THE GOODVIET_System SHALL render correctly on screen widths from 320 pixels to 1920 pixels
2. THE GOODVIET_System SHALL use touch-friendly button sizes with a minimum of 44 pixels by 44 pixels
3. THE GOODVIET_System SHALL support mobile browser microphone access for audio recording
4. THE GOODVIET_System SHALL optimize audio file uploads on mobile networks by compressing files before upload
5. THE GOODVIET_System SHALL adapt layout for portrait and landscape orientations
6. THE GOODVIET_System SHALL use responsive typography that remains readable on small screens
7. THE GOODVIET_System SHALL lazy-load images and videos to improve mobile performance
8. THE GOODVIET_System SHALL display navigation menus in a mobile-appropriate format (hamburger menu or bottom navigation)
9. THE GOODVIET_System SHALL test audio recording functionality on iOS Safari, Chrome Android, and Samsung Internet browsers

### Requirement 21: Performance Optimization

**User Story:** As a user, I want the application to load quickly and respond smoothly, so that I have a good experience.

#### Acceptance Criteria

1. THE GOODVIET_System SHALL load the initial page within 3 seconds on a 4G mobile connection
2. THE GOODVIET_System SHALL achieve a Lighthouse performance score of at least 85
3. THE GOODVIET_System SHALL implement code splitting to load only required JavaScript for each page
4. THE GOODVIET_System SHALL cache static assets (fonts, icons, images) in the browser for 7 days
5. THE GOODVIET_System SHALL use image compression to reduce image file sizes by at least 50 percent without visible quality loss
6. THE GOODVIET_System SHALL implement lazy loading for video tutorials to avoid loading them until playback starts
7. THE GOODVIET_System SHALL debounce search and filter inputs to prevent excessive API calls
8. THE GOODVIET_System SHALL implement pagination or virtual scrolling for lists exceeding 50 items
9. THE Backend_API SHALL respond to authenticated API requests within 500 milliseconds for the 95th percentile

### Requirement 22: Accessibility Compliance

**User Story:** As a user with disabilities, I want the application to be accessible with assistive technologies, so that I can use all features.

#### Acceptance Criteria

1. THE GOODVIET_System SHALL provide alt text for all informational images
2. THE GOODVIET_System SHALL ensure all interactive elements are keyboard navigable
3. THE GOODVIET_System SHALL provide visible focus indicators for all interactive elements
4. THE GOODVIET_System SHALL use semantic HTML elements (header, nav, main, button) for proper structure
5. THE GOODVIET_System SHALL provide ARIA labels for icon-only buttons
6. THE GOODVIET_System SHALL ensure text contrast meets WCAG 2.1 AA standards (4.5:1 for normal text)
7. THE GOODVIET_System SHALL announce dynamic content changes to screen readers using ARIA live regions
8. THE GOODVIET_System SHALL support browser zoom up to 200 percent without breaking layout
9. THE GOODVIET_System SHALL allow users to pause or stop audio playback

### Requirement 23: Logging and Monitoring

**User Story:** As a developer, I want comprehensive logging and error tracking, so that I can diagnose and fix issues quickly.

#### Acceptance Criteria

1. THE Backend_API SHALL log all API requests with timestamp, endpoint, user ID, and response status
2. THE Backend_API SHALL log all errors with stack traces and request context
3. THE GOODVIET_System SHALL integrate with a client-side error tracking service such as Sentry
4. THE GOODVIET_System SHALL capture and report JavaScript errors and unhandled promise rejections
5. THE Backend_API SHALL implement health check endpoints for monitoring service availability
6. THE Backend_API SHALL collect metrics on API response times and error rates
7. THE Backend_API SHALL alert developers when error rates exceed 5 percent of requests
8. THE Backend_API SHALL alert developers when API response time 95th percentile exceeds 1000 milliseconds
9. THE GOODVIET_System SHALL implement analytics tracking for key user actions (assessment completion, daily checkin, expert connection)
10. THE Backend_API SHALL store logs securely and retain them for at least 30 days

### Requirement 24: Environment Configuration Management

**User Story:** As a developer, I want separate configurations for development, staging, and production environments, so that I can test safely without affecting live users.

#### Acceptance Criteria

1. THE GOODVIET_System SHALL use environment variables for all configuration values
2. THE GOODVIET_System SHALL never commit API keys, database passwords, or JWT secrets to version control
3. THE GOODVIET_System SHALL provide a template environment file (.env.example) documenting all required variables
4. THE Backend_API SHALL support separate database connections for development, staging, and production environments
5. THE GOODVIET_System SHALL use different API endpoints for frontend in development versus production builds
6. THE GOODVIET_System SHALL disable debug logging in production environment
7. THE GOODVIET_System SHALL use feature flags to enable/disable new features independently of deployment
8. THE Backend_API SHALL validate all required environment variables are present at startup
9. IF required environment variables are missing, THEN THE Backend_API SHALL refuse to start and log an error

### Requirement 25: Automated Testing Foundation

**User Story:** As a developer, I want automated tests for critical functionality, so that regressions are caught before deployment.

#### Acceptance Criteria

1. THE GOODVIET_System SHALL include unit tests for authentication functions with at least 80 percent code coverage
2. THE GOODVIET_System SHALL include unit tests for data validation functions with at least 90 percent code coverage
3. THE GOODVIET_System SHALL include integration tests for all Backend_API endpoints
4. THE GOODVIET_System SHALL include end-to-end tests for the complete assessment flow
5. THE GOODVIET_System SHALL include end-to-end tests for user registration and login
6. THE GOODVIET_System SHALL run all tests automatically on every pull request
7. THE GOODVIET_System SHALL prevent merging code if tests fail
8. THE GOODVIET_System SHALL generate test coverage reports showing percentage coverage per file
9. THE GOODVIET_System SHALL test audio recording mock functionality in automated tests

## Notes

- **Assessment Phase Validation**: The three-phase assessment process must maintain strict validation to ensure data quality for AI analysis. Phase II's dynamic sentence generation based on Phase I errors is critical for accurate diagnosis.

- **AI Model Selection**: While Gemma 4 is specified for the chatbot, the pronunciation analysis engine may require a specialized model trained on Vietnamese phonetics. Consider Vietnamese-specific models or fine-tuning approaches.

- **Audio Format Compatibility**: Browser support for MediaRecorder API varies. The system should detect the best available format (prefer WebM Opus for quality and size, fall back to WAV for compatibility).

- **Expert Verification Workflow**: The requirement states AI + expert validation for assessment results, but the implementation details of expert review workflow are not specified here and may need additional requirements.

- **Regional Dialect Handling**: Requirement 5.12 specifies ignoring regional dialects, which is technically challenging. This may require a custom-trained model with dialect-normalized training data.

- **Data Privacy Compliance**: Consider GDPR, CCPA, or Vietnam's data protection laws depending on target markets. Additional requirements may be needed for consent management and data deletion.

- **Offline Functionality Scope**: While IndexedDB enables offline recording storage, other features (chatbot, assessment analysis, pathway content) require server connectivity and cannot function offline.

- **Payment Integration**: Expert connection system mentions "ăn theo phần trăm" (percentage-based payment) but payment processing requirements are not specified in this document.
