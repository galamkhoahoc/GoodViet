# GOODVIET Backend API

Backend API for GOODVIET - Vietnamese Speech Therapy Platform

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT + bcrypt

## Prerequisites

- Node.js 20+ installed
- MongoDB Atlas account with connection string

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the backend root directory:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority

# Server
PORT=3000
NODE_ENV=development
# Public backend origin used in signed GridFS playback URLs
API_BASE_URL=http://localhost:3000

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=replace-with-at-least-32-random-characters

# CORS
CORS_ORIGIN=http://localhost:5173

# AI Service Configuration
AI_SERVICE=gemma4  # Options: gemma4, ollama, gemini
GEMMA4_HOST=http://localhost:5000
GEMMA4_TIMEOUT=30000
GEMINI_API_KEY=your-gemini-api-key
```

See **AI Service Configuration** section below for details.

## Development

```bash
# Run in development mode with hot reload
npm run dev
```

Server will start on `http://localhost:3000`

## AI Service Configuration

GoodViet uses an AI Service Orchestrator that supports multiple AI backends with automatic fallback.

### Supported AI Providers

| Provider | Description | Use Case | Requirements |
|----------|-------------|----------|--------------|
| **Gemma 4** | Latest Google Gemma 4 models via Python bridge | Best quality, thinking mode, audio analysis | Python service running |
| **Ollama** | Local Gemma 2B via Ollama | Good quality, fully local | Ollama installed |
| **Gemini** | Google Gemini API | Fallback option | API key |

### Configuration

Set the `AI_SERVICE` environment variable:

```env
# Choose primary AI service
AI_SERVICE=gemma4  # Options: gemma4, ollama, gemini

# Leave empty for auto-detect (tries Gemma4 → Ollama → Gemini)
# AI_SERVICE=
```

### Gemma 4 Setup (Recommended)

Gemma 4 provides the best quality with thinking mode and multi-modal capabilities.

**1. Navigate to Python service:**
```bash
cd backend/python-ai-service
```

**2. Install dependencies:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
```

**3. Configure environment:**
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/macOS
```

**4. Start Python service:**
```bash
python app.py
```

Service will run on `http://localhost:5000`

**5. Configure Node.js backend:**
```env
AI_SERVICE=gemma4
GEMMA4_HOST=http://localhost:5000
GEMMA4_TIMEOUT=30000
```

See [`python-ai-service/README.md`](./python-ai-service/README.md) for detailed setup instructions.

### Ollama Setup (Alternative)

For local inference without Python:

**1. Install Ollama:**
- Download from [ollama.ai](https://ollama.ai)

**2. Pull Gemma model:**
```bash
ollama pull gemma:2b
```

**3. Configure backend:**
```env
AI_SERVICE=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma:2b
```

### Gemini Setup (Fallback)

For cloud-based inference:

**1. Get API key:**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)

**2. Configure backend:**
```env
AI_SERVICE=gemini
GEMINI_API_KEY=your-api-key-here
```

### Fallback Chain

The AI Service Orchestrator automatically falls back to other providers if the primary fails:

1. **Gemma 4** (if configured) → 
2. **Ollama** (if running) → 
3. **Gemini** (if API key available)

This ensures high availability even if one service is down.

### Testing AI Service

**Check AI service status:**
```bash
curl http://localhost:3000/api/ai/status
```

**Test chat endpoint:**
```bash
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Xin chào!"}'
```

### Troubleshooting

**Problem**: "Cannot connect to Gemma4 service"
- **Solution**: Ensure Python service is running on port 5000
- Check: `curl http://localhost:5000/health`

**Problem**: "All AI services unavailable"
- **Solution**: At least one AI service must be configured
- Check logs for specific error messages

**Problem**: Slow response times
- **Solution**: Use Gemma 4 with GPU, or switch to Ollama/Gemini

## Build

```bash
# Build TypeScript to JavaScript
npm run build

# Run production build
npm start
```

## API Endpoints

### Authentication

#### POST /api/users/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/users/login
Login a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "assessmentCompleted": false,
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/users/logout
Logout a user (client-side token removal).

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

### User Profile

#### GET /api/users/profile
Get current user's profile. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "assessmentCompleted": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH /api/users/profile
Update current user's profile. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "targetGoals": "Cải thiện phát âm L/N"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn B",
    "phoneNumber": "0987654321",
    "targetGoals": "Cải thiện phát âm L/N",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Health Check

#### GET /health
Check API health status.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Login**: 5 attempts per 15 minutes per email
- **Registration**: 3 attempts per hour per IP

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message in Vietnamese",
  "details": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # MongoDB connection
│   │   └── env.ts           # Environment validation
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/
│   │   └── User.ts          # Mongoose User model
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   ├── services/
│   │   └── auth.service.ts
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Provision managed accounts

Account passwords must not be committed. Copy `accounts.example.json`, provide
each referenced password environment variable (or add a `password` field only
in an ignored `accounts.local*.json` file), then run:

```bash
npm run accounts:provision -- accounts.local.json
```

The command is idempotent: it creates missing accounts and refreshes the
password and account metadata for existing ones. Temporary accounts are reset
during provisioning and on every login/logout.

Temporary-account write fencing uses MongoDB transactions, so the deployment
must use MongoDB Atlas or another replica-set/sharded MongoDB topology. GridFS
playback URLs are file-scoped, signed, and expire; raw GridFS IDs are not public.
Set `API_BASE_URL` to the externally reachable HTTP(S) origin in staging and
production; production requires HTTPS. Signed-URL JSON responses and audio
objects are served with private, no-store caching.

When S3 storage is enabled, its IAM policy must allow `s3:ListBucket`,
`s3:ListBucketVersions`, `s3:DeleteObject`, and `s3:DeleteObjectVersion` in
addition to the upload/read permissions. Temporary-account reset permanently
removes current objects, all historical versions, and delete markers below the
account's `audio/<userId>/` prefix.

## Next Steps

1. ✅ User authentication implemented
2. ⏳ Implement Assessment endpoints
3. ⏳ Implement Practice system endpoints
4. ⏳ Implement Chat endpoints (Gemma 4)
5. ⏳ Implement Expert system endpoints
6. ⏳ Add file upload for audio recordings (AWS S3)

## License

ISC
