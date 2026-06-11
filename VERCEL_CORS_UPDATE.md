# CẬP NHẬT CORS CHO BACKEND

## Frontend URL đã deploy thành công:
`https://glkh-good-viet-w5ox.vercel.app`

## CẦN LÀM NGAY:

### 1. Cập nhật CORS_ORIGIN trên Backend Vercel:

1. Vào Vercel Dashboard
2. Chọn project **Backend** (`glkh-good-viet`)
3. Settings → Environment Variables
4. Tìm biến `CORS_ORIGIN`
5. **Thay giá trị từ:**
   ```
   *
   ```
   **Sang:**
   ```
   https://glkh-good-viet-w5ox.vercel.app
   ```
6. Click **Save**
7. Click **Redeploy** backend để áp dụng thay đổi

---

## TẠI SAO CẦN LÀM?

- Hiện tại backend đang cho phép CORS từ mọi nguồn (`*`) - **KHÔNG AN TOÀN cho production**
- Cần giới hạn chỉ cho phép requests từ frontend chính thức
- Bảo vệ API khỏi các requests không hợp lệ từ nguồn khác

---

## SAU KHI CẬP NHẬT:

✅ Frontend có thể gọi API bình thường
✅ Các nguồn khác sẽ bị chặn bởi CORS
✅ Bảo mật tốt hơn cho production

---

## URLs HOÀN CHỈNH:

- **Frontend**: https://glkh-good-viet-w5ox.vercel.app
- **Backend**: https://glkh-good-viet.vercel.app
- **Demo Account**: demo@goodviet.com / Demo123!
