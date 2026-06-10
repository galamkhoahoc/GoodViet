# 🐛 DEBUG CHECKLIST - TÌM NGUYÊN NHÂN

## ❓ CÂU HỎI QUAN TRỌNG:

### 1. Backend Project có tồn tại trên Vercel không?

Vào: https://vercel.com/dashboard

Bạn có thấy **2 projects**:
- [ ] Frontend project (React/Vite)
- [ ] Backend project (Node.js API)

Nếu KHÔNG có backend project → Cần tạo mới!

---

### 2. Backend Environment Variables đã được set chưa?

Vào backend project → Settings → Environment Variables

Có đủ **7 biến** này không:
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] GEMINI_API_KEY
- [ ] AI_SERVICE
- [ ] CORS_ORIGIN
- [ ] NODE_ENV
- [ ] PORT

Nếu KHÔNG → Thêm vào!

---

### 3. Frontend có kết nối đúng Backend URL không?

Vào frontend project → Settings → Environment Variables

Có **2 biến** này không:
- [ ] VITE_API_URL = (Backend URL)
- [ ] VITE_USE_MOCK_API = false

Nếu KHÔNG → Thêm vào!

---

## 🔧 CÁCH KIỂM TRA NHANH:

### Test 1: Mở Backend URL trực tiếp

Mở browser, vào:
```
https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/
```

**Nếu thấy:**
- ✅ `{"message":"GoodViet API is running","version":"1.0.0"}` → Backend OK
- ❌ "The deployment could not be found" → Backend chưa tồn tại
- ❌ Lỗi khác → Backend có vấn đề

### Test 2: F12 Console trên Frontend

1. Mở app: https://your-frontend-url.vercel.app
2. F12 → Console tab
3. Thử đăng ký
4. Xem lỗi gì?

**Các lỗi thường gặp:**
- `Failed to fetch` → Không kết nối được backend
- `CORS error` → Backend chưa cho phép frontend domain
- `Network error` → Backend URL sai hoặc không tồn tại
- `500 Internal Server Error` → Backend lỗi code

### Test 3: Network Tab

1. F12 → Network tab
2. Thử đăng ký
3. Click vào request `/api/users/register`
4. Xem:
   - Request URL: Đúng không?
   - Status Code: Bao nhiêu?
   - Response: Lỗi gì?

---

## ✅ GIẢI PHÁP DỰA TRÊN TỪNG TRƯỜNG HỢP:

### Case 1: Backend chưa tồn tại trên Vercel

**Giải pháp**: Tạo backend project mới
1. Vercel Dashboard → New Project
2. Import GitHub repo: `duy-tk9/GLKH-GoodViet`
3. **Root Directory**: `backend`
4. Add 7 environment variables
5. Deploy

### Case 2: Backend tồn tại nhưng chưa có env vars

**Giải pháp**: Add environment variables
1. Backend project → Settings → Environment Variables
2. Add 7 biến (xem list ở trên)
3. Save
4. Redeploy

### Case 3: Frontend chưa có env vars

**Giải pháp**: Add frontend env vars
1. Frontend project → Settings → Environment Variables
2. Add VITE_API_URL và VITE_USE_MOCK_API
3. Save
4. Redeploy

### Case 4: CORS Error

**Giải pháp**: Update CORS_ORIGIN
1. Backend env vars → CORS_ORIGIN = `*` (tạm thời)
2. Hoặc: CORS_ORIGIN = `https://your-frontend-url.vercel.app`
3. Redeploy backend

---

## 🚨 HÀNH ĐỘNG NGAY BÂY GIỜ:

1. **Vào Vercel Dashboard**
2. **Đếm số projects**: Có 1 hay 2?
3. **Nếu có 2**: Check env vars của cả 2
4. **Nếu chỉ có 1**: Tạo backend project mới

**SAU ĐÓ CHO TÔI BIẾT:**
- Bạn có mấy projects trên Vercel?
- Backend URL là gì?
- Mở backend URL thấy gì?
