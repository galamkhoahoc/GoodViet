# 🚀 HƯỚNG DẪN DEPLOY HOÀN CHỈNH - GOODVIET

## 📋 TỔNG QUAN:

Bạn cần deploy **2 projects riêng biệt** trên Vercel:
1. **Backend** (Node.js API - thư mục `backend/`)
2. **Frontend** (React/Vite - thư mục root)

---

## 🎯 PHẦN 1: DEPLOY BACKEND

### Bước 1: Tạo Backend Project trên Vercel

1. Vào: https://vercel.com/new
2. **Import Git Repository**: Chọn `duy-tk9/GLKH-GoodViet`
3. **Configure Project**:
   ```
   Project Name: goodviet-backend (hoặc tên bạn muốn)
   Framework Preset: Other
   Root Directory: backend  ← QUAN TRỌNG!
   ```
4. Click **"Edit"** bên cạnh Root Directory → Chọn `backend`

### Bước 2: Add Environment Variables cho Backend

Click **"Environment Variables"**, thêm **7 biến** này:

```
Name: MONGODB_URI
Value: mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority

Name: JWT_SECRET
Value: replace-with-at-least-32-random-characters

Name: GEMINI_API_KEY
Value: your-gemini-api-key

Name: AI_SERVICE
Value: gemini

Name: CORS_ORIGIN
Value: *

Name: NODE_ENV
Value: production

Name: PORT
Value: 3000
```

**Chọn**: ✅ Production, ✅ Preview, ✅ Development (cho tất cả)

### Bước 3: Deploy Backend

Click **"Deploy"** → Đợi 2-3 phút

### Bước 4: Test Backend

Sau khi deploy xong, lấy URL (ví dụ: `https://goodviet-backend-abc.vercel.app`)

Mở browser, test:
```
https://your-backend-url.vercel.app/health
```

**Mong đợi:** `{"status":"healthy","database":"connected"}`

---

## 🎨 PHẦN 2: DEPLOY FRONTEND

### Bước 1: Tạo Frontend Project trên Vercel

1. Vào: https://vercel.com/new
2. **Import Git Repository**: Chọn `duy-tk9/GLKH-GoodViet` (lần 2)
3. **Configure Project**:
   ```
   Project Name: goodviet-frontend (hoặc tên bạn muốn)
   Framework Preset: Vite
   Root Directory: ./  ← Root (thư mục gốc)
   Build Command: vite build
   Output Directory: dist
   ```

### Bước 2: Add Environment Variables cho Frontend

Click **"Environment Variables"**, thêm **2 biến**:

```
Name: VITE_API_URL
Value: https://your-backend-url.vercel.app
↑ Thay bằng backend URL thật của bạn!

Name: VITE_USE_MOCK_API
Value: false
```

**Chọn**: ✅ Production, ✅ Preview, ✅ Development

### Bước 3: Deploy Frontend

Click **"Deploy"** → Đợi 2-3 phút

### Bước 4: Update CORS trên Backend

Sau khi có frontend URL (ví dụ: `https://goodviet-frontend-xyz.vercel.app`):

1. Vào backend project → **Settings** → **Environment Variables**
2. Sửa `CORS_ORIGIN`:
   ```
   Old: *
   New: https://your-frontend-url.vercel.app
   ```
3. Save
4. Tab **Deployments** → **Redeploy** backend

---

## ✅ PHẦN 3: TEST ỨNG DỤNG

### Test 1: Backend Health Check
```
https://your-backend-url.vercel.app/health
→ {"status":"healthy","database":"connected"}
```

### Test 2: Frontend Loads
```
https://your-frontend-url.vercel.app
→ Trang login hiện ra
```

### Test 3: Đăng ký tài khoản mới

1. Click **"Đăng ký ngay"**
2. Điền thông tin:
   ```
   Họ tên: Test User
   Tuổi: 25
   Email: test@test.com
   SĐT: 0901234567
   Mật khẩu: Test123!
   Xác nhận: Test123!
   ```
3. Click **"Đăng ký"**
4. **Nếu thành công**: Chuyển sang Dashboard
5. **Nếu lỗi**: F12 → Console → Xem lỗi

### Test 4: Login với Demo Account

```
Email: demo@goodviet.com
Password: Demo123!
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot connect to server"

**Nguyên nhân**: Frontend không kết nối được backend

**Giải pháp**:
1. Check VITE_API_URL có đúng backend URL không
2. Mở backend URL xem có hoạt động không
3. Redeploy frontend sau khi sửa env vars

### Lỗi: "CORS Error"

**Console**: `Access-Control-Allow-Origin`

**Giải pháp**:
1. Backend env vars → CORS_ORIGIN = frontend URL
2. Redeploy backend

### Lỗi: "MONGODB_URI Required"

**Nguyên nhân**: Backend chưa có env vars

**Giải pháp**:
1. Backend → Settings → Environment Variables
2. Add đủ 7 biến
3. Redeploy

### Lỗi: Build failed - "tsc: command not found"

**Nguyên nhân**: Build command sai

**Giải pháp**:
1. Frontend → Settings → General
2. Build Command: `vite build` (không phải `npm run build`)
3. Redeploy

---

## 📊 CHECKLIST HOÀN CHỈNH

### Backend:
- [ ] Created backend project
- [ ] Root Directory = `backend`
- [ ] Added 7 environment variables
- [ ] Deployed successfully
- [ ] /health returns healthy
- [ ] Created demo account (`node create-demo-account.js`)

### Frontend:
- [ ] Created frontend project
- [ ] Root Directory = `.` (root)
- [ ] Framework = Vite
- [ ] Build Command = `vite build`
- [ ] Added 2 environment variables (VITE_API_URL, VITE_USE_MOCK_API)
- [ ] Deployed successfully
- [ ] App loads in browser

### Integration:
- [ ] Updated CORS_ORIGIN with frontend URL
- [ ] Redeployed backend
- [ ] Registration works
- [ ] Login works
- [ ] Chat works

---

## 📱 THÔNG TIN TÀI KHOẢN

### Demo Account:
```
Email: demo@goodviet.com
Password: Demo123!
```

### Tạo lại demo account (nếu cần):
```bash
cd backend
node create-demo-account.js
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành:

- ✅ Backend API: `https://goodviet-backend-xxx.vercel.app`
- ✅ Frontend App: `https://goodviet-frontend-xxx.vercel.app`
- ✅ Đăng ký tài khoản mới hoạt động
- ✅ Đăng nhập hoạt động
- ✅ Chat với AI bot hoạt động
- ✅ Upload audio hoạt động

---

## 💡 GHI CHÚ QUAN TRỌNG

1. **Root Directory** là điểm quan trọng nhất:
   - Backend: `backend/`
   - Frontend: `./` (root)

2. **Environment Variables** phải được set TRƯỚC KHI deploy

3. **CORS_ORIGIN** phải khớp với frontend URL (hoặc dùng `*` cho test)

4. **Build Command** cho frontend: `vite build` (không phải `npm run build`)

---

**Bạn đã sẵn sàng? Hãy bắt đầu từ PHẦN 1!**
