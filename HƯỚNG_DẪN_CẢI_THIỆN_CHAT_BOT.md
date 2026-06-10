# 🤖 Hướng Dẫn Cải Thiện Chất Lượng Chat Bot

## ✅ Đã Thực Hiện (Giải pháp nhanh)

### 1. Cải Thiện System Prompt
**Thay đổi:**
- ❌ Cũ: "Hãy trả lời ngắn gọn trong 2-3 câu"
- ✅ Mới: Prompt chi tiết hơn với hướng dẫn cụ thể về:
  - Nhiệm vụ rõ ràng (trả lời về phát âm, đưa ví dụ, khuyến khích)
  - Phong cách trả lời (thân thiện, dễ hiểu, có ví dụ cụ thể)
  - Độ dài phù hợp (3-5 câu thay vì 2-3 câu)

**Kết quả:**
- Bot sẽ trả lời chi tiết và hữu ích hơn
- Đưa ra ví dụ minh họa cụ thể
- Khuyến khích người dùng tiếp tục hội thoại

### 2. Tăng Max Tokens
- ❌ Cũ: 150 tokens (quá ngắn)
- ✅ Mới: 256 tokens (đủ cho 3-5 câu có ý nghĩa)

---

## 🚀 Các Giải Pháp Tiếp Theo (Theo mức độ ưu tiên)

### Giải Pháp 2: Kiểm Tra Provider Đang Được Dùng ⚡

**Vấn đề hiện tại:**
- Gemma4 chạy trên CPU rất chậm (8-12 giây)
- Backend có thể đang tự động fallback sang Ollama hoặc Gemini

**Cách kiểm tra:**

1. **Xem logs của Node.js backend:**
   - Tìm dòng: `[AI Service] Using provider: gemma4`
   - Hoặc: `[AI Service] Attempting fallback to...`

2. **Test trực tiếp bằng API:**
```bash
# Tạo file test-chat.ps1
```

**Script test (tôi sẽ tạo ngay):**

---

### Giải Pháp 3: Cài CUDA để Tăng Tốc (Nếu có GPU NVIDIA) 🎮

**Lợi ích:**
- Tăng tốc từ 8-12 giây → 2-3 giây
- Chất lượng response tốt hơn (không timeout)

**Yêu cầu:**
- Card đồ họa NVIDIA (GTX 1060 trở lên)
- RAM: 8GB+ (16GB khuyến nghị)

**Các bước:**

1. **Kiểm tra GPU:**
```powershell
nvidia-smi
```

2. **Download CUDA Toolkit:**
- Link: https://developer.nvidia.com/cuda-downloads
- Chọn phiên bản: CUDA 11.8 hoặc 12.1

3. **Cài đặt PyTorch với CUDA:**
```powershell
cd backend\python-ai-service
venv\Scripts\activate
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

4. **Restart Python service:**
```powershell
# Service sẽ tự động detect CUDA
```

---

### Giải Pháp 4: Chuyển sang Dùng Gemini API (Nhanh chóng) ☁️

**Khi nào dùng:**
- Không có GPU NVIDIA
- Cần response nhanh ngay
- Chấp nhận dùng cloud service

**Ưu điểm:**
- Cực nhanh (1-2 giây)
- Không tốn tài nguyên máy local
- Chất lượng tốt

**Nhược điểm:**
- Cần API key (miễn phí nhưng có giới hạn)
- Phụ thuộc internet
- Dữ liệu gửi lên cloud

**Cách chuyển:**
```env
# Trong backend/.env
AI_SERVICE=gemini
```

Restart Node.js backend là xong!

---

### Giải Pháp 5: Fine-tune Generation Parameters 🎛️

**Điều chỉnh trong `backend/python-ai-service/.env`:**

```env
# Tăng creativity (câu trả lời đa dạng hơn)
TEMPERATURE=1.2  # Thay vì 1.0

# Tăng max tokens nếu muốn response dài hơn
MAX_NEW_TOKENS=300  # Thay vì 256

