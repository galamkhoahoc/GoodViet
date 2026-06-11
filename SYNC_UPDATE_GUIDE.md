# Hướng Dẫn Cập Nhật Đồng Bộ Frontend-Backend

## 📅 Ngày cập nhật: 11/06/2026
## ✅ Trạng thái: **HOÀN THÀNH 100%** - Tất cả sửa lỗi đã được thực hiện

> 📄 **Xem chi tiết:** [SYNC_FIXES_COMPLETED.md](./SYNC_FIXES_COMPLETED.md)

## 🎯 Tổng Quan

Dự án đã được cập nhật để đồng bộ hoàn toàn giữa Frontend và Backend. Tài liệu này hướng dẫn các bước cần thiết để chạy ứng dụng sau khi cập nhật.

---

## ⚠️ Breaking Changes

### 1. User Data Format Changed

**OLD Format:**
```typescript
{
  name: string,          // ❌ Đã đổi
  phone: string,         // ❌ Đã đổi  
  speechDescription: string  // ❌ Đã đổi
}
```

**NEW Format:**
```typescript
{
  fullName: string,      // ✅ Mới
  phoneNumber: string,   // ✅ Mới
  targetGoals: string    // ✅ Mới
}
```

### 2. Expert Data Format Changed

**OLD Format:**
```typescript
{
  rating: number,        // ❌ Đã đổi
  profileImage: string   // ❌ Đã đổi
}
```

**NEW Format:**
```typescript
{
  averageRating: number,    // ✅ Mới
  totalRatings: number,     // ✅ Mới (thêm)
  profileImageUrl: string,  // ✅ Mới
  experience: number,       // ✅ Mới (thêm)
  totalSessions: number,    // ✅ Mới (thêm)
  availability: string[]    // ✅ Mới (thêm)
}
```

---

## 🚀 Cách Cập Nhật

### Option 1: Automatic Migration (Khuyến nghị)

Ứng dụng sẽ **TỰ ĐỘNG** migrate dữ liệu cũ khi bạn:

1. **Mở ứng dụng lần đầu** sau khi cập nhật
2. Migration script sẽ chạy tự động trong `App.tsx`
3. Check console để xem:
   ```
   📦 Detecting old user data format, migrating...
   ✅ User data migrated successfully
   ```

**Không cần làm gì thêm!** 🎉

### Option 2: Manual Migration

Nếu muốn migrate thủ công:

```typescript
import { migrateLocalStorage } from './utils/userDataMigration';

// Trong console hoặc component
migrateLocalStorage();
```

### Option 3: Clear & Re-login (Khuyến nghị cho testing)

1. Mở Developer Tools (F12)
2. Console tab
3. Chạy:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. Đăng nhập lại

---

## 🔧 Setup Backend

### 1. Cài đặt Dependencies

```bash
cd backend
npm install
```

### 2. Cập Nhật Environment Variables

Kiểm tra file `.env` có đầy đủ:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/goodviet

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=3000
NODE_ENV=development
```

### 3. Khởi động Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:3000`

---

## 🎨 Setup Frontend

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Khởi động Frontend

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## ✅ Kiểm Tra Sau Khi Cập Nhật

### 1. Test Registration Flow

1. Vào trang `/register`
2. Điền form đầy đủ (bao gồm **age** và **targetGoals**)
3. Submit
4. Kiểm tra Network tab → `POST /api/users/register` response:
   ```json
   {
     "user": {
       "id": "...",
       "fullName": "...",
       "age": 25,
       "phoneNumber": "...",
       "targetGoals": "...",
       "totalRecordings": 0,
       "totalPracticeTime": 0,
       "currentStreak": 0,
       "longestStreak": 0
     },
     "token": "..."
   }
   ```

### 2. Test Login Flow

