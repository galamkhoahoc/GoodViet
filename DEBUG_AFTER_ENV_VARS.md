# 🔍 DEBUG - ĐÃ SET ENV VARS NHƯNG VẪN LỖI

## ❓ CÁC NGUYÊN NHÂN THƯỜNG GẶP:

### 1. ⚠️ QUÊN REDEPLOY SAU KHI SET ENV VARS
**Quan trọng nhất!** Environment variables chỉ có hiệu lực SAU KHI REDEPLOY!

**Cách fix:**
```
1. Vào backend project
2. Tab "Deployments"
3. Click "..." (3 dots) ở deployment mới nhất
4. Click "Redeploy"
5. ✅ UNCHECK "Use existing Build Cache"
6. Click "Redeploy"
7. Đợi 2-3 phút
```

---

### 2. ❌ GIÁ TRỊ BIẾN SAI

**Các lỗi thường gặp:**
- Có khoảng trắng thừa đầu/cuối
- Copy thiếu ký tự
- URL sai format

**Cách kiểm tra:**
```bash
# Chạy script test:
cd backend
node verify-backend.js
```

**Nếu thấy:**
- `MONGODB_URI Required` → MONGODB_URI chưa được set hoặc sai
- `MongoError: Authentication failed` → MONGODB_URI sai username/password
- `Invalid token` → JWT_SECRET sai

**Cách fix:**
1. Xóa biến cũ
2. Add lại với value đúng
3. Redeploy

---

### 3. 🔐 CHƯA CHỌN ĐÚNG ENVIRONMENTS

Environment variables cần được set cho **Production**

**Cách kiểm tra:**
1. Settings → Environment Variables
2. Mỗi biến phải có badge: **Production**

**Cách fix:**
1. Click vào biến
2. Check: ✅ Production
3. Save
4. Redeploy

---

### 4. 📁 DEPLOYMENT Ở SAI ROOT DIRECTORY

Backend phải deploy từ thư mục `backend/`

**Cách kiểm tra:**
1. Settings → General
2. Xem "Root Directory": Phải là `backend`

**Cách fix nếu sai:**
1. Settings → General → Root Directory
2. Edit → Chọn `backend`
3. Save
4. Redeploy

---

### 5. 🌐 BACKEND URL SAI

Frontend có thể đang gọi sai backend URL

**Cách kiểm tra:**
1. Mở frontend app
2. F12 → Console
3. Thử login/register
4. Xem Network tab → Request URL

**Nếu Request URL không phải backend Vercel:**
1. Vào frontend project → Settings → Environment Variables
2. Check VITE_API_URL = đúng backend URL
3. Redeploy frontend

---

### 6. ⏰ CACHE CŨ

Vercel có thể đang dùng build cache cũ

**Cách fix:**
1. Deployments tab
2. Redeploy với **UNCHECK "Use existing Build Cache"**
3. Điều này force build lại hoàn toàn

---

## 🧪 CÁCH KIỂM TRA TỪNG BƯỚC:

### Test 1: Backend có env vars chưa?

**Chạy local script:**
```bash
cd backend
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET')"
```

Nhưng điều này chỉ test local `.env`, không test Vercel.

**Test Vercel:**
Vào Settings → Environment Variables → Count số biến:
- Backend: Phải có 7 biến
- Frontend: Phải có 2 biến

---

### Test 2: Backend API có hoạt động không?

**Mở browser:**
```
https://your-backend-url.vercel.app/health
```

**Nếu thấy:**
- ✅ `{"status":"healthy","database":"connected"}` → Backend OK
- ❌ `{"error":"..."}` → Backend có lỗi, xem error message
- ❌ `The deployment could not be found` → Backend không tồn tại
- ❌ Blank page → Deployment failed

**Nếu thấy lỗi:** Xem Runtime Logs để biết nguyên nhân

---

### Test 3: Xem Logs chi tiết

**Backend Logs:**
```
1. Backend project → Deployments
2. Click vào deployment mới nhất
3. Tab "Logs" → Runtime Logs
4. Tìm lỗi màu đỏ
```

**Các lỗi thường gặp trong logs:**
- `MongoNetworkError` → MONGODB_URI sai
- `JWT malformed` → JWT_SECRET sai
- `Cannot find module` → Build lỗi
- `Port 3000 is already in use` → Bỏ qua (Vercel tự assign port)

