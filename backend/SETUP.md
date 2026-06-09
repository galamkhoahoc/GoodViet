# Backend Setup Guide

## ✅ Completed Steps

1. ✅ Backend project structure created
2. ✅ Dependencies installed (Express, Mongoose, bcrypt, JWT, TypeScript)
3. ✅ MongoDB Atlas connection configured
4. ✅ User model with Mongoose created
5. ✅ Authentication service implemented (register, login, JWT)
6. ✅ API controllers and routes created
7. ✅ Middleware implemented (auth, validation, rate limiting, error handling)

## 🔧 MongoDB Atlas Configuration Required

### Issue: Connection Timeout

The MongoDB Atlas connection is timing out. This is usually because:

**1. IP Address Not Whitelisted**
   - Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com
   - Navigate to: Network Access (left sidebar)
   - Click "Add IP Address"
   - Option A: Add your current IP address
   - Option B: Add `0.0.0.0/0` (allow from anywhere - for development only!)

**2. Incorrect Credentials**
   - Verify username: `galamkhoahoctr_db_user`
   - Verify password: `4VQsfyNTe6I3w4E3`
   - Check in MongoDB Atlas → Database Access

**3. Database User Permissions**
   - User needs "Read and write to any database" permission
   - Check in MongoDB Atlas → Database Access → Edit User

### How to Fix

1. **Open MongoDB Atlas Dashboard**
   ```
   https://cloud.mongodb.com
   ```

2. **Select your cluster** (`glkh2`)

3. **Whitelist IP Address:**
   - Click "Network Access" in left sidebar
   - Click "ADD IP ADDRESS"
   - Add `0.0.0.0/0` (all IPs) for now
   - Or add your specific IP address

4. **Verify Database User:**
   - Click "Database Access"
   - Find user `galamkhoahoctr_db_user`
   - Ensure role is "Atlas admin" or "Read and write to any database"

5. **Test Connection Again:**
   ```bash
   cd backend
   node test-connection.js
   ```

## 🚀 Starting the Backend Server

### Development Mode (with hot reload)

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:3000`

### Production Build

```bash
cd backend
npm run build
npm start
```

## 📝 Testing the API

### Using curl

**1. Health Check:**
```bash
curl http://localhost:3000/health
```

**2. Register User:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123456\",\"fullName\":\"Nguyen Van A\",\"phoneNumber\":\"0123456789\"}"
```

**3. Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123456\"}"
```

**4. Get Profile (with token):**
```bash
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman or Thunder Client (VS Code Extension)

**Import this collection:**

```json
{
  "name": "GOODVIET Backend API",
  "requests": [
    {
      "name": "Health Check",
      "method": "GET",
      "url": "http://localhost:3000/health"
    },
    {
      "name": "Register",
      "method": "POST",
      "url": "http://localhost:3000/api/users/register",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "email": "test@example.com",
        "password": "Test123456",
        "fullName": "Nguyen Van A",
        "phoneNumber": "0123456789"
      }
    },
    {
      "name": "Login",
      "method": "POST",
      "url": "http://localhost:3000/api/users/login",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "email": "test@example.com",
        "password": "Test123456"
      }
    },
    {
      "name": "Get Profile",
      "method": "GET",
      "url": "http://localhost:3000/api/users/profile",
      "headers": {
        "Authorization": "Bearer {{token}}"
      }
    }
  ]
}
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          ✅ MongoDB connection
│   │   └── env.ts               ✅ Environment validation
│   ├── controllers/
│   │   ├── auth.controller.ts   ✅ Register, Login, Logout
│   │   └── user.controller.ts   ✅ Get/Update Profile
│   ├── middleware/
│   │   ├── auth.middleware.ts   ✅ JWT verification
│   │   ├── error.middleware.ts  ✅ Error handling
│   │   ├── rateLimit.middleware.ts ✅ Rate limiting
│   │   └── validation.middleware.ts ✅ Zod validation
│   ├── models/
│   │   └── User.ts              ✅ Mongoose User model
│   ├── routes/
│   │   ├── auth.routes.ts       ✅ Auth endpoints
│   │   └── user.routes.ts       ✅ User endpoints
│   ├── services/
│   │   └── auth.service.ts      ✅ Auth business logic
│   ├── app.ts                   ✅ Express app setup
│   └── server.ts                ✅ Server entry point
├── .env                         ✅ Environment variables
├── .gitignore                   ✅ Git ignore rules
├── package.json                 ✅ Dependencies
├── tsconfig.json                ✅ TypeScript config
├── test-connection.js           ✅ MongoDB test script
└── README.md                    ✅ API documentation
```

## 🎯 Implemented Features (Phase 1)

### Authentication
- ✅ User registration with email validation
- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT token generation (7 days expiration)
- ✅ Login with credentials validation
- ✅ Logout endpoint
- ✅ Rate limiting (5 login attempts per 15min)

### User Profile
- ✅ Get user profile (authenticated)
- ✅ Update user profile (authenticated)
- ✅ Profile validation with Zod

### Security
- ✅ CORS configuration
- ✅ Rate limiting (global + endpoint-specific)
- ✅ Input validation and sanitization
- ✅ Error handling with Vietnamese messages
- ✅ JWT authentication middleware

### Infrastructure
- ✅ MongoDB Atlas connection
- ✅ Mongoose ODM integration
- ✅ TypeScript for type safety
- ✅ Express.js REST API
- ✅ Environment variable validation

## 📋 Next Steps

After MongoDB connection is working:

### Phase 2: Assessment System
- [ ] Create Assessment model
- [ ] Create AudioRecording model
- [ ] Implement POST /api/assessments/start
- [ ] Implement POST /api/assessments/:id/recordings (file upload)
- [ ] Implement GET /api/assessments/result

### Phase 3: Practice System
- [ ] Create PracticePathway model
- [ ] Create PracticeProgress model
- [ ] Create PracticeSession model
- [ ] Implement practice endpoints

### Phase 4: Chat System
- [ ] Create ChatMessage model
- [ ] Integrate Gemma 4 API
- [ ] Implement chat endpoints

### Phase 5: Expert System
- [ ] Create Expert models
- [ ] Implement expert endpoints

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### TypeScript compilation errors
```bash
npm run build
```

### Port 3000 already in use
Change PORT in `.env` file:
```env
PORT=3001
```

### MongoDB connection timeout
1. Check MongoDB Atlas Network Access (whitelist IP)
2. Check Database Access (user permissions)
3. Verify connection string in `.env`

## 📞 Support

If you encounter issues:
1. Check MongoDB Atlas dashboard
2. Verify `.env` configuration
3. Check server logs: `npm run dev`
4. Review error messages in terminal

## ✨ Success Indicators

When everything is working:
```
✅ Connected to MongoDB Atlas
📦 Database: goodviet
🚀 Server running on port 3000
📍 Environment: development
🌐 CORS Origin: http://localhost:5173

✨ Backend is ready!
```
