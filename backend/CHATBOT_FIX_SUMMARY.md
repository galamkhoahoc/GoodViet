# Tóm tắt: Sửa lỗi Chatbot - Gemini API vs Ollama

## Vấn đề ban đầu

❌ **Gemini API không hoạt động:**
- Model `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro` đều bị lỗi 404
- API key không hợp lệ hoặc không có quyền truy cập các model Gemini 1.5
- Chatbot trả về mock error message

## Nguyên nhân

1. **API Key không đúng/hết hạn:** API key có thể chỉ có quyền truy cập Gemma, không phải Gemini
2. **Model không tồn tại trong API version v1beta:** Tất cả các model Gemini đều trả về 404

## Giải pháp đã triển khai

### ✅ Solution 1: Tạo API Key mới (Đơn giản)

Nếu muốn dùng Gemini API:
1. Truy cập https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Cập nhật trong `backend/.env`:
   ```env
   GEMINI_API_KEY=your-new-api-key
   AI_SERVICE=gemini
   ```

### ✅ Solution 2: Dùng Ollama + Gemma (Khuyến nghị - Đã triển khai)

**Ưu điểm:**
- ✅ Miễn phí hoàn toàn
- ✅ Chạy offline
- ✅ Không giới hạn request
- ✅ Dữ liệu riêng tư (không gửi lên cloud)
- ✅ Không cần API key

**Nhược điểm:**
- ⚠️ Cần cài Ollama
- ⚠️ Cần 8-16GB RAM
- ⚠️ Response chậm hơn (2-10 giây vs 1-3 giây)
- ⚠️ Cần disk space (1-5GB)

## Code đã triển khai

### 1. Service mới:
- ✅ `backend/src/services/ollama.service.ts` - Tích hợp Ollama
- ✅ `backend/src/services/ai.service.ts` - Wrapper thống nhất (auto-switch)

### 2. Controller updated:
- ✅ `backend/src/controllers/chat.controller.ts` - Dùng `aiService` thay vì `geminiService`

### 3. Configuration:
- ✅ `backend/.env` - Thêm config cho Ollama:
  ```env
  AI_SERVICE=ollama
  OLLAMA_HOST=http://localhost:11434
  OLLAMA_MODEL=gemma:2b
  ```

### 4. Package installed:
- ✅ `npm install ollama` - Client cho Ollama

### 5. Documentation:
- ✅ `OLLAMA_INTEGRATION_GUIDE.md` - Hướng dẫn chi tiết
- ✅ `SETUP_OLLAMA.md` - Hướng dẫn cài đặt
- ✅ `setup-ollama.ps1` - Script tự động setup

## Cách sử dụng

### Option A: Dùng Ollama (Local - Đã config sẵn)

**Bước 1: Cài Ollama**
```powershell
# Chạy script tự động (khuyến nghị)
cd backend
.\setup-ollama.ps1
```

Hoặc manual:
1. Tải: https://ollama.com/download/windows
2. Cài đặt OllamaSetup.exe
3. Pull model: `ollama pull gemma:2b`
4. Verify: `ollama list`

**Bước 2: Start backend**
```bash
npm run dev
```

Bạn sẽ thấy:
```
🤖 AI Service: Using Ollama (Local Gemma)
✅ Ollama connected. Available models: gemma:2b
```

**Bước 3: Test**
- Mở frontend, vào trang Chat
- Gửi tin nhắn: "Xin chào"
- Bot sẽ trả lời bằng tiếng Việt (mất 2-5 giây)

### Option B: Dùng Gemini API (Cloud)

**Bước 1: Lấy API key mới**
1. Truy cập: https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Copy API key

**Bước 2: Cập nhật .env**
```env
AI_SERVICE=gemini
GEMINI_API_KEY=your-new-valid-api-key
```

**Bước 3: Restart backend**
```bash
npm run dev
```

Bạn sẽ thấy:
```
🤖 AI Service: Using Google Gemini API
```

