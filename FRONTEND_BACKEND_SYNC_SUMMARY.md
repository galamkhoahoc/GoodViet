# Tóm Tắt Đồng Bộ Frontend - Backend

## Ngày cập nhật: 11/06/2026

### 🎯 Mục tiêu
Đồng bộ hóa hoàn toàn UI (Frontend) với Backend API để đảm bảo tính nhất quán về data models, API endpoints và response formats.

---

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. Backend Models Updates

#### 1.1. User Model (`backend/src/models/User.ts`)
**Thêm các fields:**
- ✅ `age?: number` - Tuổi của người dùng (validation: 1-150)
- ✅ `totalRecordings: number` - Tổng số recordings (default: 0)
- ✅ `totalPracticeTime: number` - Tổng thời gian luyện tập (default: 0)
- ✅ `currentStreak: number` - Chuỗi ngày luyện tập hiện tại (default: 0)
- ✅ `longestStreak: number` - Chuỗi ngày luyện tập dài nhất (default: 0)

**Lý do:** Frontend User interface yêu cầu các fields này để hiển thị thống kê người dùng.

#### 1.2. Expert Model (`backend/src/models/Expert.ts`)
**Thêm các fields:**
- ✅ `experience: number` - Số năm kinh nghiệm (default: 0)
- ✅ `totalSessions: number` - Tổng số buổi tư vấn (default: 0)
- ✅ `availability: string[]` - Các khung giờ có sẵn (default: [])

**Lý do:** Frontend Expert interface cần các fields này để hiển thị thông tin chuyên gia đầy đủ.

#### 1.3. Assessment Model (`backend/src/models/Assessment.ts`)
**Thêm các fields:**
- ✅ `phaseIData?: { sentences: string[], recordings: string[] }` - Dữ liệu phase 1
- ✅ `phaseIIData?: { sentences: string[], recordings: string[] }` - Dữ liệu phase 2
- ✅ `phaseIIIData?: { recordingId: string, duration: number }` - Dữ liệu phase 3

**Lý do:** Frontend assessment flow cần lưu trữ dữ liệu chi tiết của từng phase.

---

### 2. Backend Controllers Updates

#### 2.1. Auth Controller (`backend/src/controllers/auth.controller.ts`)
**Cập nhật register endpoint:**
- ✅ Nhận thêm params: `age`, `targetGoals`
- ✅ Response bao gồm: `age`, `targetGoals`, `totalRecordings`, `totalPracticeTime`, `currentStreak`, `longestStreak`

**Cập nhật login endpoint:**
- ✅ Response bao gồm tất cả user statistics fields

#### 2.2. Auth Service (`backend/src/services/auth.service.ts`)
**Cập nhật register method:**
- ✅ Nhận và lưu `age` và `targetGoals` vào database

#### 2.3. Practice Controller (`backend/src/controllers/practice.controller.ts`)
**Thêm endpoint mới:**
- ✅ `POST /api/practice/recording` - Upload practice recording
- ✅ Handler: `PracticeController.uploadRecording()`

**Lý do:** Frontend practice API gọi endpoint này nhưng chưa tồn tại.

---

### 3. Backend Routes Updates

#### 3.1. Practice Routes (`backend/src/routes/practice.routes.ts`)
**Thêm route:**
- ✅ `router.post('/recording', PracticeController.uploadRecording)`

---

### 4. Frontend Type Definitions Updates

#### 4.1. User Interface (`src/data/mockUsers.ts`)
**Đổi tên fields để match với backend:**
- ✅ `name` → `fullName`
- ✅ `phone` → `phoneNumber`
- ✅ `speechDescription` → `targetGoals`

**Lý do:** Backend sử dụng naming convention khác.

#### 4.2. Expert Interface (`src/services/api/expertApi.ts`)
**Đổi tên fields:**
- ✅ `rating` → `averageRating`
- ✅ Thêm `totalRatings: number`
- ✅ `profileImage` → `profileImageUrl`

---

### 5. Frontend API Services Updates

#### 5.1. Expert API (`src/services/api/expertApi.ts`)
**Sửa endpoints:**
- ✅ `POST /api/experts/connections` → `POST /api/expert-connections`
- ✅ `GET /api/experts/connections` → `GET /api/expert-connections`
- ✅ `POST /api/experts/sessions` → `POST /api/expert-sessions`
- ✅ `GET /api/experts/sessions` → `GET /api/expert-sessions`

**Sửa bookSession parameters:**
- ✅ `expertId` → `connectionId` (Backend yêu cầu connectionId, không phải expertId)

**Thêm method:**
- ✅ `rateSession(sessionId, rating, feedback)` - Đánh giá session

---

### 6. Frontend Store Updates

#### 6.1. Auth Store (`src/store/authStore.ts`)
**Cập nhật login method:**
- ✅ Map backend response `id` → `userId`
- ✅ Map backend response fields to frontend User interface
- ✅ Handle all statistics fields

**Cập nhật register method:**
- ✅ Map frontend form data to backend expected format
- ✅ Convert `fullName`, `phoneNumber`, `targetGoals` correctly
- ✅ Map backend response to frontend User interface

---

## 📋 Mapping Table - Field Names

### User Model
| Frontend Field | Backend Field | Type | Notes |
|---------------|---------------|------|-------|
| `userId` | `id` or `_id` | string | Backend uses MongoDB ObjectId |
| `fullName` | `fullName` | string | ✅ Matched |
| `phoneNumber` | `phoneNumber` | string | ✅ Matched |
| `targetGoals` | `targetGoals` | string | ✅ Matched |
| `age` | `age` | number | ✅ Added to backend |