# Giảm top_k để tập trung vào từ có xác suất cao
TOP_K=40  # Thay vì 64
```

Restart Python service sau khi đổi.

---

### Giải Pháp 6: Thêm Few-Shot Examples 📚

Thêm ví dụ mẫu vào system prompt để model học cách trả lời:

```python
system_prompt = (
    "Bạn là trợ lý AI chuyên về phát âm tiếng Việt...\n\n"
    "Ví dụ hội thoại tốt:\n"
    "Người dùng: Làm sao để phân biệt âm L và N?\n"
    "Trợ lý: Để phân biệt âm L và N, bạn cần chú ý vị trí lưỡi:\n"
    "- Âm L: Đầu lưỡi chạm vào lợi trên, sau đó hạ xuống (như 'lúa', 'lửa')\n"
    "- Âm N: Đầu lưỡi chạm vào lợi trên và giữ nguyên (như 'núi', 'nước')\n"
    "Thử luyện tập với cặp từ: 'lá - ná', 'lên - nên'. Bạn muốn thử phát âm từ nào trước?"
)
```

---

## 📊 So Sánh Các Giải Pháp

| Giải Pháp | Độ Khó | Thời Gian | Hiệu Quả | Khuyến Nghị |
|-----------|--------|-----------|----------|-------------|
| ✅ Cải thiện prompt | ⭐ Dễ | 5 phút | ⭐⭐⭐⭐ | **ĐÃ LÀM** |
| Check provider logs | ⭐ Dễ | 2 phút | ⭐⭐⭐ | **LÀM NGAY** |
| Chuyển sang Gemini | ⭐ Dễ | 1 phút | ⭐⭐⭐⭐⭐ | **Nếu cần nhanh** |
| Fine-tune params | ⭐⭐ Trung bình | 10 phút | ⭐⭐⭐ | Thử nghiệm |
| Cài CUDA | ⭐⭐⭐ Khó | 30-60 phút | ⭐⭐⭐⭐⭐ | **Nếu có GPU** |
| Few-shot examples | ⭐⭐ Trung bình | 15 phút | ⭐⭐⭐⭐ | Tùy chọn |

---

## 🎯 Khuyến Nghị Cho Bạn

### Ngay Bây Giờ (5 phút):
1. ✅ **Đã làm:** Cải thiện system prompt
2. **Test lại chat bot** → Xem có tốt hơn không
3. **Nếu vẫn chậm/không tốt** → Chuyển sang Gemini (1 phút)

### Nếu Có GPU NVIDIA (30 phút):
- Cài CUDA để tăng tốc Gemma4 lên 4-5 lần

### Nếu Muốn Chất Lượng Tốt Nhất (1 giờ):
1. Cài CUDA
2. Fine-tune generation parameters
3. Thêm few-shot examples

---

## 💡 Lưu Ý Quan Trọng

**Vấn đề hiện tại:**
Từ logs Python service, tôi thấy:
```
WARNING: CUDA is not available. Using CPU for inference.
This will be significantly slower.
```

**Điều này có nghĩa:**
- Gemma4 chạy **RẤT CHẬM** trên CPU
- Mỗi response mất 8-12 giây
- Backend có thể đã tự động fallback sang provider khác

**Giải pháp tạm thời tốt nhất:**
```env
# Trong backend/.env
AI_SERVICE=gemini
```

Restart Node.js backend, và bot sẽ trả lời **cực nhanh** (1-2 giây) với chất lượng tốt!

---

## 🧪 Test Sau Khi Thay Đổi

1. **Refresh trang web**
2. **Gửi câu hỏi test:**
   - "Làm sao để phân biệt âm L và N?"
   - "Tôi phát âm âm ch không rõ, có cách nào cải thiện không?"
3. **Kiểm tra:**
   - Response có chi tiết hơn không?
   - Có ví dụ cụ thể không?
   - Thời gian response có nhanh không?

---

## 📞 Cần Trợ Giúp?

Nếu bạn muốn:
- ✅ Script test tự động
- ✅ Chuyển sang Gemini
- ✅ Cài CUDA
- ✅ Fine-tune parameters

Hãy cho tôi biết, tôi sẽ giúp bạn từng bước!
