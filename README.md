# GoodViet - Nền tảng Hỗ trợ Âm ngữ Trị liệu

Nền tảng web tích hợp AI hỗ trợ đánh giá và cải thiện khả năng ngôn ngữ, phát âm tiếng Việt cho trẻ em và người cần trị liệu âm ngữ.

**Tiếng Việt** | [English](README_EN.md)

## 🎯 Tính năng chính

### 1. Đánh giá giọng nói cục bộ (On-device Voice Assessment)
- Xử lý hoàn toàn trên trình duyệt, không gửi dữ liệu audio lên server
- Sử dụng Wav2Vec2 CTC với Web Worker để phân tích giọng nói
- Tự động chuẩn hóa audio về mono 16 kHz
- Hỗ trợ WebGPU/FP16 (ưu tiên) và WebAssembly/Q8 (fallback)
- Browser Cache API để lưu model sau lần tải đầu tiên

### 2. AI Chatbot hỗ trợ
- Tích hợp Google Gemini AI và Ollama
- Hỗ trợ đa phương thức (multimodal): văn bản và hình ảnh
- Lịch sử trò chuyện persistent với MongoDB
- Rate limiting và authentication

### 3. Quản lý người dùng
- Xác thực JWT
- Phân quyền theo vai trò (student, parent, therapist, admin)
- Theo dõi tiến độ học tập

## 🔑 Tài khoản dùng thử (Demo / Guest Account)

Để trải nghiệm ứng dụng nhanh chóng, bạn có thể sử dụng tài khoản thử nghiệm:
- **Tên đăng nhập / Email:** `guest@goodviet.glkh.vn`
- **Mật khẩu:** `Guest2026#`

### 4. Luyện tập phát âm
- Bài tập tương tác theo cấp độ
- Ghi âm và phản hồi tức thì
- Theo dõi tiến độ cá nhân

## 🏗️ Cấu trúc dự án

```
GoodViet/
├── backend/                      # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/              # Cấu hình database, env, GridFS
│   │   ├── controllers/         # Auth, chat, audio, assessment controllers
│   │   ├── middleware/          # Auth, rate limit, upload, validation
│   │   ├── models/              # MongoDB schemas (User, Chat, Audio, etc.)
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic (AI, audio, storage)
│   │   └── utils/               # Helper functions
│   ├── python-ai-service/       # Python AI Service
│   │   ├── services/            # Gemma4, multimodal processing
│   │   ├── utils/               # Speculative decoding, thinking parser
│   │   └── app.py              # Flask API server
│   └── scripts/                 # Utility scripts
├── src/                         # React + TypeScript + Vite
│   ├── components/              # UI components
│   ├── pages/                   # Page components
│   ├── stores/                  # Zustand state management
│   └── utils/                   # Client utilities
├── tools/
│   └── voice-model/            # Voice model conversion tools
└── public/                      # Static assets

```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 20.x hoặc cao hơn
- Python 3.9+ (cho Python AI Service)
- MongoDB Atlas account hoặc MongoDB local
- npm hoặc pnpm

### 1. Clone repository
```bash
git clone <repository-url>
cd GoodViet
```

### 2. Cài đặt Frontend

```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cấu hình các biến môi trường:
# - VITE_API_URL: URL của backend API
# - VITE_VOICE_MODEL_ID: Hugging Face model ID
# - VITE_VOICE_MODEL_REVISION: Model revision
# - VITE_GEMINI_API_KEY: Google Gemini API key

# Chạy development server
npm run dev
```

### 3. Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cấu hình các biến môi trường:
# - MONGODB_URI: MongoDB connection string
# - JWT_SECRET: Secret key cho JWT
# - GEMINI_API_KEY: Google Gemini API key
# - AWS_* hoặc CLOUDINARY_*: Storage credentials
# - OLLAMA_BASE_URL: Ollama server URL (optional)

# Chạy development server
npm run dev

# Hoặc build và chạy production
npm run build
npm start
```

### 4. Cài đặt Python AI Service (Tùy chọn)

```bash
cd backend/python-ai-service

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo .env file
cp .env.example .env

# Chạy service
python app.py

# Hoặc dùng PowerShell script (Windows)
.\start-service.ps1
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token

### Chat Endpoints
- `POST /api/chat/message` - Gửi tin nhắn đến AI
- `GET /api/chat/sessions` - Lấy danh sách phiên chat
- `GET /api/chat/sessions/:id` - Lấy chi tiết phiên chat

### Audio Endpoints
- `POST /api/audio/upload` - Upload file audio
- `GET /api/audio/:id` - Lấy file audio
- `POST /api/audio/analyze` - Phân tích audio

### Assessment Endpoints
- `POST /api/assessment/create` - Tạo đánh giá mới
- `GET /api/assessment/:id` - Lấy kết quả đánh giá

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
npm run test
```

## 🔧 Cấu hình Voice Model

Voice model được xử lý hoàn toàn trên trình duyệt. Để chuẩn bị model:

1. Xuất model từ Hugging Face sang ONNX format
2. Tối ưu hóa cho WebGPU/WASM
3. Upload lên Hugging Face Hub
4. Cấu hình `VITE_VOICE_MODEL_ID` và `VITE_VOICE_MODEL_REVISION`

Xem chi tiết tại [`tools/voice-model/README.md`](tools/voice-model/README.md)

## 📦 Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript 6
- **Build Tool:** Vite 5
- **State Management:** Zustand
- **Styling:** Tailwind CSS 4
- **AI/ML:** Hugging Face Transformers.js, Google Generative AI
- **Routing:** React Router 7
- **Charts:** Recharts
- **Animations:** Motion

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt
- **Storage:** AWS S3 / Cloudinary
- **AI Integration:** Google Gemini, Ollama
- **Security:** Helmet, express-rate-limit
- **File Upload:** Multer, GridFS

### Python AI Service
- **Framework:** Flask
- **AI Models:** Gemma4, Multimodal processing
- **Utilities:** Speculative decoding, Thinking parser

## 🔐 Bảo mật

- JWT-based authentication
- Password hashing với bcrypt
- Rate limiting trên các endpoints quan trọng
- Helmet.js cho HTTP security headers
- Input validation với Zod
- CORS configuration
- Environment variables cho sensitive data

## 📝 License

Dự án này được bảo hộ theo giấy phép **MIT License**.

## 📧 Liên hệ

- **Đơn vị phát triển:** Gà làm khoa học
- **Email:** galamkhoahoc@gmail.com
