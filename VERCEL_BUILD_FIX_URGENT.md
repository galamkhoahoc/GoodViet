# 🚨 FIX LỖI BUILD VERCEL - URGENT

## ❌ LỖI:
```
sh: line 1: tsc: command not found
Error: Command "npm run build" exited with 127
```

Vercel đang pull commit cũ (d77fc83) thay vì commit mới (97a77a8).

---

## ✅ GIẢI PHÁP 1: Override Build Command (NHANH - 2 PHÚT)

### Bước 1: Vào Vercel Dashboard
https://vercel.com/dashboard

### Bước 2: Chọn Frontend Project
Click vào project: **glkh-good-viet-vu2r** (hoặc tên frontend của bạn)

### Bước 3: Settings → General
Scroll xuống **Build & Development Settings**

### Bước 4: Override Settings

Click **Override** và điền:

```
Framework Preset: Vite

Build Command: 
vite build

Output Directory:
dist

Install Command:
npm install
```

### Bước 5: Save và Redeploy

1. Click **Save**
2. Vào tab **Deployments**
3. Click **...** (3 dots) ở deployment mới nhất
4. Click **Redeploy**
5. ✅ **IMPORTANT**: Uncheck "Use existing Build Cache"
6. Click **Redeploy**

---

## ✅ GIẢI PHÁP 2: Push Code Mới (NẾU SOLUTION 1 KHÔNG WORK)

### Kiểm tra Git:
```bash
git status
git log --oneline -3
```

### Đảm bảo code đã được push:
```bash
git add .
git commit -m "Fix build command for Vercel"
git push origin main
```

### Trigger Redeploy:
Sau khi push, Vercel sẽ tự động deploy lại.

---

## 📸 HƯỚNG DẪN CHI TIẾT VỚI HÌNH ẢNH:

### Bước 1: Vercel Dashboard
<img src="screenshot" />
- Click vào project frontend

### Bước 2: Settings Tab
<img src="screenshot" />
- Click **Settings** ở top menu
- Click **General** ở sidebar

### Bước 3: Build & Development Settings
<img src="screenshot" />
Tìm phần **Build & Development Settings**

Bạn sẽ thấy:
```
Framework Preset: Vite
Build Command: npm run build [Override]
Output Directory: dist [Override]
Install Command: npm install [Override]
```

### Bước 4: Click Override cho Build Command
<img src="screenshot" />

Input box sẽ xuất hiện, nhập:
```
vite build
```

### Bước 5: Save
Click **Save** button

### Bước 6: Redeploy
- Tab **Deployments**
- Latest deployment → **...** menu
- **Redeploy**
- ✅ Uncheck "Use existing Build Cache"
- **Redeploy**

---

## 🎯 TẠI SAO CẦN LÀM VẬY?

1. **Code cũ trên GitHub**: Commit d77fc83 vẫn có `build: tsc -b && vite build`
2. **TypeScript ở devDependencies**: Vercel production không cài dev deps
3. **Override giúp**: Bỏ qua package.json, dùng command trực tiếp

---

## ✅ SAU KHI FIX:

Build logs sẽ hiển thị:
```
✓ 2341 modules transformed.
✓ built in 880ms
```

Và app sẽ chạy tại:
```
https://glkh-good-viet-vu2r.vercel.app
```

---

## 📋 CHECKLIST:

- [ ] Vào Vercel Dashboard
- [ ] Chọn frontend project
- [ ] Settings → General
- [ ] Override Build Command = `vite build`
- [ ] Save
- [ ] Redeploy without cache
- [ ] Wait for build success
- [ ] Test app URL

---

**THỜI GIAN DỰ KIẾN**: 2-3 phút

**BẠN CẦN LÀM NGAY BAY GIỜ!** 🚨
