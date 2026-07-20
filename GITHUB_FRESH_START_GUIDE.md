# 🚀 HƯỚNG DẪN DEPLOY GOODVIET - FRESH START

> **Mục tiêu:** Tạo mới hoàn toàn GitHub repo và deploy lên Vercel từ đầu, tránh mọi vấn đề về Git history và permissions.

---

## 📋 CHUẨN BỊ

### Thông tin cần có:
- ✅ Tài khoản GitHub của bạn
- ✅ Tài khoản Vercel đã liên kết với GitHub
- ✅ Code hiện tại trong folder `Web_proj`

### Thời gian ước tính: 20-30 phút

---

## BƯỚC 1️⃣: TẠO GITHUB REPOSITORY MỚI

### 1.1. Tạo repo mới trên GitHub

1. Vào https://github.com/new
2. **Repository name**: `GoodViet-App` (hoặc tên bạn thích)
3. **Description**: `GoodViet - Ứng dụng học phát âm tiếng Việt với AI`
4. **Visibility**: 
   - **Private** nếu muốn code riêng tư
   - **Public** nếu muốn chia sẻ
5. ⚠️ **QUAN TRỌNG**: KHÔNG tick vào:
   - ❌ "Add a README file"
   - ❌ "Add .gitignore"
   - ❌ "Choose a license"
6. Click **Create repository**

### 1.2. Copy URL repo mới

Sau khi tạo, bạn sẽ thấy URL dạng:
```
https://github.com/<your-username>/GoodViet-App.git
```

**Lưu URL này lại!** (Sẽ dùng ở bước tiếp theo)

---

## BƯỚC 2️⃣: PUSH CODE LOCAL LÊN GITHUB MỚI

### 2.1. Mở Terminal trong folder Web_proj

```bash
cd C:\Users\trand\Downloads\Web_proj
```

### 2.2. Xóa Git remote cũ

```bash
git remote remove origin
```

### 2.3. Thêm Git remote mới

**THAY `<your-username>` bằng username GitHub thật của bạn!**

```bash
git remote add origin https://github.com/<your-username>/GoodViet-App.git
```

**Ví dụ:** Nếu username của bạn là `johndoe`:
```bash
git remote add origin https://github.com/johndoe/GoodViet-App.git
```

### 2.4. Kiểm tra branch hiện tại

```bash
git branch
```

Nếu không phải `main`, đổi sang `main`:
```bash
git branch -M main
```

### 2.5. Push code lên GitHub mới

```bash
git push -u origin main
```

**Nếu gặp lỗi "failed to push"**, dùng force push:
```bash
git push -u origin main --force
```

### ✅ Xác nhận thành công:
- Vào `https://github.com/<your-username>/GoodViet-App`
- Kiểm tra thấy code đã được push lên

---

## BƯỚC 3️⃣: XÓA CÁC PROJECT CŨ TRÊN VERCEL (NẾU CÓ)

### 3.1. Xóa Frontend cũ

1. Vào https://vercel.com/dashboard
2. Tìm project frontend cũ (ví dụ: `glkh-good-viet-w5ox`)
3. Click vào project → **Settings** (thanh bên trái)
4. Scroll xuống dưới cùng → **Delete Project**
5. Gõ tên project để confirm → Click **Delete**

### 3.2. Xóa Backend cũ

1. Tìm project backend cũ (ví dụ: `glkh-good-viet`)
2. Click vào project → **Settings**
3. Scroll xuống dưới cùng → **Delete Project**
4. Gõ tên project để confirm → Click **Delete**

### ✅ Xác nhận: Dashboard Vercel giờ sạch sẽ, không có project cũ

---

## BƯỚC 4️⃣: DEPLOY BACKEND LÊN VERCEL

### 4.1. Tạo project Backend mới

1. Vào https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Tìm repo mới: `<your-username>/GoodViet-App`
4. Click **Import**

### 4.2. Cấu hình Backend

