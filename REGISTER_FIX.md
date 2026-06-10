# ✅ Fixed: Registration Issues

## 🐛 Vấn Đề

Frontend Register form đang gửi data không khớp với backend validation:
- Frontend gửi: `age`, `phone`, `speechDescription`
- Backend expects: `age` (optional), `phoneNumber`, `targetGoals`

## 🔧 Đã Sửa

### 1. Frontend RegisterPage
- ✅ Bỏ required (*) cho age và speechDescription
- ✅ Map `phone` → `phoneNumber`
- ✅ Map `speechDescription` → `targetGoals`
- ✅ Tuổi từ 18-100 (thay vì 22-55)
- ✅ Chỉ gửi fields có data
- ✅ Error message rõ ràng hơn

### 2. Backend Validation
- ✅ Thêm `age` field (optional, 18-100)
- ✅ Thêm `targetGoals` field (optional)
- ✅ `phoneNumber` vẫn validate pattern `^0\d{9}$`

### 3. Auth Store
- ✅ Pass data trực tiếp từ RegisterPage (đã clean)

## 🧪 Test Ngay

### Case 1: Minimal Registration (Recommended)
```
Email: test@example.com
Password: Test1234
Họ và tên: Test User
(Bỏ trống các field khác)
```

### Case 2: Full Registration
```
Email: full@example.com
Password: Test1234
Họ và tên: Full Test User
Tuổi: 25
SĐT: 0901234567 (bắt đầu với 0, 10 số)
Mô tả: Tôi hay nhầm L và N
```

### Case 3: Invalid Phone (Should Fail)
```
Email: invalid@example.com  
Password: Test1234
Họ và tên: Invalid User
SĐT: 123456789 (không bắt đầu với 0) ❌
```

## 📝 Password Requirements

Backend validation yêu cầu:
- ✅ Min 8 characters
- ✅ At least 1 letter (A-Z or a-z)
- ✅ At least 1 number (0-9)

**Valid examples:**
- `Test1234` ✅
- `MyPass123` ✅
- `abcd1234` ✅

**Invalid examples:**
- `test` ❌ (too short)
- `testtest` ❌ (no number)
- `12345678` ❌ (no letter)

## 🚀 Chạy Ngay

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd ..
npm run dev
```

Sau đó:
1. Mở http://localhost:5173
2. Click "Đăng ký ngay"
3. Test với Case 1 (minimal)
4. Kiểm tra Console (F12) nếu có lỗi

## ⚠️ Common Errors

### Error 1: "Số điện thoại không hợp lệ"
**Cause**: Phone number không match pattern `^0\d{9}$`

**Fix**: 
- Bắt đầu với 0
- Đúng 10 số
- Ví dụ: `0901234567` ✅

### Error 2: "Mật khẩu phải có ít nhất 1 chữ cái"
**Cause**: Password chỉ toàn số

**Fix**: Thêm chữ cái
- `12345678` ❌
- `Test1234` ✅

### Error 3: "Email đã được đăng ký"
**Cause**: Email đã tồn tại trong database

**Fix**: Dùng email khác hoặc login với email đó

### Error 4: 429 Rate Limit
**Cause**: Đăng ký quá nhiều lần (3 lần/giờ)

**Fix**: 
- Đợi 1 giờ
- Hoặc restart backend server
- Hoặc dùng login với account đã có

## ✅ Expected Behavior

**Success Flow:**
1. User điền form
2. Click "Đăng ký"
3. Frontend validate client-side
4. Send POST request to `/api/users/register`
5. Backend validate server-side
6. Create user + hash password
7. Return JWT token + user data
8. Frontend save token to localStorage
9. Redirect to Dashboard
10. ✅ Done!

**Error Flow:**
1. User điền form sai
2. Click "Đăng ký"
3. Frontend validate → Show error ❌
4. Or backend validate → Show error ❌
5. User fix và thử lại

---

**Status**: Registration should work now! 🎉

Test và cho tôi biết kết quả nhé!