---

### Test 4: Test API trực tiếp

**Dùng cURL hoặc Postman:**
```bash
# Test health
curl https://your-backend-url.vercel.app/health

# Test login
curl -X POST https://your-backend-url.vercel.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@goodviet.com","password":"Demo123!"}'
```

**Nếu trả về JSON error:** Đọc error message để biết vấn đề

---

## 🔧 SOLUTIONS DỰA TRÊN TỪNG LỖI:

### Lỗi: "MongoServerError: Authentication failed"

**Nguyên nhân:** MONGODB_URI sai

**Fix:**
```
MONGODB_URI phải CHÍNH XÁC như sau (1 dòng, không có line break):

mongodb+srv://galamkhoahoctr_db_user:4VQsfyNTe6I3w4E3@glkh2.wtvyhjt.mongodb.net/goodviet?retryWrites=true&w=majority
```

---

### Lỗi: "Cannot connect to server" (Frontend)

**Nguyên nhân:** Frontend không kết nối được backend

**Fix:**
1. Check VITE_API_URL trong frontend env vars
2. Phải là: `https://your-backend-url.vercel.app` (KHÔNG có `/` cuối)
3. Redeploy frontend

---

### Lỗi: "CORS Error"

**Console:** `Access-Control-Allow-Origin`

**Fix:**
1. Backend env vars → CORS_ORIGIN
2. Set = `*` (cho phép tất cả) hoặc frontend URL cụ thể
3. Redeploy backend

---

### Lỗi: "Invalid token" hoặc "JWT malformed"

**Nguyên nhân:** JWT_SECRET sai hoặc thiếu

**Fix:**
```
JWT_SECRET = goodviet-super-secret-jwt-key-change-in-production-2024
```

---

### Lỗi: Build failed

**Xem Build Logs**, tìm dòng đầu tiên có "Error"

**Common issues:**
- `tsc: command not found` → Build command sai (xem phần Frontend)
- `Cannot find module` → Dependencies thiếu
- `Syntax error` → Code có lỗi

---

## 📋 ULTIMATE CHECKLIST:

### Backend:
- [ ] 7 environment variables đã được add
- [ ] Mỗi biến có badge "Production"
- [ ] Root Directory = `backend`
- [ ] Đã Redeploy sau khi add env vars
- [ ] Redeploy KHÔNG dùng cache
- [ ] Deployment status = Ready (xanh)
- [ ] /health trả về healthy
- [ ] Runtime Logs không có error

### Frontend:
- [ ] 2 environment variables đã được add
- [ ] VITE_API_URL = đúng backend URL
- [ ] VITE_USE_MOCK_API = false
- [ ] Root Directory = `.` (root)
- [ ] Build Command = `vite build`
- [ ] Đã Redeploy sau khi add env vars
- [ ] Deployment status = Ready
- [ ] App loads in browser

### Integration:
- [ ] Demo account đã tạo (node create-demo-account.js)
- [ ] CORS_ORIGIN cho phép frontend
- [ ] Frontend gọi đúng backend URL (check Network tab)
- [ ] Đăng ký/Login hoạt động

---

## 🚨 NẾU VẪN KHÔNG ĐƯỢC:

### Option 1: Tạo lại project từ đầu

Đôi khi Vercel cache quá nhiều, cách nhanh nhất là:
1. Delete project cũ
2. Tạo project mới
3. Set env vars trước khi deploy lần đầu

### Option 2: Gửi cho tôi thông tin debug

Hãy gửi cho tôi:
1. Screenshot Runtime Logs (backend)
2. Screenshot Console (frontend, F12)
3. Screenshot Network tab (khi login/register)
4. Backend URL
5. Số lượng env vars đã set

Tôi sẽ phân tích và tìm ra vấn đề cụ thể!

---

## 💡 TIP: Thứ tự debug

```
1. Verify env vars đã được set → Settings → Env Variables
2. Verify đã redeploy → Deployments → Check time
3. Test backend trực tiếp → /health endpoint
4. Xem logs → Runtime Logs
5. Test frontend → F12 Console + Network
```

**Làm theo thứ tự này sẽ tìm ra vấn đề nhanh hơn!**
