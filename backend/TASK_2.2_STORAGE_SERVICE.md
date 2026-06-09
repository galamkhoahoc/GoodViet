# Task 2.2: Cloud Storage Service Implementation

## Overview

This task implements a storage service abstraction layer for audio file management. The current implementation uses **MongoDB GridFS** as the storage backend, with an architecture that allows easy migration to AWS S3 or Google Cloud Storage in the future.

## Implementation Status

**Status**: ✅ Completed (with limitations)

**Storage Backend**: MongoDB GridFS

**Decision**: User opted to continue using GridFS instead of migrating to AWS S3 or GCS at this time.

## What Was Implemented

### 1. Storage Service Abstraction Layer (`storage.service.ts`)

A complete service layer that provides:

- ✅ **Upload**: Store audio files with metadata
- ✅ **Download**: Retrieve audio files as buffers
- ✅ **Delete**: Remove audio files from storage
- ✅ **Stream**: Stream files for playback
- ✅ **Metadata**: Get file information
- ✅ **Validation**: Check file format and size
- ⚠️ **Temporary URLs**: Generate access URLs (limited with GridFS)

### 2. Updated Audio Controller

The audio controller now uses the storage service abstraction:

- Upload endpoint with 50MB file size limit (per requirements)
- Stream endpoint for audio playback
- Delete endpoint for file removal
- New temporary URL generation endpoint (`GET /api/audio/url/:recordingId`)
- Validation for WAV, WEBM, MP3 formats

### 3. CORS Configuration

CORS is already configured in `app.ts` with:
- Origin: Configurable via `CORS_ORIGIN` env variable
- Methods: GET, POST, PUT, PATCH, DELETE
- Headers: Content-Type, Authorization
- Credentials: Enabled

### 4. Unit Tests

Created comprehensive unit tests for the storage service:
- File format validation
- File size validation
- Temporary URL generation
- Storage type detection

## Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| 12.1 - Store files with unique ID | ✅ Complete | GridFS generates ObjectIds |
| 12.2 - Associate with user/type | ✅ Complete | Metadata stored with uploads |
| 12.3 - Store metadata | ✅ Complete | Duration, format, timestamp, size |
| 12.4 - Temporary URLs (3600s) | ⚠️ Partial | URLs generated but don't truly expire |
| 12.5 - Validate ownership | 🔄 Pending | TODO in controller |
| 12.6 - Return 403 for unauthorized | 🔄 Pending | Depends on 12.5 |
| 12.7 - Retrieve by phase | ✅ Complete | Query support exists |
| 12.8 - Retrieve by date range | ✅ Complete | Index on uploadedAt |
| 12.9 - Compress files | ⚠️ Partial | Format validation only |
| 12.10 - Retain indefinitely | ✅ Complete | No auto-deletion |

### Legend
- ✅ Complete - Fully implemented
- ⚠️ Partial - Implemented with limitations
- 🔄 Pending - Not yet implemented
- ❌ Not Met - Cannot be met with current technology

## Key Limitations with GridFS

### 1. Presigned URLs (Requirement 12.4)

**Issue**: GridFS does not support true expiring URLs like S3/GCS presigned URLs.

**Current Implementation**: 
- Service generates URLs with expiration metadata
- Frontend should respect the `expiresAt` timestamp
- Backend does NOT enforce expiration (security gap)

**Recommendation**: Migrate to S3/GCS for production to get true presigned URL security.

### 2. CORS for Direct Upload

**Issue**: GridFS requires uploads to go through the backend API. S3/GCS support direct frontend uploads with presigned POST URLs.

**Current Implementation**: All uploads go through `/api/audio/upload` endpoint.

**Impact**: Increased backend load and latency for large file uploads.

### 3. File Compression (Requirement 12.9)

**Status**: Audio files are stored in their original format without additional compression.

**Recommendation**: Implement audio transcoding service to convert to optimized formats (e.g., Opus codec in WebM).

## API Endpoints

### Upload Audio File
```http
POST /api/audio/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Field: audio (file)
Field: assessmentId (optional)
Field: practiceSessionId (optional)
Field: phase (optional)
Field: sentenceId (optional)
Field: exerciseId (optional)
```

### Generate Temporary URL
```http
GET /api/audio/url/:recordingId?expiresIn=3600
Authorization: Bearer <token>

Response:
{
  "success": true,
  "url": "http://localhost:3000/api/audio/stream/507f1f77bcf86cd799439011",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "expiresIn": 3600,
  "warning": "URL expiration not enforced with current storage (GridFS)"
}
```

### Stream Audio File
```http
GET /api/audio/stream/:fileId

Response: Audio stream with appropriate headers
```

