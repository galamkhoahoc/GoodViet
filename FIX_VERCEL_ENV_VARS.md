# 🔧 CẤU HÌNH ENVIRONMENT VARIABLES TRÊN VERCEL

## ⚠️ VẤN ĐỀ:
Backend trên Vercel đang báo lỗi `ZodError: MONGODB_URI Required` vì chưa có environment variables.

---

## ✅ CÁCH SỬA (QUAN TRỌNG):

### Bước 1: Vào Vercel Dashboard

1. Truy cập: https://vercel.com/dashboard
2. Chọn project **backend** của bạn
3. Click **Settings** → **Environment Variables**

### Bước 2: Thêm các biến sau:

```
MONGODB_URI = mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority

JWT_SECRET = replace-with-at-least-32-random-characters

GEMINI_API_KEY = your-gemini-api-key

AI_SERVICE = gemini

CORS_ORIGIN = *

NODE_ENV = production

PORT = 3000
```

### Bước 3: Chọn Environment

Cho mỗi variable, chọn: ✅ **Production, Preview, Development**

### Bước 4: Redeploy

1. Quay lại tab **Deployments**
2. Click **...** (3 dots) ở deployment mới nhất
3. Click **Redeploy**
4. Chờ deploy xong

---

## 🧪 TEST SAU KHI SET:

### Test 1: Health Check
```
https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/health
```

**Kết quả mong đợi:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Test 2: Root Endpoint
```
https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/
```

**Kết quả mong đợi:**
```json
{
  "message": "GoodViet API is running",
  "version": "1.0.0"
}
```

### Test 3: Login với Demo Account

**URL:** `POST /api/users/login`

**Body:**
```json
{
  "email": "demo@goodviet.com",
  "password": "Demo123!"
}
```

**Kết quả mong đợi:**
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

---

## 📸 HÌNH ẢNH HƯỚNG DẪN:

1. **Vercel Dashboard** → Chọn project backend
2. **Settings** tab → **Environment Variables**
3. **Add New** → Nhập tên và giá trị
4. Chọn **Production + Preview + Development**
5. Click **Save**
6. **Deployments** tab → **Redeploy**

---

## ❓ NẾU VẪN LỖI:

### Kiểm tra logs:
1. Vào **Deployments**
2. Click vào deployment mới nhất
3. Xem **Runtime Logs**
4. Tìm lỗi cụ thể

### Lỗi thường gặp:

**"MONGODB_URI Required"**
→ Chưa set env vars hoặc chưa redeploy

**"MongoError: Authentication failed"**
→ Sai MONGODB_URI

**"Invalid JWT"**
→ Sai JWT_SECRET

**"CORS Error"**
→ Cần cập nhật CORS_ORIGIN với URL frontend

---

## 📋 CHECKLIST:

- [ ] Đã set tất cả 7 environment variables
- [ ] Đã chọn Production + Preview + Development
- [ ] Đã click Save cho mỗi variable
- [ ] Đã Redeploy backend
- [ ] Test /health endpoint → status: healthy
- [ ] Test / endpoint → có message
- [ ] Test login với demo account

---

**LƯU Ý**: Sau khi set environment variables, bạn **PHẢI REDEPLOY** thì mới có hiệu lực!
