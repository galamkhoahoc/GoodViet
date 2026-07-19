# Xuất model phát âm sang ONNX cho trình duyệt

Công cụ này chuyển checkpoint công khai
[`tuanio/wav2vec2-base-finetune-vi_phone-non_freeze-spec_aug-500epoch`](https://huggingface.co/tuanio/wav2vec2-base-finetune-vi_phone-non_freeze-spec_aug-500epoch)
từ `pytorch_model.bin` sang bố cục mà Transformers.js có thể tải trực tiếp.
Script chỉ tải model về máy, xuất file và kiểm tra cục bộ; **không đăng tải file và
không chứa Hugging Face token**.

## Kết quả

Mặc định, kết quả được tạo ở `tools/voice-model/dist/browser-model/`:

```text
browser-model/
├── config.json
├── preprocessor_config.json
├── vocab.json
├── phonemes.json
├── browser_model_manifest.json
└── onnx/
    ├── model.onnx              # FP32, bản tham chiếu
    ├── model_fp16.onnx         # WebGPU
    └── model_quantized.onnx    # WASM Q8 dự phòng
```

`vocab.json` và `phonemes.json` dùng đúng 123 nhãn theo thứ tự lớp của model.
ID `0` (`<pad>`) là blank của CTC. Không dùng `vocab.json` 124 phần tử ở thư mục
gốc repository tác giả vì phần tử `|` thứ 124 không tồn tại trong đầu ra 123 logits
của checkpoint này.

Checkpoint không có tokenizer hoàn chỉnh. Ở frontend, hãy tải trực tiếp
`AutoFeatureExtractor` và `Wav2Vec2ForCTC`, sau đó tự CTC-decode theo
`phonemes.json`; không dùng pipeline ASR mặc định vốn cần tokenizer.

## Yêu cầu máy

- Python 3.10 hoặc 3.11, 64-bit.
- Khoảng 3–5 GB RAM trống và ít nhất 2 GB dung lượng đĩa trống.
- Kết nối mạng cho lần tải checkpoint đầu tiên. Các lần sau Hugging Face dùng cache
  cục bộ.
- Không cần GPU để export; CPU là đường chạy được hỗ trợ trong script.

## Cài đặt và export

Trong PowerShell, từ thư mục gốc dự án:

```powershell
cd tools/voice-model
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python export_voice_model.py
```

Checkpoint là public nên script vô hiệu hóa việc gửi token khi tải. Không đặt token
vào source code, `.env` phía frontend hoặc câu lệnh được commit.

Nên khóa revision bằng commit SHA để build có thể tái lập:

```powershell
python export_voice_model.py --revision d73f1b821659a987d4afd485662cbd66027a2b3d
```

Nếu chạy lại vào cùng thư mục, thêm `--overwrite`. Script chỉ thay các artifact do
nó quản lý, không xóa toàn bộ thư mục:

```powershell
python export_voice_model.py --overwrite
```

Các tùy chọn hữu ích:

```text
--output-dir PATH     Chọn thư mục model repository đầu ra
--opset 17            Chọn ONNX opset (mặc định 17)
--skip-fp16           Không tạo bản WebGPU
--skip-q8             Không tạo bản WASM Q8
--skip-validation     Chỉ kiểm tra cấu trúc ONNX, không chạy inference smoke test
```

## Script kiểm tra những gì

Sau khi export, script:

1. Chạy `onnx.checker` cho từng graph.
2. Chạy một audio tổng hợp 2 giây qua từng model bằng ONNX Runtime CPU.
3. Kiểm tra input `input_values`, output `logits`, giá trị hữu hạn và shape cuối
   đúng `[1, frames, 123]`.
4. CTC-decode đầu ra, so sánh FP16/Q8 với FP32 và ghi kết quả cùng SHA-256 vào
   `browser_model_manifest.json`.

Audio kiểm thử là tín hiệu tổng hợp được tạo tại chỗ; script không đọc hay gửi audio
người dùng. Cảnh báo khác biệt CTC trên tín hiệu tổng hợp không nhất thiết là lỗi,
nhưng cần kiểm thử thêm với tập giọng nói Việt Nam đại diện trước khi phát hành.

## Đăng lên Hugging Face (thực hiện thủ công)

Chỉ thực hiện bước này sau khi chủ repository xác nhận quyền phát hành model. Tạo
một model repository mới hoặc bổ sung các file vào repository mà bạn sở hữu, đăng
nhập bằng CLI ở máy của bạn, rồi chạy từ thư mục output:

```powershell
cd tools/voice-model/dist/browser-model
hf upload TEN_TAI_KHOAN/TEN_REPOSITORY . . --repo-type model
```

Lệnh trên là ví dụ tài liệu và không được script tự chạy. Không thêm token vào lệnh,
README, lịch sử Git hay bundle JavaScript. Sau khi upload, nên dùng commit SHA của
repository ONNX trong frontend:

```dotenv
VITE_VOICE_MODEL_ID=TEN_TAI_KHOAN/TEN_REPOSITORY
VITE_VOICE_MODEL_REVISION=COMMIT_SHA_CUA_BAN_ONNX
```

Transformers.js cần cấu trúc `onnx/` và sẽ chọn `model_fp16.onnx` cho WebGPU hoặc
`model_quantized.onnx` cho WASM khi ứng dụng chỉ định `dtype` tương ứng. Các file
được tải ở lần chạy đầu và có thể được lưu bằng Browser Cache API cho lần sau.

## Giới hạn chức năng

Checkpoint này là `Wav2Vec2ForCTC` nhận diện chuỗi âm vị/âm điệu, không tự đưa ra
điểm “phát âm đúng/sai”. Muốn chấm độ chính xác theo một câu cho trước cần thêm
chuỗi âm vị chuẩn, thuật toán căn chỉnh và ngưỡng được hiệu chỉnh trên dữ liệu đánh
giá. Khi chưa có các phần đó, giao diện chỉ nên hiển thị chuỗi âm vị và độ tin cậy,
không gọi đó là điểm phát âm.

Giới hạn audio phía ứng dụng nên là mono, 16 kHz và tối đa khoảng 30 giây để tránh
WebGPU/WASM dùng quá nhiều bộ nhớ. Việc cache không đảm bảo vĩnh viễn: trình duyệt
có thể xóa cache khi thiếu dung lượng hoặc ở chế độ riêng tư.

## Cảnh báo giấy phép

Repository checkpoint đích hiện không công bố trường license rõ ràng. Cấu hình của
nó trỏ về base model
[`nguyenvulebinh/wav2vec2-base-vietnamese-250h`](https://huggingface.co/nguyenvulebinh/wav2vec2-base-vietnamese-250h),
được mô tả với điều kiện sử dụng phi thương mại. Vì vậy, hãy xem các artifact ONNX
là **chưa được phép tái phân phối/thương mại hóa** cho đến khi chủ sở hữu xác nhận
license và quyền đối với cả checkpoint lẫn dữ liệu huấn luyện. Việc chuyển định dạng
không làm thay đổi hoặc mở rộng quyền sử dụng model.