### Option C: Auto-detect (Linh hoạt)

```env
AI_SERVICE=
```

Backend sẽ tự động:
1. Thử Ollama trước (nếu có)
2. Fallback về Gemini (nếu có API key hợp lệ)
3. Dùng mock response (nếu cả 2 không có)

## So sánh các phương án

| Tiêu chí | Ollama (gemma:2b) | Ollama (gemma:7b) | Gemini API |
|----------|-------------------|-------------------|------------|
| **Chi phí** | Miễn phí | Miễn phí | Có giới hạn quota |
| **Tốc độ** | 2-5s | 5-10s | 1-3s |
| **Chất lượng** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **RAM** | 8GB | 16GB | 0GB |
| **Disk** | 1.4GB | 4.8GB | 0GB |
| **Offline** | ✅ | ✅ | ❌ |
| **Setup** | Cần cài | Cần cài | Chỉ cần key |

## Khuyến nghị

### Cho Development (Hiện tại):
✅ **Dùng Ollama + gemma:2b**
- Miễn phí, không giới hạn
- Đủ tốt cho development
- Không lo về API quota

### Cho Production (Tương lai):
✅ **Dùng Gemini API với key hợp lệ**
- Nhanh hơn
- Chất lượng cao hơn
- Không cần infrastructure

### Hybrid (Linh hoạt):
✅ **Dùng cả hai với auto-fallback**
```env
AI_SERVICE=
```
- Ollama cho dev/testing
- Gemini cho production
- Auto-switch khi có vấn đề

## Trạng thái hiện tại

✅ **Code đã sẵn sàng** - Backend hỗ trợ cả Ollama và Gemini
⚠️ **Ollama chưa cài** - Cần chạy `setup-ollama.ps1` hoặc cài manual
⚠️ **Gemini API key không hợp lệ** - Cần tạo key mới nếu muốn dùng

## Next Steps

### Để chatbot hoạt động ngay:

**Option 1: Cài Ollama (5-15 phút, khuyến nghị)**
```powershell
cd backend
.\setup-ollama.ps1
```

**Option 2: Lấy Gemini API key mới (2 phút)**
1. Vào https://makersuite.google.com/app/apikey
2. Tạo key mới
3. Update vào `.env`
4. Đổi `AI_SERVICE=gemini`

## Test Commands

### Test Ollama (sau khi cài):
```bash
# Trong PowerShell
ollama list
ollama run gemma:2b "Xin chào"
```

### Test Backend:
```bash
# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"persistent-test@goodviet.com","password":"Test1234"}'

# Chat (thay YOUR_TOKEN)
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"Xin chào, bạn khỏe không?"}'
```

## Troubleshooting

### Ollama: "Service not available"
```bash
ollama serve
```

### Ollama: "Model not found"
```bash
ollama pull gemma:2b
```

### Gemini: 404 Not Found
- API key không hợp lệ
- Cần tạo key mới từ Google AI Studio

### Response chậm
- Dùng gemma:2b thay vì 7b
- Giảm num_predict trong code

## Files đã tạo

1. ✅ `backend/src/services/ollama.service.ts`
2. ✅ `backend/src/services/ai.service.ts`
3. ✅ `backend/OLLAMA_INTEGRATION_GUIDE.md`
4. ✅ `backend/SETUP_OLLAMA.md`
5. ✅ `backend/setup-ollama.ps1`
6. ✅ `backend/test-gemini-models.js`
7. ✅ `backend/CHATBOT_FIX_SUMMARY.md` (file này)

## Kết luận

🎉 **Backend đã sẵn sàng hỗ trợ cả Ollama và Gemini API**

Bạn chỉ cần chọn 1 trong 2:
1. **Cài Ollama** → Chạy `setup-ollama.ps1` → Miễn phí, offline
2. **Lấy Gemini key** → Update `.env` → Nhanh hơn, đơn giản hơn

Chatbot sẽ hoạt động ngay sau khi hoàn thành một trong hai phương án trên! 🚀
