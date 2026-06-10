# 🚀 Hướng Dẫn Deploy GoodViet lên Vercel

## 📋 Tổng Quan

**Frontend**: Deploy trực tiếp lên Vercel (React/Vite)
**Backend**: Deploy lên Vercel với **Gemini API** (không thể dùng Gemma4/Ollama)

---

## ⚠️ Điều Kiện Tiên Quyết

### 1. Database: MongoDB Atlas
✅ **Đã có** - Connection string trong `.env`:
```
MONGODB_URI=mongodb+srv://galamkhoahoctr_db_user:...
```

### 2. AI Service: Gemini API
✅ **Đã có** - API key trong `.env`:
```
GEMINI_API_KEY=AIzaSyAvgVxHx_wbHlMHZgmlsh0ttrDhrCEH15Q
```

### 3. Vercel Account
📝 **Cần có** - Đăng ký tại: https://vercel.com

---

## 🎯 Bước 1: Chuẩn Bị Backend

### ✅ Đã Hoàn Thành (Tôi vừa làm):
- ✅ Tạo `vercel.json` configuration
- ✅ Thêm `vercel-build` script
- ✅ Đổi `AI_SERVICE=gemini` trong `.env`

### Xác Nhận Lại:

**1. Kiểm tra `backend/.env`:**
```env
AI_SERVICE=gemini  # MUST be gemini for Vercel
GEMINI_API_KEY=AIzaSyAvgVxHx_wbHlMHZgmlsh0ttrDhrCEH15Q
```

**2. Kiểm tra `backend/vercel.json` đã được tạo** ✅

**3. Test local trước:**
```bash
cd backend
npm run dev
# Verify it works with Gemini
```

---

## 🎯 Bước 2: Deploy Backend lên Vercel

### Cách 1: Deploy qua Vercel CLI (Khuyến Nghị)

**1. Cài Vercel CLI:**
```bash
npm install -g vercel
```

**2. Login Vercel:**
```bash
vercel login
```

**3. Deploy backend:**
```bash
cd backend
vercel
```