### Expert Model
| Frontend Field | Backend Field | Type | Notes |
|---------------|---------------|------|-------|
| `averageRating` | `averageRating` | number | ✅ Fixed |
| `totalRatings` | `totalRatings` | number | ✅ Added |
| `profileImageUrl` | `profileImageUrl` | string | ✅ Fixed |
| `experience` | `experience` | number | ✅ Added to backend |
| `totalSessions` | `totalSessions` | number | ✅ Added to backend |
| `availability` | `availability` | string[] | ✅ Added to backend |

---

## 🔧 API Endpoints - Complete List

### Authentication
- ✅ `POST /api/users/register` - Đăng ký (updated with age, targetGoals)
- ✅ `POST /api/users/login` - Đăng nhập (updated response)
- ✅ `POST /api/users/logout` - Đăng xuất
- ✅ `GET /api/users/profile` - Lấy profile
- ✅ `PATCH /api/users/profile` - Cập nhật profile

### Chat
- ✅ `POST /api/chat/messages` - Gửi tin nhắn
- ✅ `GET /api/chat/history` - Lịch sử chat

### Assessment
- ✅ `POST /api/assessments/start` - Bắt đầu assessment
- ✅ `POST /api/assessments/:id/recordings` - Thêm recording
- ✅ `POST /api/assessments/:id/complete-phase` - Hoàn thành phase
- ✅ `GET /api/assessments/:id/status` - Trạng thái
- ✅ `GET /api/assessments/result` - Kết quả

### Audio
- ✅ `POST /api/audio/upload` - Upload audio
- ✅ `GET /api/audio/stream/:fileId` - Stream audio
- ✅ `GET /api/audio/url/:recordingId` - Temporary URL
- ✅ `DELETE /api/audio/:recordingId` - Xóa recording

### Practice
- ✅ `GET /api/practice/pathways` - Danh sách pathways
- ✅ `POST /api/practice/start` - Bắt đầu pathway
- ✅ `GET /api/practice/progress` - Tiến trình
- ✅ `GET /api/practice/day/:week/:day` - Bài tập theo ngày
- ✅ `POST /api/practice/checkin` - Check-in
- ✅ `GET /api/practice/history` - Lịch sử
- ✅ `POST /api/practice/recording` - **[MỚI]** Upload recording

### Expert
- ✅ `GET /api/experts` - Danh sách experts
- ✅ `POST /api/expert-connections` - Yêu cầu kết nối (fixed endpoint)
- ✅ `GET /api/expert-connections` - Danh sách kết nối (fixed endpoint)
- ✅ `POST /api/expert-sessions` - Đặt lịch session (fixed endpoint)
- ✅ `GET /api/expert-sessions` - Danh sách sessions (fixed endpoint)
- ✅ `PATCH /api/expert-sessions/:id/rate` - Đánh giá session

### Notifications
- ✅ `GET /api/notifications` - Lấy thông báo
- ✅ `PATCH /api/notifications/:id/read` - Đánh dấu đã đọc

---

## 🎯 Các Vấn Đề Đã Fix

### ❌ Vấn đề trước khi fix:

1. **User Model Mismatch**
   - Frontend gửi `age` nhưng backend không lưu
   - Field names không khớp: `name` vs `fullName`, `phone` vs `phoneNumber`

2. **Expert API Wrong Parameters**
   - Frontend gọi `bookSession(expertId, ...)` nhưng backend cần `connectionId`
   - Endpoints sai: `/api/experts/sessions` vs `/api/expert-sessions`

3. **Practice Recording Route Missing**
   - Frontend gọi `POST /api/practice/recording` không tồn tại

4. **Assessment Phase Data Missing**
   - Frontend expects `phaseIData`, `phaseIIData` không có trong backend model

### ✅ Sau khi fix:

1. ✅ Backend User model đã có đầy đủ fields mà frontend cần
2. ✅ Expert API đã đúng endpoints và parameters
3. ✅ Practice recording route đã được thêm
4. ✅ Assessment model đã có phase data structure
5. ✅ Frontend types đã được đồng bộ với backend response format

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Test register với `age` và `targetGoals`
- [ ] Test login response có đủ statistics fields
- [ ] Test expert booking với `connectionId`
- [ ] Test practice recording endpoint
- [ ] Test assessment với phase data

### Frontend Testing
- [ ] Test registration form với tất cả fields
- [ ] Test login và check localStorage có đúng User structure
- [ ] Test expert booking flow (request connection → book session)
- [ ] Test practice recording upload
- [ ] Test assessment flow với phase tracking

---

## 📝 Notes

1. **Breaking Changes:** 
   - User interface đã thay đổi field names - cần clear localStorage
   - Expert API endpoints đã thay đổi - cần update tất cả nơi gọi API

2. **Database Migration:**
   - Các users cũ sẽ không có `age`, `totalRecordings`, etc. - các fields này là optional
   - Experts cũ sẽ không có `experience`, `availability` - cần update manual hoặc set defaults

3. **Backward Compatibility:**
   - Backend vẫn chấp nhận requests không có `age` hoặc `targetGoals`
   - Frontend mapping sẽ set default values nếu backend không trả về

---

## 🚀 Next Steps

1. Test toàn bộ registration và login flow
2. Test expert connection và booking flow
3. Test practice session recording
4. Verify assessment phase tracking
5. Update documentation và API specs nếu có
6. Consider creating shared types package để tránh mismatch trong tương lai

---

## 👥 Contact

Nếu có vấn đề về đồng bộ dữ liệu, vui lòng kiểm tra:
1. Field names trong User interface (`src/data/mockUsers.ts`)
2. API response mapping trong stores (`src/store/authStore.ts`)
3. Backend model definitions (`backend/src/models/*.ts`)
4. API endpoint paths (`backend/src/routes/*.ts`)