### Delete Audio Recording
```http
DELETE /api/audio/:recordingId
Authorization: Bearer <token>
```

## File Validation

### Accepted Formats
- `audio/wav`, `audio/wave`, `audio/x-wav`
- `audio/webm`
- `audio/mpeg`, `audio/mp3`

### Size Limits
- **Maximum**: 50 MB (per Requirement 11.6)
- **Minimum**: > 0 bytes

## Migration Path to S3/GCS

When ready to migrate to AWS S3 or Google Cloud Storage:

### 1. Install SDK
```bash
# For AWS S3
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# For GCS
npm install @google-cloud/storage
```

### 2. Update Environment Variables
```env
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=goodviet-audio

# Or GCS
GCS_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=goodviet-audio
GCS_KEYFILE_PATH=./gcs-credentials.json
```

### 3. Update `storage.service.ts`

The service is designed to be storage-agnostic. You'll need to:

1. Check `env.AWS_REGION` or `env.GCS_PROJECT_ID` to determine storage type
2. Implement S3/GCS upload, download, delete methods
3. Update `generateTemporaryUrl()` to use presigned URLs
4. Update `getStorageType()` to return 's3' or 'gcs'
5. Update `supportsPresignedUrls()` to return true

### 4. Data Migration Script

Create a migration script to move existing GridFS files to S3/GCS:

```typescript
// Pseudo-code
for (const recording of allRecordings) {
  const fileId = recording.fileUrl.split('://')[1];
  const buffer = await downloadFromGridFS(fileId);
  const s3Key = await uploadToS3(buffer, metadata);
  recording.fileUrl = `s3://${s3Key}`;
  await recording.save();
  await deleteFromGridFS(fileId);
}
```

## Testing

### Run Unit Tests
```bash
cd backend
npm test -- storage.service.test.ts
```

### Manual Testing

1. **Upload Audio File**:
```bash
curl -X POST http://localhost:3000/api/audio/upload \
  -H "Authorization: Bearer <token>" \
  -F "audio=@test-audio.wav" \
  -F "phase=phase_1" \
  -F "sentenceId=sent_001"
```

2. **Generate Temporary URL**:
```bash
curl -X GET "http://localhost:3000/api/audio/url/<recordingId>?expiresIn=3600" \
  -H "Authorization: Bearer <token>"
```

3. **Stream Audio**:
```bash
curl -X GET http://localhost:3000/api/audio/stream/<fileId> --output audio.wav
```

4. **Delete Recording**:
```bash
curl -X DELETE http://localhost:3000/api/audio/<recordingId> \
  -H "Authorization: Bearer <token>"
```

## Environment Configuration

No changes needed to `.env` for GridFS. When migrating to S3/GCS, uncomment and configure:

```env
# AWS S3 (Uncomment when ready)
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# S3_BUCKET_NAME=goodviet-audio
```

## Security Considerations

### Current Setup (GridFS)
- ✅ Authentication required for uploads and deletes
- ✅ File type and size validation
- ⚠️ URLs do not expire (security gap)
- ⚠️ Ownership validation pending

### Recommended for Production (S3/GCS)
- ✅ All of the above
- ✅ True expiring presigned URLs
- ✅ Bucket-level access policies
- ✅ Encryption at rest
- ✅ Encryption in transit (TLS)

## Performance Considerations

### GridFS Performance
- **Pros**: Simple, integrated with MongoDB, good for < 1000 files
- **Cons**: Not optimized for large-scale file storage, adds load to database

### S3/GCS Performance
- **Pros**: CDN integration, global distribution, optimized for file storage
- **Cons**: Additional service dependency, requires network calls

## Conclusion

Task 2.2 is **functionally complete** with the following caveats:

1. ✅ Storage service abstraction layer created
2. ✅ Upload, download, delete, stream operations working
3. ✅ CORS configured
4. ✅ File validation (format and size)
5. ⚠️ Temporary URLs generate but don't enforce expiration
6. 🔄 Ownership validation needs implementation
7. 🔄 File compression not implemented

**Production Readiness**: The system is functional for development and MVP testing. For production deployment with full security requirements, migration to AWS S3 or Google Cloud Storage is **strongly recommended**.

## Next Steps

1. **Immediate** (If continuing with GridFS):
   - Implement ownership validation in audio controller
   - Add endpoint to enforce URL expiration checking

2. **Short-term** (Before production):
   - Migrate to AWS S3 or GCS for presigned URL support
   - Implement audio file compression/transcoding
   - Add CDN for global delivery

3. **Long-term**:
   - Implement direct frontend uploads to S3/GCS
   - Add file versioning and backup policies
   - Implement analytics on file usage