**4. Làm theo wizard:**
- Set up and deploy? **Y**
- Which scope? **Chọn account của bạn**
- Link to existing project? **N**
- What's your project's name? **goodviet-backend**
- In which directory is your code located? **./** (Enter)
- Want to modify settings? **N**

**5. Set environment variables:**
```bash
vercel env add MONGODB_URI
# Paste: mongodb+srv://galamkhoahoctr_db_user:4VQsfyNTe6I3w4E3@glkh2.wtvyhjt.mongodb.net/goodviet?retryWrites=true&w=majority

vercel env add JWT_SECRET
# Paste: goodviet-super-secret-jwt-key-change-in-production-2024

vercel env add GEMINI_API_KEY
# Paste: AIzaSyAvgVxHx_wbHlMHZgmlsh0ttrDhrCEH15Q

vercel env add AI_SERVICE
# Paste: gemini

vercel env add CORS_ORIGIN
# Paste: * (or your frontend URL)

vercel env add NODE_ENV
# Paste: production
```

**6. Deploy production:**
```bash
vercel --prod
```

**7. Note Backend URL:**
```
✅ Backend URL: https://goodviet-backend.vercel.app
```

---

### Cách 2: Deploy qua Vercel Dashboard

**1. Push code lên GitHub:**
```bash
# Trong thư mục gốc
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

**2. Import vào Vercel:**
- Đi tới: https://vercel.com/new
- Click: "Import Git Repository"
- Chọn repository: **goodviet**
- Root Directory: **backend**
- Framework Preset: **Other**
- Click: "Deploy"

**3. Configure Environment Variables:**
Sau khi import, đi tới: **Settings → Environment Variables**

Add các biến:
```
MONGODB_URI = mongodb+srv://galamkhoahoctr_db_user:4VQsfyNTe6I3w4E3@glkh2.wtvyhjt.mongodb.net/goodviet?retryWrites=true&w=majority
JWT_SECRET = goodviet-super-secret-jwt-key-change-in-production-2024
GEMINI_API_KEY = AIzaSyAvgVxHx_wbHlMHZgmlsh0ttrDhrCEH15Q
AI_SERVICE = gemini
CORS_ORIGIN = *
NODE_ENV = production
```

**4. Redeploy:**
Click "Redeploy" để apply environment variables

---

## 🎯 Bước 3: Deploy Frontend lên Vercel

### 1. Chuẩn Bị Frontend

**Update API URL trong frontend:**

Tìm file config (thường là `src/config.ts` hoặc `.env`):

```typescript
// src/config.ts
export const API_URL = import.meta.env.VITE_API_URL || 'https://goodviet-backend.vercel.app';
```

Hoặc tạo `.env.production`:
```env
VITE_API_URL=https://goodviet-backend.vercel.app
```

### 2. Deploy Frontend

**Cách 1: Vercel CLI**
```bash
cd frontend
vercel
vercel --prod
```

**Cách 2: Vercel Dashboard**
- Import repository (chọn root directory: **frontend**)
- Add environment variable: `VITE_API_URL`
- Deploy

---

## 🎯 Bước 4: Update CORS Settings

Sau khi deploy frontend, update CORS trong backend:

**1. Get Frontend URL:**
```
https://goodviet.vercel.app
```

**2. Update Backend Environment:**
```bash
# In Vercel Dashboard: Backend Project → Settings → Environment Variables
CORS_ORIGIN = https://goodviet.vercel.app
```

**3. Redeploy backend** để apply thay đổi

---

## ✅ Kiểm Tra Sau Deploy

### 1. Test Backend:
```bash
curl https://goodviet-backend.vercel.app/health
```

Kết quả mong đợi:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production"
}
```

### 2. Test Frontend:
- Mở: https://goodviet.vercel.app
- Thử đăng ký/đăng nhập
- Thử chat với bot

### 3. Check Logs:
- Vercel Dashboard → Project → Deployments → View Function Logs

---

## 🚨 Troubleshooting

### Lỗi: "Cannot connect to MongoDB"
**Giải pháp:**
- Vào MongoDB Atlas → Network Access
- Add IP Address: **0.0.0.0/0** (Allow from anywhere)

### Lỗi: "AI Service Unavailable"
**Giải pháp:**
- Kiểm tra `AI_SERVICE=gemini` trong env
- Kiểm tra `GEMINI_API_KEY` có đúng không
- Xem logs để verify Gemini được gọi

### Lỗi: "CORS Error"
**Giải pháp:**
- Update `CORS_ORIGIN` với frontend URL
- Redeploy backend

### Lỗi: "JWT Secret Missing"
**Giải pháp:**
- Add `JWT_SECRET` vào environment variables
- Redeploy

---

## 📊 So Sánh: Local vs Vercel

| Feature | Local | Vercel |
|---------|-------|--------|
| **AI Service** | Gemma4/Ollama/Gemini | ✅ Gemini only |
| **Database** | ✅ MongoDB Atlas | ✅ MongoDB Atlas |
| **Python Service** | ✅ Có thể chạy | ❌ Không hỗ trợ |
| **Cost** | Free | Free tier (limits apply) |
| **Performance** | Tùy máy | ✅ Fast (serverless) |
| **Scaling** | Manual | ✅ Auto-scaling |

---

## 💡 Lưu Ý Quan Trọng

### 1. Gemini API Limits (Free Tier)
- **60 requests/minute**
- **1500 requests/day**

Nếu vượt quota → upgrade lên paid plan

### 2. Vercel Free Tier Limits
- **100GB bandwidth/month**
- **Serverless functions: 10 second timeout**
- **No background workers**

### 3. Environment Variables Security
- ❌ **KHÔNG** commit `.env` file vào Git
- ✅ Set qua Vercel Dashboard hoặc CLI
- ✅ `.env` đã có trong `.gitignore`

### 4. Database Connection
- ✅ MongoDB Atlas hoạt động tốt với Vercel
- ✅ Connection pooling tự động
- ⚠️ Đảm bảo allow connections từ anywhere (0.0.0.0/0)

---

## 🎉 Hoàn Thành!

Sau khi deploy xong, bạn sẽ có:

- ✅ Backend API: `https://goodviet-backend.vercel.app`
- ✅ Frontend: `https://goodviet.vercel.app`
- ✅ Database: MongoDB Atlas (cloud)
- ✅ AI Service: Google Gemini API

**Production URLs:**
- Frontend: https://goodviet.vercel.app
- Backend API: https://goodviet-backend.vercel.app/api
- Health Check: https://goodviet-backend.vercel.app/health

---

## 📞 Need Help?

**Common Commands:**
```bash
# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>

# Link local to project
vercel link
```

**Support:**
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Gemini API: https://ai.google.dev/docs

---

## 🔄 CI/CD (Optional)

Vercel tự động deploy khi push code lên Git:

- **Push to `main`** → Deploy to Production
- **Push to other branch** → Deploy to Preview

Setup:
1. Connect GitHub repository to Vercel
2. Enable auto-deployments
3. Done! ✅
