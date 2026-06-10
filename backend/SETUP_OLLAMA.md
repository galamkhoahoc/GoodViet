# Hướng dẫn cài đặt Ollama với Gemma Model

## Bước 1: Cài đặt Ollama trên Windows

### Tải và cài đặt:
1. Truy cập: https://ollama.com/download/windows
2. Tải file `OllamaSetup.exe`
3. Chạy installer và làm theo hướng dẫn
4. Ollama sẽ tự động chạy như Windows Service

### Kiểm tra cài đặt:
```bash
# Mở Command Prompt hoặc PowerShell
ollama --version
# Kết quả: ollama version is x.x.x
```

## Bước 2: Tải model Gemma

### Option 1: Gemma 2B (Khuyến nghị - nhanh, nhẹ)
```bash
ollama pull gemma:2b
```
- Kích thước: ~1.4GB
- RAM yêu cầu: 8GB
- Tốc độ: Rất nhanh (2-5 giây/response)
- Chất lượng: Tốt cho chatbot

### Option 2: Gemma 7B (Chất lượng cao hơn)
```bash
ollama pull gemma:7b
```
- Kích thước: ~4.8GB
- RAM yêu cầu: 16GB
- Tốc độ: Trung bình (5-10 giây/response)
- Chất lượng: Rất tốt

### Kiểm tra model đã tải:
```bash
ollama list
```
Kết quả:
```
NAME            ID              SIZE    MODIFIED
gemma:2b        b50d6c999e59    1.4 GB  2 minutes ago
```

## Bước 3: Test Ollama với Gemma

### Test command line:
```bash
ollama run gemma:2b "Xin chào, bạn có thể giúp tôi cải thiện phát âm tiếng Việt không?"
```

Nếu thành công, bạn sẽ thấy response từ model.

## Bước 4: Cấu hình Backend

File `.env` đã được cấu hình sẵn:
```env
AI_SERVICE=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma:2b
```

## Bước 5: Khởi động Backend

```bash
cd backend
npm run dev
```

Bạn sẽ thấy log:
```
🤖 AI Service: Using Ollama (Local Gemma)
✅ Ollama connected. Available models: gemma:2b
```

## Bước 6: Test Chat API

### Lấy token:
```bash
# Login để lấy token
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"persistent-test@goodviet.com\",\"password\":\"Test1234\"}"
```

### Test chat với Ollama:
```bash
# Thay YOUR_TOKEN bằng token từ bước trên
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"content\":\"Xin chào, bạn có thể giúp tôi cải thiện phát âm không?\"}"
```

## So sánh Ollama vs Gemini API

| Tiêu chí | Ollama (Local) | Gemini API (Cloud) |
|----------|----------------|---------------------|
| **Chi phí** | Miễn phí | Có giới hạn quota |
| **Tốc độ** | 2-10 giây | 1-3 giây |
| **Offline** | ✅ Có | ❌ Không |
| **Privacy** | ✅ Hoàn toàn riêng tư | ❌ Dữ liệu gửi lên Google |
| **Cài đặt** | Cần cài Ollama + model | Chỉ cần API key |
| **RAM** | 8-16GB | Không cần |
| **Disk** | 1-5GB | Không cần |

## Troubleshooting

### Lỗi: "Ollama not available"
**Nguyên nhân:** Ollama service không chạy

**Giải pháp:**
```bash
# Check service status
ollama serve
```

Hoặc restart Ollama service trong Windows Services.

### Lỗi: "Model not found"
**Nguyên nhân:** Chưa pull model

**Giải pháp:**
```bash
ollama pull gemma:2b
```

### Response quá chậm
**Nguyên nhân:** Model quá lớn hoặc RAM không đủ

**Giải pháp:**
- Dùng `gemma:2b` thay vì `gemma:7b`
- Đóng các ứng dụng khác để giải phóng RAM
- Giảm `num_predict` trong code xuống 200-300

### Response không đúng tiếng Việt
**Nguyên nhân:** Model Gemma có thể trả lời tiếng Anh

**Giải pháp:**
- Đã được xử lý trong system prompt
- Nếu vẫn lỗi, thử model `gemma:7b` (tốt hơn với tiếng Việt)

## Chuyển đổi giữa Ollama và Gemini

### Dùng Ollama (Local):
```env
AI_SERVICE=ollama
```

### Dùng Gemini API (Cloud):
```env
AI_SERVICE=gemini
GEMINI_API_KEY=your-valid-api-key
```

### Auto-detect (Khuyến nghị):
```env
AI_SERVICE=
```
Backend sẽ tự động:
1. Thử Ollama trước (nếu có)
2. Fallback về Gemini (nếu có API key)
3. Dùng mock response (nếu cả 2 đều không có)

## Kiểm tra trạng thái AI Service

Thêm endpoint mới (tùy chọn):

**File: `backend/src/routes/health.routes.ts`**
```typescript
router.get('/ai-status', (req, res) => {
  const status = aiService.getStatus();
  res.json(status);
});
```

Test:
```bash
curl http://localhost:3000/api/health/ai-status
```

Kết quả:
```json
{
  "provider": "ollama",
  "ollama": true,
  "gemini": false
}
```

## Tối ưu hóa

### Giảm độ trễ response:
1. Dùng `gemma:2b` thay vì `7b`
2. Giảm `num_predict` xuống 200
3. Giảm `temperature` xuống 0.5
4. Xóa history cũ (chỉ giữ 5 tin nhắn gần nhất)

### Tăng chất lượng response:
1. Dùng `gemma:7b`
2. Tăng `num_predict` lên 500
3. Cải thiện system prompt
4. Giữ nhiều history hơn (10-20 tin nhắn)

## Lưu ý quan trọng

⚠️ **Lần đầu chạy model sẽ chậm** (load model vào RAM)
⚠️ **Cần 8-16GB RAM** để chạy Gemma
⚠️ **Response sẽ chậm hơn API** (nhưng hoàn toàn offline và miễn phí)
✅ **Không giới hạn số lượng request**
✅ **Dữ liệu không rời khỏi máy bạn**

## Kết luận

Ollama + Gemma là giải pháp tốt nhất nếu:
- ✅ Bạn muốn chạy offline
- ✅ Bạn muốn miễn phí hoàn toàn
- ✅ Bạn quan tâm về privacy
- ✅ Máy bạn có đủ 8GB RAM

Gemini API tốt hơn nếu:
- ✅ Bạn cần response nhanh nhất
- ✅ Bạn không muốn cài đặt gì thêm
- ✅ Máy bạn RAM hạn chế
- ✅ Bạn có API key hợp lệ
