# GOODVIET Backend Test Guide

## 📋 Tổng Quan

Test suite toàn diện để kiểm tra tất cả tính năng backend và đảm bảo đồng bộ với frontend.

## 🚀 Cách Chạy Test

### Bước 1: Đảm bảo Backend đang chạy

```bash
# Terminal 1 - Start backend
cd backend
npm run dev
```

Đợi đến khi thấy:
```
🚀 Server is running on port 3000
✅ MongoDB connected successfully
```

### Bước 2: Chạy test suite (Terminal mới)

```bash
# Terminal 2 - Run tests
cd backend
node test-all-features.js
```

## 📊 Test Suite Bao Gồm

### 1. **Health Check**
- ✅ Server health status
- ✅ Storage type detection (GridFS/S3)
- ✅ Environment configuration

### 2. **User Authentication**
- ✅ User registration with validation
- ✅ JWT token generation
- ✅ User login
- ✅ Get user profile
- ✅ Update user profile

### 3. **Security & Rate Limiting**
- ✅ Rate limiting on login (5 attempts/15min)
- ✅ JWT authentication middleware
- ✅ Password validation (min 8 chars, 1 letter, 1 number)

### 4. **Assessment System**
- ✅ Start assessment
- ✅ Phase I sentences generation (12 sentences)
- ✅ Audio file upload
- ✅ Recording metadata storage

### 5. **Practice System**
- ✅ Get practice pathways
- ✅ Start practice pathway
- ✅ Get practice progress
- ✅ Daily check-in
- ✅ Streak calculation

### 6. **Gemini Chatbot**
- ✅ Send chat message
- ✅ Chat response generation
- ✅ No thinking output (clean response)
- ✅ Get chat history

### 7. **Expert System**
- ✅ Get expert list
- ✅ Request expert connection
- ✅ Expert data structure

### 8. **Notification System**
- ✅ Get notifications
- ✅ Unread count tracking

### 9. **Input Validation & Sanitization**
- ✅ XSS prevention (validator.escape)
- ✅ Password validation
- ✅ Email validation

### 10. **Error Handling**
- ✅ 404 handler
- ✅ 401 authentication errors
- ✅ 400 validation errors

## 📈 Kết Quả Mong Đợi

```
╔════════════════════════════════════════════════════════════╗
║                      TEST SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝

⏱️  Duration: 15-20s
✅ Passed: 30+
❌ Failed: 0
📊 Success Rate: 100%

🎉 ALL TESTS PASSED! Backend is working correctly.
```

## 🔍 Nếu Test Fail

### Common Issues:

1. **Server not running**
   ```
   ❌ Server is not running. Please start backend with: npm run dev
   ```
   **Fix**: Start backend server trong terminal khác

2. **MongoDB connection error**
   ```
   ❌ Health check endpoint - MongoError: ...
   ```
   **Fix**: Check MONGODB_URI trong .env

3. **Gemini API error**
   ```
   ❌ Send chat message - Invalid API key
   ```
   **Fix**: Check GEMINI_API_KEY trong .env

4. **Rate limit not working**
   ```
   ⚠️  Rate limiting on login - No rate limit detected
   ```
   **Fix**: Check express-rate-limit middleware

## 🧪 Test Individual Features

Nếu bạn chỉ muốn test 1 tính năng cụ thể:

### Test GridFS Upload/Download
```bash
node test-gridfs-upload.js
```

### Test MongoDB Connection
```bash
node test-connection.js
```

### Test User Registration
```bash
node test-registration.js
```

### Test User Login
```bash
node test-login.js
```

### Test Audio Upload
```bash
node test-audio-upload.js
```

## 📝 Notes

- Test suite tự động tạo user mới với email unique
- Test suite tự động cleanup sau khi chạy xong
- Mỗi test có delay 500ms để tránh rate limiting
- Test suite an toàn để chạy multiple times

## 🎯 Expected Behavior

### ✅ All tests should pass if:
- Backend server is running on port 3000
- MongoDB connection is established
- All environment variables are set correctly
- All dependencies are installed

### ⚠️ Some tests may fail if:
- GEMINI_API_KEY is invalid (chatbot tests will fail)
- Rate limiting is too aggressive (adjust delays in test)
- Database seeding not complete (expert/pathway tests may fail)

## 🚀 Next Steps After Tests Pass

1. **Test Frontend Integration**
   - Start frontend: `npm run dev` (root directory)
   - Test UI interactions
   - Verify API calls in browser DevTools

2. **Test Audio Recording**
   - Go to Assessment page
   - Click record button
   - Speak and stop
   - Verify upload in MongoDB

3. **Test Chat**
   - Go to Chat page
   - Send message
   - Verify bot responds without thinking output

4. **Test Practice**
   - Start a practice pathway
   - Complete exercises
   - Verify streak tracking

## 📚 Additional Resources

- Backend API documentation: See `design.md`
- Requirements: See `requirements.md`
- Tasks: See `tasks.md`

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
