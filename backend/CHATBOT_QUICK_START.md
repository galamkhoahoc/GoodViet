# 🤖 GOODVIET Chatbot - Quick Start Guide

## Tình trạng hiện tại

❌ **Chatbot chưa hoạt động** - Bot đang trả về mock error message  
✅ **Backend đã sẵn sàng** - Code đã được cập nhật để hỗ trợ Ollama + Gemini

## Chọn giải pháp của bạn

### 🆓 Option 1: Ollama (Local AI - KHUYẾN NGHỊ)

**Ưu điểm:**
- ✅ Hoàn toàn miễn phí
- ✅ Chạy offline
- ✅ Không giới hạn số lượng request
- ✅ Dữ liệu riêng tư (không gửi lên internet)

**Yêu cầu:**
- 💻 Windows 10/11
- 🧠 8GB RAM trở lên
- 💾 2GB disk space

**Cài đặt (5-15 phút):**

```powershell
# Bước 1: Chạy script tự động
cd backend
.\setup-ollama.ps1

# Script sẽ:
# - Kiểm tra Ollama đã cài chưa
# - Hướng dẫn cài nếu chưa có
# - Tải model Gemma
# - Test model

# Bước 2: Restart backend (nếu đang chạy)
# Backend sẽ tự động nhận diện Ollama
```

**Manual installation:**
```powershell
# 1. Tải Ollama
# Vào: https://ollama.com/download/windows
# Tải và cài OllamaSetup.exe

# 2. Cài model
ollama pull gemma:2b

# 3. Verify
ollama list

# 4. Start backend
npm run dev
```

---

### ☁️ Option 2: Gemini API (Cloud AI)

**Ưu điểm:**
- ✅ Không cần cài đặt gì
- ✅ Response nhanh hơn (1-3 giây)
- ✅ Chất lượng cao nhất

**Nhược điểm:**
- ⚠️ Cần API key hợp lệ
- ⚠️ Có giới hạn quota miễn phí

**Cài đặt (2 phút):**

```powershell
# Bước 1: Lấy API key
# Vào: https://makersuite.google.com/app/apikey
# Click "Create API Key"
# Copy API key

# Bước 2: Cập nhật backend/.env
# Mở file backend/.env và sửa:
AI_SERVICE=gemini
GEMINI_API_KEY=paste-your-new-api-key-here

# Bước 3: Restart backend
npm run dev
```

---

## Test Chatbot

### 1. Via Frontend (Recommended)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
npm run dev

# Mở browser: http://localhost:5173
# Login với: persistent-test@goodviet.com / Test1234
# Vào trang Chat
# Gửi: "Xin chào"
```

### 2. Via API (Testing)

```powershell
# Lấy token
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/users/login' -Method POST -Body '{"email":"persistent-test@goodviet.com","password":"Test1234"}' -ContentType 'application/json'
$token = $response.token

# Test chat
$body = '{"content":"Xin chào, bạn có thể giúp tôi cải thiện phát âm không?"}' 
$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $token"
}
$chat = Invoke-RestMethod -Uri 'http://localhost:3000/api/chat/messages' -Method POST -Body $body -Headers $headers

Write-Host "Bot response:" -ForegroundColor Cyan
Write-Host $chat.botMessage.content -ForegroundColor Green
```

---

## Kiểm tra trạng thái

### Backend logs bạn sẽ thấy:

**✅ Ollama đang hoạt động:**
```
🤖 AI Service: Using Ollama (Local Gemma)
✅ Ollama connected. Available models: gemma:2b
🚀 Server running on port 3000
```

**✅ Gemini API đang hoạt động:**
```
🤖 AI Service: Using Google Gemini API
🚀 Server running on port 3000
```

**⚠️ Chưa có AI service:**
```
🤖 AI Service: Using Ollama (Local Gemma)
⚠️ Ollama not available. Make sure Ollama is running
🚀 Server running on port 3000
```
→ Backend vẫn chạy nhưng bot sẽ trả về mock response

---

## Troubleshooting

### 🔴 "Ollama not available"

**Nguyên nhân:** Ollama chưa cài hoặc service không chạy

**Giải pháp:**
```bash
# Check nếu Ollama đã cài
ollama --version

# Nếu chưa cài, chạy script:
.\setup-ollama.ps1

# Nếu đã cài nhưng service không chạy:
ollama serve
```

### 🔴 "Model not found" 

**Nguyên nhân:** Chưa tải model Gemma

**Giải pháp:**
```bash
ollama pull gemma:2b
```

### 🔴 Gemini API: "404 Not Found"

**Nguyên nhân:** API key không hợp lệ hoặc hết hạn

**Giải pháp:**
1. Tạo API key mới: https://makersuite.google.com/app/apikey
2. Update vào `.env`
3. Restart backend

### 🔴 Response rất chậm (>20 giây)

**Nguyên nhân:** Model quá lớn hoặc RAM không đủ

**Giải pháp:**
```bash
# Dùng model nhỏ hơn
ollama pull gemma:2b  # thay vì gemma:7b

# Hoặc chuyển sang Gemini API (nhanh hơn)
# Đổi AI_SERVICE=gemini trong .env
```

---

## So sánh chi tiết

| Tính năng | Ollama (gemma:2b) | Gemini API |
|-----------|-------------------|------------|
| **Chi phí** | 🆓 Miễn phí | 🆓 Free tier (có giới hạn) |
| **Tốc độ** | 2-5 giây | 1-3 giây |
| **Chất lượng** | ⭐⭐⭐ Tốt | ⭐⭐⭐⭐⭐ Xuất sắc |
| **Offline** | ✅ Có | ❌ Không |
| **Setup** | Cần 5-15 phút | Cần 2 phút |
| **Privacy** | ✅ 100% local | ⚠️ Data gửi lên Google |
| **Giới hạn** | ❌ Không giới hạn | ⚠️ Có quota |
| **Phụ thuộc** | Cần Ollama chạy | Cần internet + API key |

---

## Khuyến nghị

### 🏗️ Development (Hiện tại):
→ **Dùng Ollama + gemma:2b**  
Lý do: Miễn phí, không giới hạn, đủ tốt cho dev/testing

### 🚀 Production (Sau này):
→ **Dùng Gemini API**  
Lý do: Nhanh hơn, chất lượng cao hơn, scale dễ dàng

### 🎯 Best of both:
→ **Dùng Auto-detect mode**
```env
AI_SERVICE=
```
Backend sẽ:
1. Thử Ollama trước (cho dev)
2. Fallback Gemini (cho production)
3. Mock response (nếu cả 2 fail)

---

## File tham khảo

- 📘 **CHATBOT_FIX_SUMMARY.md** - Tóm tắt chi tiết vấn đề và giải pháp
- 📗 **OLLAMA_INTEGRATION_GUIDE.md** - Hướng dẫn tích hợp Ollama
- 📙 **SETUP_OLLAMA.md** - Hướng dẫn cài đặt Ollama manual
- 🔧 **setup-ollama.ps1** - Script tự động setup

---

## TL;DR - Làm gì bây giờ?

### Nhanh nhất (2 phút) - Gemini API:
```
1. Vào: https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Update vào backend/.env
4. Đổi AI_SERVICE=gemini
5. npm run dev
```

### Tốt nhất (15 phút) - Ollama:
```
1. cd backend
2. .\setup-ollama.ps1
3. Làm theo hướng dẫn trong script
4. npm run dev
```

**Chatbot sẽ hoạt động ngay sau khi hoàn thành! 🎉**
