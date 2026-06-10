# 🔧 SỬA LỖI BUILD FRONTEND TRÊN VERCEL

## ❌ LỖI HIỆN TẠI:
```
sh: line 1: tsc: command not found
Error: Command "npm run build" exited with 127
```

## 🎯 NGUYÊN NHÂN:
Build script `tsc -b && vite build` cần TypeScript compiler nhưng Vercel đang chạy lệnh cũ.

---

## ✅ CÁCH SỬA (2 OPTIONS):

### OPTION 1: Sửa Build Command trên Vercel Dashboard (NHANH)

1. **Vào Vercel Dashboard**: https://vercel.com/dashboard
2. **Chọn project frontend** của bạn
3. **Settings** → **General**
4. **Build & Development Settings**:
   ```
   Framework Preset: Vite
   Build Command: npm run build:vercel
   Output Directory: dist
   Install Command: npm install
   ```
5. **Save**
6. **Deployments** tab → Click **Redeploy** với option **Use existing Build Cache: OFF**

### OPTION 2: Xóa vercel.json và để Vercel auto-detect (KHUYÊN DÙNG)

Vercel có thể tự động detect Vite project tốt hơn nếu không có vercel.json.

**Bạn cần:**
1. Xóa file `vercel.json` ở thư mục gốc
2. Commit và push
3. Vercel sẽ tự động deploy với config đúng

---

## 🔄 THỰC HIỆN OPTION 2:

Tôi sẽ giúp bạn:

1. **Xóa vercel.json** (để Vercel auto-detect)
2. **Keep build:vercel script** trong package.json
3. **Set override trên Vercel Dashboard** nếu cần

---

## 📋 CHECKLIST SAU KHI SỬA:

- [ ] Build command = `npm run build:vercel` hoặc `vite build`
- [ ] Framework = Vite
- [ ] Output directory = dist
- [ ] Redeploy WITHOUT cache
- [ ] Check build logs → success
- [ ] Test frontend URL → app loads

---

## 🌐 SAU KHI DEPLOY THÀNH CÔNG:

### Set Environment Variables cho Frontend:

```
VITE_API_URL = https://glkh-good-viet-e1r4ix73b-ilikechickeneverytime-1859s-projects.vercel.app
VITE_USE_MOCK_API = false
```

### Update CORS trên Backend:

Sau khi có frontend URL (vd: `https://goodviet-frontend.vercel.app`), cập nhật backend:

```
CORS_ORIGIN = https://goodviet-frontend.vercel.app
```

Và **Redeploy backend**.

---

**Bạn muốn tôi thực hiện option nào?**
- Option 1: Hướng dẫn chi tiết sửa trên Dashboard
- Option 2: Xóa vercel.json và để auto-detect
