# 🧪 TEST ỨNG DỤNG ĐÃ DEPLOY

## 🌐 URLs:

**Frontend**: https://glkh-good-viet-vu2r.vercel.app  
**Backend**: https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app

---

## ✅ TEST 1: Backend Health Check

```bash
curl https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/health
```

**Mong đợi:**
```json
{"status":"healthy","database":"connected"}
```

**Nếu lỗi:**
- Chưa set MONGODB_URI → Set env vars và redeploy

---

## ✅ TEST 2: Backend Root Endpoint

```bash
curl https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/
```

**Mong đợi:**
```json
{"message":"GoodViet API is running","version":"1.0.0"}
```

---

## ✅ TEST 3: Login API

```bash
curl -X POST https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@goodviet.com","password":"Demo123!"}'
```

**Mong đợi:**
```json
{
  "user": {
    "id": "...",
    "email": "demo@goodviet.com",
    "fullName": "Demo User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Nếu lỗi:**
- `MONGODB_URI Required` → Chưa set env vars
- `Invalid credentials` → Chạy lại create-demo-account.js
- `CORS error` → Chưa set CORS_ORIGIN

---

## ✅ TEST 4: Frontend App

1. **Mở browser**: https://glkh-good-viet-vu2r.vercel.app
2. **Mở Developer Tools** (F12)
3. **Vào tab Console** → Xem lỗi (nếu có)
4. **Vào tab Network** → Xem API calls

### Test Login:
1. Click **"Đăng nhập"**
2. Nhập:
   ```
   Email: demo@goodviet.com
   Password: Demo123!
   ```
3. Click **"Đăng nhập"**

**Nếu thành công**: Chuyển sang Dashboard  
**Nếu lỗi**:
- Xem Console → Có thể là CORS error
- Xem Network → API call failed?

---

## 🐛 CÁC LỖI THƯỜNG GẶP:

### Lỗi 1: "Cannot connect to server"
**Console**: `Failed to fetch` hoặc `Network error`

**Nguyên nhân**: Frontend không kết nối được backend

**Giải pháp**:
1. Check VITE_API_URL trong frontend env vars
2. Check backend có chạy không (test /health)

### Lỗi 2: CORS Error
**Console**: `Access-Control-Allow-Origin` error

**Nguyên nhân**: Backend chưa cho phép frontend domain

**Giải pháp**:
1. Vào backend Settings → Env vars
2. Set `CORS_ORIGIN = https://glkh-good-viet-vu2r.vercel.app`
3. Redeploy backend

### Lỗi 3: "Invalid credentials"
**Response**: 401 Unauthorized

**Nguyên nhân**: Tài khoản chưa đúng hoặc chưa tạo

**Giải pháp**:
```bash
cd backend
node create-demo-account.js
```

### Lỗi 4: "MONGODB_URI Required"
**Console**: ZodError

**Nguyên nhân**: Backend chưa có env vars

**Giải pháp**:
1. Set tất cả env vars (xem FIX_VERCEL_ENV_VARS.md)
2. Redeploy backend

---

## 📋 CHECKLIST ĐỂ APP HOẠT ĐỘNG:

### Backend:
- [ ] Set MONGODB_URI
- [ ] Set JWT_SECRET
- [ ] Set GEMINI_API_KEY
- [ ] Set AI_SERVICE=gemini
- [ ] Set CORS_ORIGIN (frontend URL hoặc *)
- [ ] Set NODE_ENV=production
- [ ] Redeploy

### Frontend:
- [ ] Set VITE_API_URL (backend URL)
- [ ] Set VITE_USE_MOCK_API=false
- [ ] Redeploy

### Database:
- [ ] Demo account đã tạo
- [ ] Test login script OK

---

## 🎯 QUICK FIX - Nếu không login được:

**Option 1**: Test bằng cURL trước để xem backend có hoạt động không

**Option 2**: Tạm thời set `CORS_ORIGIN = *` để test

**Option 3**: Check browser console để xem lỗi cụ thể

---

**Bạn đang gặp lỗi gì cụ thể? Hãy:**
1. Mở https://glkh-good-viet-vu2r.vercel.app
2. F12 → Console
3. Thử login
4. Chụp màn hình lỗi và gửi cho tôi
