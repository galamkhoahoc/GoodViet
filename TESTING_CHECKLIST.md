# 🧪 Testing Checklist - GoodViet Sync Update

## 📅 Date: 11/06/2026
## 🎯 Purpose: Verify all frontend-backend synchronization fixes

---

## ✅ Pre-Testing Setup

### Backend Setup
- [ ] `cd backend`
- [ ] `npm install`
- [ ] Kiểm tra `.env` có đầy đủ variables:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `PORT=3000`
  - [ ] `NODE_ENV=development`
- [ ] `npm run dev`
- [ ] Verify backend running at `http://localhost:3000`
- [ ] Check health endpoint: `curl http://localhost:3000/health`

### Frontend Setup
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Verify frontend running at `http://localhost:5173`

### Database Setup
- [ ] MongoDB đang chạy
- [ ] Database `goodviet` đã được tạo
- [ ] Collections đã sẵn sàng

---

## 🔍 Test Cases

### 1. Registration Flow ✅

#### Test Steps:
1. [ ] Vào `http://localhost:5173/register`
2. [ ] Điền form với:
   - [ ] Email: `test@example.com`
   - [ ] Password: `password123`
   - [ ] Họ và tên: `Nguyễn Văn A`
   - [ ] Tuổi: `25`
   - [ ] Số điện thoại: `0901234567`
   - [ ] Mục tiêu: `Cải thiện phát âm L/N`
3. [ ] Click "Đăng ký"

#### Expected Results:
- [ ] Request gửi đến `POST /api/users/register`
- [ ] Response status: `200` hoặc `201`
- [ ] Response body có structure:
```json
{
  "user": {
    "id": "...",
    "fullName": "Nguyễn Văn A",
    "age": 25,
    "phoneNumber": "0901234567",
    "targetGoals": "Cải thiện phát âm L/N",
    "totalRecordings": 0,
    "totalPracticeTime": 0,
    "currentStreak": 0,
    "longestStreak": 0
  },
  "token": "..."
}
```
- [ ] LocalStorage có `goodviet_user` với đúng structure
- [ ] Redirect đến dashboard hoặc home

---

### 2. Login Flow ✅

#### Test Steps:
1. [ ] Logout (nếu đang login)
2. [ ] Vào `http://localhost:5173/login`
3. [ ] Điền:
   - [ ] Email: `test@example.com`
   - [ ] Password: `password123`
4. [ ] Click "Đăng nhập"

#### Expected Results:
- [ ] Request gửi đến `POST /api/users/login`
- [ ] Response có đầy đủ user fields
- [ ] LocalStorage lưu user data với fields:
  - [ ] `userId`
  - [ ] `fullName`
  - [ ] `phoneNumber`
  - [ ] `targetGoals`
  - [ ] `age`
  - [ ] Statistics fields
- [ ] Redirect đến dashboard

---

### 3. Profile Page ✅

#### Test Steps:
1. [ ] Đăng nhập
2. [ ] Vào `http://localhost:5173/profile`

#### Expected Results:
- [ ] Hiển thị đúng: **Họ và tên**
- [ ] Hiển thị đúng: **Tuổi**
- [ ] Hiển thị đúng: **Số điện thoại**
- [ ] Hiển thị đúng: **Mục tiêu**
- [ ] Hiển thị thống kê:
  - [ ] Total Recordings
  - [ ] Total Practice Time
  - [ ] Current Streak
  - [ ] Longest Streak
- [ ] Click "Edit" → Form pre-filled đúng
- [ ] Save changes → Success message

---

### 4. Expert Discovery ✅

#### Test Steps:
1. [ ] Đăng nhập
2. [ ] Vào `http://localhost:5173/expert`
3. [ ] Tab "Khám phá Chuyên gia"

#### Expected Results:
- [ ] Request: `GET /api/experts`
- [ ] Danh sách experts hiển thị
- [ ] Mỗi expert card có:
  - [ ] Name (fullName)
  - [ ] Avatar hoặc initial (profileImageUrl)
  - [ ] **Rating hiển thị đúng** (averageRating, không phải rating)
  - [ ] Specializations
  - [ ] Bio
  - [ ] Experience (X năm kinh nghiệm)
  - [ ] Total Sessions
- [ ] Click vào expert → Mở chi tiết
- [ ] Chi tiết có:
  - [ ] Bằng cấp
  - [ ] Nút "Yêu cầu kết nối"

---

### 5. Expert Connection Request ✅

#### Test Steps:
1. [ ] Từ expert detail, click "Yêu cầu kết nối"
2. [ ] Điền lý do kết nối
3. [ ] Click "Gửi yêu cầu"

#### Expected Results:
- [ ] Request: `POST /api/expert-connections` (NOT `/api/experts/connections`)
- [ ] Request body:
```json
{
  "expertId": "...",
  "reason": "..."
}
```
- [ ] Response status: `200` hoặc `201`
- [ ] Success message hiển thị
- [ ] Modal đóng sau 2 giây

---

### 6. Expert Connections List ✅

#### Test Steps:
1. [ ] Tab "Kết nối của tôi"

#### Expected Results:
- [ ] Request: `GET /api/expert-connections` (NOT `/api/experts/connections`)
- [ ] Hiển thị danh sách connections
- [ ] Mỗi connection có:
  - [ ] Expert info (name, specializations, **averageRating**)
  - [ ] Status badge (pending/accepted/rejected)
  - [ ] Request date
  - [ ] Nút "Đặt lịch hẹn" (nếu accepted)

---

### 7. Book Expert Session ✅

#### Test Steps:
1. [ ] Từ accepted connection, click "Đặt lịch hẹn"
2. [ ] Chọn:
   - [ ] Loại phiên: Tư vấn
   - [ ] Ngày: (future date)
   - [ ] Giờ: 10:00
