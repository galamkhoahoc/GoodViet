# 🎨 Deploy Frontend GoodViet lên Vercel

## 📋 Tổng Quan

Bạn đã deploy backend thành công. Bây giờ cần deploy frontend (React/Vite).

**Backend URL:** https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app

---

## 🎯 Bước 1: Chuẩn Bị Frontend

### 1.1 Tìm Frontend Directory

Frontend thường nằm ở:
- `frontend/` 
- `client/`
- `web/`
- Hoặc có thể là một repository riêng

Hãy kiểm tra:

```powershell
# Kiểm tra structure
ls
```

### 1.2 Tạo Environment Configuration

**Tạo file `.env.production` trong frontend:**

```env
VITE_API_URL=https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app
```

Hoặc nếu dùng Create React App:

```env
REACT_APP_API_URL=https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app
```

### 1.3 Update API Configuration

**Tìm file config (thường là `src/config.ts` hoặc `src/utils/api.ts`):**

```typescript
// src/config.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// hoặc
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

---

## 🎯 Bước 2: Deploy Frontend lên Vercel

### Cách 1: Vercel Dashboard (Khuyến Nghị)

**1. Đi tới Vercel Dashboard:**
- https://vercel.com/new

**2. Import Git Repository:**
- Click: "Add New Project"
- Chọn GitHub repository (nếu đã kết nối)
- Hoặc import từ Git URL

**3. Configure Project:**
```
Project Name: goodviet-frontend
Framework Preset: Vite (hoặc React)
Root Directory: frontend (nếu frontend ở subfolder)
Build Command: npm run build (hoặc yarn build)
Output Directory: dist (Vite) hoặc build (CRA)
Install Command: npm install
```

**4. Add Environment Variables:**
```
VITE_API_URL = https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app
```

**5. Click "Deploy"**

---

### Cách 2: Vercel CLI (Nhanh)

```powershell
# Trong thư mục frontend
cd frontend

# Login (nếu chưa)
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? goodviet-frontend
# - Directory? ./
# - Override settings? N

# Deploy to production
vercel --prod
```

---

## 🎯 Bước 3: Update CORS Settings

Sau khi có frontend URL (ví dụ: `https://goodviet-frontend.vercel.app`):

**1. Update Backend Environment:**

Vào Vercel Dashboard → Backend Project → Settings → Environment Variables:

```
CORS_ORIGIN = https://goodviet-frontend.vercel.app
```

**2. Redeploy Backend:**
- Deployments tab
- Click "..." trên deployment mới nhất
- Click "Redeploy"

---

## 🎯 Bước 4: Test Integration

### 4.1 Test Backend API

```bash
curl https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app/health
```

Kết quả mong đợi:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production"
}
```

### 4.2 Test Frontend

1. Mở: https://goodviet-frontend.vercel.app
2. Thử đăng ký/đăng nhập
3. Thử chat với bot
4. Kiểm tra Network tab trong DevTools

---

## 🚨 Troubleshooting

### Lỗi: "Cannot connect to backend"

**Nguyên nhân:** Frontend không kết nối được với backend

**Giải pháp:**
1. Kiểm tra `VITE_API_URL` có đúng không
2. Kiểm tra CORS_ORIGIN trong backend có frontend URL không
3. Xem Console logs và Network tab

### Lỗi: "CORS policy blocked"

**Nguyên nhân:** Backend chưa allow frontend origin

**Giải pháp:**
```
Backend Environment Variable:
CORS_ORIGIN = https://your-frontend-url.vercel.app
```

Redeploy backend.

### Lỗi: "404 Not Found" khi refresh

**Nguyên nhân:** React Router cần rewrite rules

**Giải pháp:** Tạo `vercel.json` trong frontend:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📊 Structure Sau Khi Deploy

```
Backend:
├─ URL: https://glkh-good-viet-e1r4ix73b...vercel.app
├─ Routes:
│  ├─ /health ✅
│  ├─ / ✅ (API info)
│  ├─ /api/users/*
│  ├─ /api/chat/*
│  └─ /api/audio/*
└─ Environment Variables: ✅ Set

Frontend:
├─ URL: https://goodviet-frontend.vercel.app
├─ API Config: Points to backend ✅
└─ Environment Variables: VITE_API_URL ✅
```

---

## 💡 Best Practices

### 1. Sử dụng Custom Domain (Optional)

Thay vì URL dài của Vercel:
- Backend: `api.goodviet.com`
- Frontend: `goodviet.com`

### 2. Set Up CI/CD

Vercel tự động deploy khi:
- Push to `main` branch → Production
- Push to other branches → Preview

### 3. Monitor Performance

- Vercel Analytics (miễn phí)
- Check deployment logs
- Monitor API response times

---

## 🎉 Hoàn Thành!

Sau khi hoàn thành, bạn sẽ có:

- ✅ Backend API running on Vercel
- ✅ Frontend app running on Vercel
- ✅ MongoDB Atlas (database)
- ✅ Gemini API (AI service)
- ✅ CORS configured correctly
- ✅ Environment variables set
- ✅ Auto-deployment on Git push

---

## 📞 Cần Giúp Đỡ?

Nếu bạn gặp vấn đề:
1. Check Vercel deployment logs
2. Check browser Console and Network tabs
3. Verify environment variables
4. Test backend endpoints directly

---

## 📝 Quick Commands Reference

```bash
# Deploy frontend
cd frontend
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Check environment variables
vercel env ls

# Pull latest deployment
vercel pull
```
