# EraX chạy cục bộ trong trình duyệt

Checkpoint người dùng cung cấp, `erax-ai/EraX-WoW-Turbo-V1.1-CT2`, chứa
`model.bin` theo định dạng CTranslate2. Định dạng đó dùng runtime C++/Python và
không thể được Transformers.js nạp trực tiếp. Công cụ trong thư mục này xuất từ
checkpoint Transformers gốc có cùng trọng số fine-tune:
`erax-ai/EraX-WoW-Turbo-V1.1` (Whisper large-v3-turbo, MIT).

## Xuất ONNX

Yêu cầu: Windows 64-bit, Git, Python 3.11 hoặc mới hơn, khoảng 16 GB RAM và ít nhất 12 GB ổ
đĩa trống. Từ thư mục gốc dự án:

```powershell
powershell -ExecutionPolicy Bypass -File tools/erax-browser-model/export_erax_model.ps1
```

Script khóa converter ở Transformers.js 3.8.1 và PyTorch 2.6.0 để khớp package frontend, tạo
biến thể Q8 dành cho WASM, rồi
xác nhận đủ graph Q8 encoder/decoder mà cấu hình mặc định sử dụng. Model
gốc được tải vào Hugging Face cache trên máy; script không chứa token và không
tự upload.

## Artifact đã phát hành

Bản Q8 đã kiểm thử được phát hành công khai tại:

`galamkhoahoc/EraX-WoW-Turbo-V1.1-ONNX`

Commit bất biến đang dùng trong frontend:

`9f6a17dd2de6ca0ab33a3f41c608cded527f106f`

Frontend đã có giá trị mặc định này nên người dùng không cần cấu hình hoặc đăng
nhập Hugging Face. Các biến môi trường bên dưới chỉ dùng để ghi đè khi phát hành
một phiên bản model mới.

## Phát hành lại artifact

Sau khi kiểm thử output ở
`tools/erax-browser-model/dist/erax-ai/EraX-WoW-Turbo-V1.1`, tạo một model repository mà
bạn có quyền quản lý rồi upload toàn bộ thư mục. Không commit các file model lớn
vào Git của website.

Nếu terminal gặp khó khăn khi dán token ẩn, dùng helper kiểm tra độ dài và tiền
tố mà không in token ra màn hình:

```powershell
tools/erax-browser-model/.venv/Scripts/python.exe tools/erax-browser-model/secure_hf_login.py
```

```powershell
hf auth login
hf upload TEN_TAI_KHOAN/EraX-WoW-Turbo-V1.1-ONNX tools/erax-browser-model/dist/erax-ai/EraX-WoW-Turbo-V1.1 . --repo-type model
```

Đặt cấu hình frontend bằng repository và commit SHA sau khi upload:

```dotenv
VITE_ERAX_BROWSER_MODEL_ID=TEN_TAI_KHOAN/EraX-WoW-Turbo-V1.1-ONNX
VITE_ERAX_MODEL_REVISION=COMMIT_SHA
VITE_ERAX_DEVICE=wasm
```

`wasm` là mặc định để EraX không tranh VRAM với Gemma 4. Trên máy có GPU và bộ
nhớ đồ họa đủ lớn, có thể thử `VITE_ERAX_DEVICE=webgpu`.

## Cache và quyền riêng tư

Transformers.js tải artifact ở lần sử dụng đầu, lưu bằng Browser Cache API và
dùng lại cho các lần sau. Audio được decode thành mono 16 kHz, chuyển cho Web
Worker EraX và không gửi tới backend. Trình duyệt vẫn có thể dọn cache khi thiếu
dung lượng hoặc trong chế độ riêng tư.