3. [ ] Click "Xác nhận đặt lịch"

#### Expected Results:
- [ ] Request: `POST /api/expert-sessions` (NOT `/api/experts/sessions`)
- [ ] Request body:
```json
{
  "connectionId": "...",  // NOT expertId
  "scheduledAt": "2026-06-15T10:00:00Z",
  "duration": 45,
  "sessionType": "consultation"
}
```
- [ ] Response status: `200` hoặc `201`
- [ ] Success message
- [ ] Redirect to "Lịch hẹn" tab

---

### 8. Expert Sessions List ✅

#### Test Steps:
1. [ ] Tab "Lịch hẹn"

#### Expected Results:
- [ ] Request: `GET /api/expert-sessions` (NOT `/api/experts/sessions`)
- [ ] Hiển thị danh sách sessions
- [ ] Mỗi session có:
  - [ ] Date & time
  - [ ] Expert name
  - [ ] Session type badge
  - [ ] Status badge
  - [ ] Duration
  - [ ] Meeting link (nếu scheduled)
  - [ ] Rating section (nếu completed)

---

### 9. Rate Expert Session ✅

#### Test Steps:
1. [ ] Tìm completed session
2. [ ] Click vào stars để rate (1-5)

#### Expected Results:
- [ ] Request: `PATCH /api/expert-sessions/:id/rate`
- [ ] Request body:
```json
{
  "rating": 5,
  "feedback": "..."
}
```
- [ ] Success message
- [ ] Rating hiển thị trong session card

---

### 10. Practice Recording Upload ✅

#### Test Steps:
1. [ ] Vào practice page
2. [ ] Chọn exercise
3. [ ] Record audio
4. [ ] Submit recording

#### Expected Results:
- [ ] Request: `POST /api/practice/recording`
- [ ] Request body:
```json
{
  "exerciseId": "...",
  "week": 1,
  "day": 3,
  "audioData": "..."
}
```
- [ ] Response status: `200` hoặc `201`
- [ ] Success message

---

### 11. Assessment Flow ✅

#### Test Steps:
1. [ ] Bắt đầu assessment
2. [ ] Complete Phase I
3. [ ] Complete Phase II
4. [ ] Complete Phase III

#### Expected Results:
- [ ] Phase data được lưu đúng:
  - [ ] `phaseIData: { sentences, recordings }`
  - [ ] `phaseIIData: { sentences, recordings }`
  - [ ] `phaseIIIData: { recordingId, duration }`
- [ ] GET assessment status trả về phase data

---

### 12. Migration Script ✅

#### Test Steps:
1. [ ] Trong console, chạy:
```javascript
// Tạo old format user data
localStorage.setItem('goodviet_user', JSON.stringify({
  userId: 'test-123',
  email: 'old@example.com',
  name: 'Old Name',          // OLD field
  phone: '0909090909',       // OLD field
  speechDescription: 'Old description',  // OLD field
  age: 30
}));
```
2. [ ] Reload page
3. [ ] Check console logs

#### Expected Results:
- [ ] Console log: `📦 Detecting old user data format, migrating...`
- [ ] Console log: `✅ User data migrated successfully`
- [ ] LocalStorage có new format:
```json
{
  "userId": "test-123",
  "email": "old@example.com",
  "fullName": "Old Name",
  "phoneNumber": "0909090909",
  "targetGoals": "Old description",
  "age": 30
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: 404 Not Found - Expert Endpoints

**Symptom:**
```
POST /api/experts/connections → 404
```

**Fix:**
- ✅ Check `backend/src/app.ts` có đăng ký đúng:
```typescript
app.use('/api/expert-connections', expertConnectionRoutes);
app.use('/api/expert-sessions', expertSessionRoutes);
```

### Issue 2: Expert Rating Undefined

**Symptom:**
```javascript
expert.rating is undefined
```

**Fix:**
- ✅ Check frontend code dùng `expert.averageRating`
- ✅ Check `src/data/mockExperts.ts` interface có `averageRating`

### Issue 3: Cannot Read Property 'fullName'

**Symptom:**
```
Cannot read property 'fullName' of undefined
```

**Fix:**
- ✅ Clear localStorage: `localStorage.clear()`
- ✅ Re-login
- ✅ Check migration script đã chạy

### Issue 4: Backend Compilation Error

**Symptom:**
```
'tsc' is not recognized
```

**Fix:**
```bash
cd backend
npm install
npm install -D typescript @types/node
```

---

## 📊 Test Results Summary

### Backend Routes
- [ ] ✅ All expert routes work correctly
- [ ] ✅ Connection endpoints at `/api/expert-connections`
- [ ] ✅ Session endpoints at `/api/expert-sessions`
- [ ] ✅ Practice recording endpoint works

### Frontend Integration
- [ ] ✅ Registration sends correct fields
- [ ] ✅ Login receives correct fields
- [ ] ✅ Profile displays all fields
- [ ] ✅ Expert cards show averageRating
- [ ] ✅ Expert booking uses connectionId

### Data Migration
- [ ] ✅ Auto-migration works
- [ ] ✅ Old data converted to new format

---

## ✅ Sign-off

**Tested by:** ___________________  
**Date:** ___________________  
**Status:** ⬜ Pass / ⬜ Fail  
**Notes:** ___________________________________

---

## 🚀 Ready for Production?

- [ ] All tests passed
- [ ] No console errors
- [ ] No network errors (404, 500)
- [ ] Migration works correctly
- [ ] All fields display correctly
- [ ] Expert booking flow complete
- [ ] Documentation updated

**If all checked, you're ready to deploy! 🎉**