1. Đăng nhập với account đã tạo
2. Kiểm tra localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('goodviet_user'))
   ```
3. Xác nhận có fields: `fullName`, `phoneNumber`, `targetGoals`

### 3. Test Profile Page

1. Vào `/profile`
2. Xác nhận hiển thị đúng: **Họ và tên**, **Tuổi**, **Số điện thoại**, **Mục tiêu**
3. Thử edit và save

### 4. Test Expert Page

1. Vào `/expert`
2. Xác nhận expert cards hiển thị đúng rating
3. Kiểm tra `profileImageUrl` (không phải `profileImage`)

---

## 🐛 Troubleshooting

### Problem 1: "Cannot read property 'fullName' of undefined"

**Nguyên nhân:** LocalStorage còn dữ liệu cũ

**Giải pháp:**
```javascript
localStorage.clear();
location.reload();
```

### Problem 2: Backend trả về 400 Bad Request khi register

**Nguyên nhân:** Missing `age` hoặc `targetGoals` trong request

**Giải pháp:**
- Kiểm tra `RegisterPage.tsx` đã gửi đúng fields
- Xem Console để check payload trước khi gửi

### Problem 3: Expert booking không hoạt động

**Nguyên nhân:** Frontend gửi `expertId` thay vì `connectionId`

**Giải pháp:**
- Đảm bảo đã cập nhật `expertApi.ts`
- Flow đúng: `requestConnection(expertId)` → `bookSession(connectionId)`

### Problem 4: Migration không chạy tự động

**Giải pháp:**
```typescript
// Trong console
import { autoMigrateOnLoad } from './utils/userDataMigration';
autoMigrateOnLoad();
```

---

## 📊 Database Migration

### Cập nhật Existing Users

Nếu database đã có users cũ, chạy migration script:

```javascript
// MongoDB Shell hoặc create migration script
db.users.updateMany(
  { totalRecordings: { $exists: false } },
  {
    $set: {
      totalRecordings: 0,
      totalPracticeTime: 0,
      currentStreak: 0,
      longestStreak: 0
    }
  }
);
```

### Cập nhật Existing Experts

```javascript
db.experts.updateMany(
  { experience: { $exists: false } },
  {
    $set: {
      experience: 0,
      totalSessions: 0,
      availability: []
    }
  }
);
```

---

## 📝 API Changes Summary

### Auth Endpoints

#### `POST /api/users/register`
**Request Body (Updated):**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "age": 25,
  "targetGoals": "Cải thiện phát âm L/N"
}
```

**Response (Updated):**
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

### Expert Endpoints

#### `POST /api/expert-connections` (Fixed path)
**OLD:** `/api/experts/connections` ❌  
**NEW:** `/api/expert-connections` ✅

#### `POST /api/expert-sessions` (Fixed path)
**OLD:** `/api/experts/sessions` ❌  
**NEW:** `/api/expert-sessions` ✅

**Request Body (Fixed parameter):**
```json
{
  "connectionId": "...",  // ✅ Was: expertId
  "scheduledAt": "2026-06-15T10:00:00Z",
  "duration": 60,
  "sessionType": "consultation"
}
```

### Practice Endpoints

#### `POST /api/practice/recording` (NEW)
**Request Body:**
```json
{
  "exerciseId": "...",
  "week": 1,
  "day": 3,
  "audioData": "..."
}
```

---

## 📚 Tài Liệu Tham Khảo

- [FRONTEND_BACKEND_SYNC_SUMMARY.md](./FRONTEND_BACKEND_SYNC_SUMMARY.md) - Chi tiết tất cả thay đổi
- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./README.md)

---

## ✨ Tính Năng Mới

Sau khi cập nhật, bạn sẽ có:

1. ✅ **User Statistics** - Hiển thị tổng recordings, practice time, streaks
2. ✅ **Expert Experience** - Hiển thị kinh nghiệm và availability của experts
3. ✅ **Assessment Phase Tracking** - Lưu trữ dữ liệu chi tiết từng phase
4. ✅ **Practice Recording Upload** - Endpoint mới để upload practice recordings
5. ✅ **Auto Migration** - Tự động migrate dữ liệu cũ sang format mới

---

## 🎉 Done!

Sau khi hoàn tất các bước trên, ứng dụng sẽ hoạt động bình thường với:
- ✅ Frontend và Backend đã đồng bộ hoàn toàn
- ✅ Dữ liệu cũ đã được migrate
- ✅ Tất cả API endpoints đã được fix
- ✅ Type definitions đã được cập nhật

**Chúc mừng! Bạn đã cập nhật thành công! 🚀**
