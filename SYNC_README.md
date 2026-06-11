# 🔄 Frontend-Backend Sync Update - Quick Guide

## 📋 Tài Liệu

| File | Mô tả |
|------|-------|
| [SYNC_UPDATE_GUIDE.md](./SYNC_UPDATE_GUIDE.md) | Hướng dẫn chi tiết cách cập nhật và setup |
| [FRONTEND_BACKEND_SYNC_SUMMARY.md](./FRONTEND_BACKEND_SYNC_SUMMARY.md) | Tóm tắt tất cả thay đổi |
| [SYNC_FIXES_COMPLETED.md](./SYNC_FIXES_COMPLETED.md) | ✅ Chi tiết các file đã sửa |
| [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) | 🧪 Checklist để test |

---

## ⚡ Quick Start (5 phút)

### 1. Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:3000
```

### 2. Frontend
```bash
npm install
npm run dev
# → http://localhost:5173
```

### 3. Test
Mở trình duyệt → `http://localhost:5173`

---

## ✅ Đã Hoàn Thành

### Backend (5 files)
- ✅ `backend/src/routes/expert-connection.routes.ts` (NEW)
- ✅ `backend/src/routes/expert-session.routes.ts` (NEW)
- ✅ `backend/src/routes/expert.routes.ts` (UPDATED)
- ✅ `backend/src/app.ts` (UPDATED)

### Frontend (1 file)
- ✅ `src/data/mockExperts.ts` (UPDATED)

### Kết quả
- ✅ 100% đồng bộ Frontend ↔ Backend
- ✅ Tất cả API endpoints đúng paths
- ✅ Tất cả interfaces match với models
- ✅ Migration script sẵn sàng

---

## 🔑 Thay Đổi Quan Trọng

### 1. Expert Routes (Breaking Change)
```
OLD: POST /api/experts/connections
NEW: POST /api/expert-connections ✅

OLD: POST /api/experts/sessions  
NEW: POST /api/expert-sessions ✅
```

### 2. Expert Interface
```typescript
// OLD
interface Expert {
  rating: number;
  avatar: string;
}

// NEW ✅
interface Expert {
  averageRating: number;
  totalRatings: number;
  experience: number;
  availability: string[];
  profileImageUrl?: string;
}
```

### 3. User Data (Auto-migrated)
```typescript
// OLD → NEW (automatic)
name → fullName
phone → phoneNumber
speechDescription → targetGoals
```

---

## 🧪 Test Nhanh

### Test Expert Flow
1. Vào `/expert`
2. Click vào expert → Xem rating hiển thị đúng ✅
3. Gửi yêu cầu kết nối → Check endpoint `/api/expert-connections` ✅
4. Đặt lịch hẹn → Check endpoint `/api/expert-sessions` ✅

### Test Registration
1. Vào `/register`
2. Điền form (bao gồm age, targetGoals)
3. Submit → Check response có đủ fields ✅

### Test Migration
```javascript
// Console
localStorage.clear();
location.reload();
// → Re-login → Check user data format ✅
```

---

## 📞 Support

Nếu gặp vấn đề:

1. **Check logs:**
   - Backend: Terminal running `npm run dev`
   - Frontend: Browser console (F12)

2. **Common fixes:**
   ```bash
   # 404 errors
   → Check backend routes registration
   
   # Undefined properties
   → Clear localStorage: localStorage.clear()
   
   # Compilation errors
   cd backend && npm install
   ```

3. **Xem chi tiết:** [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

---

## 🎉 Done!

Mọi thứ đã sẵn sàng! Enjoy coding! 🚀