| Setting | Value |
|---------|-------|
| **Project Name** | `goodviet-backend` |
| **Framework Preset** | Other |
| **Root Directory** | Click **Edit** → chọn **`backend`** |
| **Build Command** | `npm run build` (mặc định) |
| **Output Directory** | `dist` (mặc định) |
| **Install Command** | `npm install` (mặc định) |

### 4.3. Thêm Environment Variables cho Backend

Click **Environment Variables**, thêm từng biến sau:

| Name | Value | Environments |
|------|-------|--------------|
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority` | ✅ Production<br>✅ Preview<br>✅ Development |
| `JWT_SECRET` | `replace-with-at-least-32-random-characters` | ✅ Production<br>✅ Preview<br>✅ Development |
| `GEMINI_API_KEY` | `your-gemini-api-key` | ✅ Production<br>✅ Preview<br>✅ Development |
| `AI_SERVICE` | `gemini` | ✅ Production<br>✅ Preview<br>✅ Development |
| `CORS_ORIGIN` | `*` | ✅ Production<br>✅ Preview<br>✅ Development |
| `NODE_ENV` | `production` | ✅ Production<br>✅ Preview<br>✅ Development |
| `PORT` | `3000` | ✅ Production<br>✅ Preview<br>✅ Development |

**Lưu ý:** `CORS_ORIGIN` tạm để `*`, sẽ update sau khi có frontend URL

### 4.4. Deploy Backend

1. Click **Deploy**
2. Đợi 2-3 phút để build
3. ✅ Thành công khi thấy "Congratulations!" và có URL

### 4.5. Copy Backend URL

Ví dụ: `https://goodviet-backend.vercel.app`

**LƯU URL NÀY LẠI!** (Sẽ dùng cho Frontend)

### 4.6. Test Backend

1. Vào `https://goodviet-backend.vercel.app/health`
2. Phải thấy JSON response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production",
  "storage": "MongoDB GridFS"
}
```

✅ **Backend đã chạy thành công!**

---

## BƯỚC 5️⃣: DEPLOY FRONTEND LÊN VERCEL

### 5.1. Tạo project Frontend mới

1. Vào https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Tìm repo: `<your-username>/GoodViet-App`
4. Click **Import**

### 5.2. Cấu hình Frontend

| Setting | Value |
|---------|-------|
| **Project Name** | `goodviet-frontend` |
| **Framework Preset** | **Vite** |
| **Root Directory** | `./` (mặc định - không thay đổi) |
| **Build Command** | `vite build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` (mặc định) |

### 5.3. Thêm Environment Variables cho Frontend

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_URL` | `https://goodviet-backend.vercel.app` **(URL backend ở bước 4.5)** | ✅ Production<br>✅ Preview<br>✅ Development |
| `VITE_USE_MOCK_API` | `false` | ✅ Production<br>✅ Preview<br>✅ Development |

**⚠️ QUAN TRỌNG:** Đảm bảo `VITE_API_URL` là URL backend thật của bạn!

### 5.4. Deploy Frontend

1. Click **Deploy**
2. Đợi 2-3 phút để build
3. ✅ Thành công khi thấy "Congratulations!" và có URL

### 5.5. Copy Frontend URL

Ví dụ: `https://goodviet-frontend.vercel.app`

**LƯU URL NÀY LẠI!**

---

## BƯỚC 6️⃣: CẬP NHẬT CORS CHO BACKEND

### 6.1. Update CORS_ORIGIN

1. Vào project **Backend** trên Vercel
2. Click **Settings** → **Environment Variables**
3. Tìm biến `CORS_ORIGIN`
4. Click **Edit** (icon bút chì)
5. **Thay giá trị từ `*` sang Frontend URL**, ví dụ:
   ```
   https://goodviet-frontend.vercel.app
   ```
6. Đảm bảo chọn: ✅ Production, ✅ Preview, ✅ Development
7. Click **Save**

### 6.2. Redeploy Backend

