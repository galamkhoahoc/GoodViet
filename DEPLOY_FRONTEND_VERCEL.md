# 🚀 Hướng dẫn Deploy Frontend lên Vercel

## ✅ Đã hoàn thành:

1. ✅ Đã sửa `.env` để kết nối tới backend Vercel
2. ✅ Đã tắt Mock API (`VITE_USE_MOCK_API=false`)
3. ✅ Đã tạo `vercel.json` cho frontend
4. ✅ Đã fix các lỗi TypeScript build

---

## 📋 CÁC BƯỚC DEPLOY FRONTEND:

### Bước 1: Commit và Push code

```bash
git add .
git commit -m "Configure frontend for Vercel deployment"
git push
```

### Bước 2: Deploy Frontend lên Vercel

#### Option A: Deploy qua Vercel Dashboard (Khuyên dùng)

1. Truy cập: https://vercel.com/new
2. Import project từ GitHub: `duy-tk9/GLKH-GoodViet`
3. **QUAN TRỌNG**: Chọn **Root Directory** = `/` (thư mục gốc, không phải `/backend`)
4. Framework Preset: **Vite** (auto-detect)
5. Build Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Environment Variables** (quan trọng):
   ```
   VITE_API_URL = https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app
   VITE_USE_MOCK_API = false
   ```

7. Click **Deploy**

#### Option B: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI (nếu chưa có)
npm install -g vercel

# Login
vercel login

# Deploy (từ thư mục gốc Web_proj, KHÔNG phải backend)
cd c:\Users\trand\Downloads\Web_proj
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? goodviet-frontend (hoặc tên bạn muốn)
# - In which directory is your code located? ./
# - Want to override settings? No
```

---

## 🔧 SAU KHI DEPLOY:

### 1. Cập nhật CORS trên Backend

Backend cần cho phép frontend domain mới:

**Cập nhật Environment Variable trên Vercel Backend:**

```
CORS_ORIGIN = https://your-frontend-url.vercel.app
```

Hoặc tạm thời dùng:
```
CORS_ORIGIN = *
```

Sau đó **Redeploy backend** trên Vercel.

### 2. Test các tính năng:

- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với tài khoản demo
- ✅ Chat với AI bot
- ✅ Upload audio và đánh giá phát âm

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP:

### Lỗi: "Cannot connect to server"
- **Nguyên nhân**: Backend chưa set environment variables
- **Giải pháp**: Set MONGODB_URI, JWT_SECRET, GEMINI_API_KEY trên Vercel Backend, sau đó redeploy

### Lỗi: CORS
- **Nguyên nhân**: Backend chưa cho phép frontend domain
- **Giải pháp**: Cập nhật CORS_ORIGIN trên backend Vercel

### Lỗi: 404 khi refresh trang
- **Nguyên nhân**: Vercel chưa cấu hình SPA routing
- **Giải pháp**: Đã fix trong `vercel.json` với rewrites rule

---

## 📱 TÀI KHOẢN DEMO:

```
Email:    demo@goodviet.com
Password: Demo123!
```

---

## 🔗 LINKS:

- **GitHub Repo**: https://github.com/duy-tk9/GLKH-GoodViet
- **Backend URL**: https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app
- **Frontend URL**: (sẽ có sau khi deploy)

---

## ✨ CHECKLIST:

- [ ] Commit và push code lên GitHub
- [ ] Deploy frontend lên Vercel
- [ ] Set environment variables cho frontend
- [ ] Cập nhật CORS_ORIGIN trên backend
- [ ] Test đăng ký và đăng nhập
- [ ] Test chat với AI
- [ ] Test upload audio

---

**Lưu ý**: Nếu bạn muốn test local trước khi deploy, đổi VITE_API_URL về `http://localhost:3000` và chạy backend local.
