# Reset Rate Limit - Quick Guide

## ❌ Vấn đề
Rate limiting đang block registration (429 error).

## ✅ Giải pháp nhanh nhất (30 giây)

### Option 1: Restart Backend Server (Khuyến nghị)

Rate limit data lưu trong memory, restart server sẽ clear:

```bash
# Kill all node processes
Get-Process node | Stop-Process -Force

# Start backend again
npm run dev
```

Sau đó chạy test:
```bash
node test-all-features.js
```

### Option 2: Đợi 1 giờ

Rate limit sẽ tự động expire sau 1 giờ.

### Option 3: Temporarily disable rate limiting for testing

Edit `src/middleware/rateLimit.middleware.ts`:

```typescript
// Temporarily increase limits for testing
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100, // Changed from 3 to 100
  message: {
    error: 'Too many registration attempts',
    message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
  },
});
```

Save file, server will auto-restart (nodemon), then run test.

**Remember to change back to 3 after testing!**

### Option 4: Use existing test account

If you already created an account before rate limit hit, use it:

```javascript
// In test-all-features.js, change testUserRegistration() to use:
const testEmail = 'test1234567890@goodviet.com'; // An email you used before
```

## 🎯 Khuyến nghị

**Restart server** (Option 1) là nhanh nhất và không cần sửa code.

```powershell
# Run this in PowerShell
Get-Process node | Stop-Process -Force
cd backend
npm run dev
```

Wait for:
```
🚀 Server is running on port 3000
```

Then run:
```bash
node test-all-features.js
```

## ✅ Kết quả mong đợi

```
✅ Passed: 26
❌ Failed: 0
📊 Success Rate: 100%
```