1. Click tab **Deployments** (ở trên cùng)
2. Tìm deployment **đang chạy** (màu xanh, status "Ready")
3. Click nút **⋯** (3 chấm) bên cạnh
4. Chọn **Redeploy**
5. Trong popup, click **Redeploy**
6. Đợi 1-2 phút để redeploy xong

✅ **CORS đã được cấu hình đúng!**

---

## BƯỚC 7️⃣: TEST ỨNG DỤNG

### 7.1. Test Frontend

1. Vào Frontend URL: `https://goodviet-frontend.vercel.app`
2. Phải thấy trang Login/Register

### 7.2. Test Login với Demo Account

**Tài khoản demo:**
- Email: `demo@goodviet.com`
- Password: `Demo123!`

1. Click **Login**
2. Nhập email và password
3. Click **Đăng nhập**
4. ✅ Phải vào được Dashboard

### 7.3. Test Chat AI

1. Click vào **Chat** trong menu
2. Gõ câu hỏi bằng tiếng Việt, ví dụ: "Chào bạn!"
3. ✅ AI phải trả lời bằng tiếng Việt (3-5 câu)

### 7.4. Test các tính năng khác

- ✅ **Assessment**: Làm bài đánh giá phát âm
- ✅ **Practice**: Xem lộ trình luyện tập
- ✅ **Expert**: Xem danh sách chuyên gia
- ✅ **Profile**: Xem hồ sơ cá nhân

---

## 🎉 HOÀN THÀNH!

### 📌 Thông tin quan trọng:

| Item | URL/Info |
|------|----------|
| **GitHub Repo** | `https://github.com/<your-username>/GoodViet-App` |
| **Backend API** | `https://goodviet-backend.vercel.app` |
| **Frontend App** | `https://goodviet-frontend.vercel.app` |
| **Demo Account** | `demo@goodviet.com` / `Demo123!` |

### ✅ Checklist cuối cùng:

- [x] GitHub repo mới đã tạo
- [x] Code đã push lên GitHub
- [x] Backend deployed thành công
- [x] Frontend deployed thành công
- [x] CORS đã cấu hình đúng
- [x] Đã test login và chat

---

## ⚠️ NẾU GẶP VẤN ĐỀ

### Backend build failed:
- **Kiểm tra:** Root Directory phải là `backend`
- **Kiểm tra:** Tất cả 7 environment variables đã add đủ chưa

### Frontend build failed:
- **Kiểm tra:** Root Directory phải là `./`
- **Kiểm tra:** Build Command phải là `vite build`

### API không kết nối (CORS error):
- **Kiểm tra:** `VITE_API_URL` ở frontend có đúng URL backend không
- **Kiểm tra:** `CORS_ORIGIN` ở backend có đúng URL frontend không
- **Giải pháp:** Update lại và redeploy cả 2 projects

### Login thất bại:
- **Kiểm tra:** Backend health endpoint `/health` có chạy không
- **Kiểm tra:** `MONGODB_URI` có đúng không
- **Kiểm tra:** Network tab trong DevTools có lỗi gì không

---

## 📚 LƯU Ý QUAN TRỌNG

1. **Không để collaborator commit trực tiếp:** Để tránh lỗi "commit author blocked", chỉ bạn (chủ repo) nên commit và push code.

2. **Update environment variables:** Nếu cần update biến môi trường:
   - Settings → Environment Variables → Edit → Save
   - **PHẢI Redeploy** để áp dụng thay đổi

3. **Custom domain (tùy chọn):** Có thể add custom domain trong Settings → Domains

4. **Monitoring:** Kiểm tra logs trong tab **Logs** để debug

---

## 🚀 BƯỚC TIẾP THEO (TÙY CHỌN)

- **Analytics:** Enable Web Analytics trong Settings
- **Custom Domain:** Add domain riêng cho frontend
- **Environment Protection:** Bật protection cho Production environment
- **Monitoring:** Setup alerts cho errors

---

**Chúc mừng bạn đã deploy thành công ứng dụng GoodViet!** 🎊
