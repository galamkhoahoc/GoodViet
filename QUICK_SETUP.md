# ⚡ QUICK SETUP GUIDE

## 📋 CÁC FILE ĐÃ TẠO:

✅ `backend\.env` - Backend environment variables
✅ `.env` - Frontend environment variables (đã có)

---

## 🔧 CẦN LÀM NGAY:

### Bước 1: Lấy Gemini API Key (2 phút)

1. Mở: https://aistudio.google.com/app/apikey
2. Đăng nhập Google
3. Click **"Create API Key"**
4. Click **"Create API key in new project"**
5. **COPY KEY** (dạng: `AIzaSy...`)

### Bước 2: Điền vào backend\.env

Mở file: `backend\.env`

Tìm dòng:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

Thay bằng:
```
GEMINI_API_KEY=AIzaSy...  (paste key bạn vừa copy)
```

### Bước 3: Điền MongoDB URI (nếu cần)

**Option A: Dùng MongoDB Atlas (Production):**
Mở file: `backend\.env`

Tìm dòng:
```
MONGODB_URI=mongodb+srv://username:password@cluster...
```

Thay bằng connection string thật của bạn.

**Option B: Dùng MongoDB Local (Development):**
```
MONGODB_URI=mongodb://localhost:27017/goodviet
```

---

## 🚀 CHẠY ỨNG DỤNG:

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev
```

Chờ message: `🚀 Server running on http://localhost:3000`

### Terminal 2 - Frontend:
```bash
npm install
npm run dev
```

Chờ message: `Local: http://localhost:5173`

### Mở Browser:
```
http://localhost:5173
```

---

## ✅ TEST NGAY:

1. **Login** hoặc **Register**
2. Click **"Trò chuyện"**
3. Gõ: **"Xin chào"**
4. Bot phải trả lời! ✅

---

## 🌐 DEPLOY LÊN PRODUCTION:

### Bước 1: Add Gemini Key vào Vercel

1. Vào: https://vercel.com/dashboard
2. Chọn project: **goodviet-backend**
3. Settings → Environment Variables
4. Add:
   - Name: `GEMINI_API_KEY`
   - Value: (paste key)
   - Environments: ✅ ALL
5. Add:
   - Name: `AI_SERVICE`
   - Value: `gemini`
   - Environments: ✅ ALL

### Bước 2: Push Code

```bash
git add .
git commit -m "fix: add AI service fallback"
git push origin main
```

### Bước 3: Redeploy

Vercel → Deployments → Latest → "..." → Redeploy

---

## 🐛 TROUBLESHOOTING:

### Backend không start:
- Check MongoDB connection string
- Check Gemini API key đã điền chưa

### Bot không trả lời:
- Check Terminal backend có error không
- Check Gemini API key còn quota không

### Frontend không connect:
- Check backend đang chạy: http://localhost:3000/health
- Check `.env` có `VITE_API_URL=http://localhost:3000`

---

## 📞 CẦN HELP?

Chụp màn hình:
1. Terminal backend
2. Terminal frontend  
3. Browser console (F12)

Gửi cho tôi để debug!

---

**GOOD LUCK! 🚀**
