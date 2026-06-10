# ⚡ Quick Fix Checklist

## 🚨 URGENT: Fix "Route / not found" Error

### ✅ Đã Fix (Automated)
- [x] Added root endpoint to backend
- [x] Committed changes to Git
- [x] Pushed to GitHub (auto-deploy triggered)

### ⏳ Đang Chờ
- [ ] Vercel auto-deploy backend (1-2 phút)

### ⚠️ BẠN CẦN LÀM NGAY (5 phút)

## Step 1: Set Environment Variables

**Vào:** https://vercel.com/dashboard

1. Click vào project: **glkh-good-viet**
2. Click: **Settings** → **Environment Variables**
3. Add từng biến sau (click "Add New" mỗi lần):

```
Name: MONGODB_URI
Value: mongodb+srv://galamkhoahoctr_db_user:4VQsfyNTe6I3w4E3@glkh2.wtvyhjt.mongodb.net/goodviet?retryWrites=true&w=majority
Environment: ✓ Production

---

Name: JWT_SECRET
Value: goodviet-super-secret-jwt-key-change-in-production-2024
Environment: ✓ Production

---

Name: GEMINI_API_KEY
Value: AIzaSyAvgVxHx_wbHlMHZgmlsh0ttrDhrCEH15Q
Environment: ✓ Production

---

Name: AI_SERVICE
Value: gemini
Environment: ✓ Production

---

Name: CORS_ORIGIN
Value: *
Environment: ✓ Production

---

Name: NODE_ENV
Value: production
Environment: ✓ Production
```

4. Click "Save" sau mỗi biến

## Step 2: Redeploy

1. Click tab: **Deployments**
2. Click vào deployment mới nhất (nên thấy "Building..." hoặc "Ready")
3. Nếu đã "Ready": Click **"..."** → **Redeploy** (để apply env vars)
4. Nếu đang "Building": Đợi hoàn thành (1-2 phút)

## Step 3: Test

Sau 1-2 phút, test lại:

**Test 1: Root endpoint**
```
https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/
```

**Nên thấy:**
```json
{
  "name": "GoodViet API",
  "version": "1.0.0",
  "description": "Backend API for GoodViet...",
  "status": "running"
}
```

**Test 2: Health endpoint**
```
https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/health
```

**Nên thấy:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production"
}
```

---

## ✅ Success Indicators

Sau khi hoàn thành, bạn sẽ thấy:

- ✅ Root endpoint (`/`) trả về API info (không còn "Route not found")
- ✅ Health endpoint trả về "healthy"
- ✅ Không còn ZodError trong logs
- ✅ Backend sẵn sàng để frontend kết nối

---

## 🎯 Next: Deploy Frontend

Sau khi backend work, tiếp theo là deploy frontend:

**Xem hướng dẫn:** `VERCEL_FRONTEND_DEPLOY.md`

---

## 💡 Troubleshooting

### Vẫn thấy "Route not found"?
→ Đợi Vercel deploy xong (check tab Deployments)

### Thấy ZodError?
→ Chưa set environment variables → Back to Step 1

### Thấy "Service unavailable"?
→ MongoDB không connect được → Check MONGODB_URI đúng chưa

---

**ETA:** 5-7 phút để fix hoàn toàn ✅
