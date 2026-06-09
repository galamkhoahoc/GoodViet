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
MONGODB_URI=mongodb+srv://galamkhoahoctr_db_user:4VQsfyNTe6I3w4E3@glkh2.wtvyhjt.mongodb.net/goodviet?retryWrites=true&w=majority

# Server
PORT=3000
NODE_ENV=development

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=goodviet-super-secret-jwt-key-change-in-production-2024

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Development

```bash
# Run in development mode with hot reload
npm run dev
```

Server will start on `http://localhost:3000`

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

## Next Steps

1. ✅ User authentication implemented
2. ⏳ Implement Assessment endpoints
3. ⏳ Implement Practice system endpoints
4. ⏳ Implement Chat endpoints (Gemma 4)
5. ⏳ Implement Expert system endpoints
6. ⏳ Add file upload for audio recordings (AWS S3)

## License

ISC
