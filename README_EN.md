# GoodViet - Speech & Language Therapy Platform

An AI-integrated web platform designed to evaluate and improve Vietnamese language and pronunciation skills for children and individuals in need of speech therapy.

[Tiếng Việt](README.md) | **English**

## 🎯 Key Features

### 1. On-device Voice Assessment
- 100% processed locally inside the browser, no audio data sent to the server.
- Uses Wav2Vec2 CTC with Web Workers for real-time voice analysis.
- Automatically normalizes audio to mono 16 kHz.
- Supports WebGPU/FP16 (primary) with WebAssembly/Q8 (fallback).
- Browser Cache API for caching models after the initial download.

### 2. AI Assistive Chatbot
- Integrated Google Gemini AI and Ollama.
- Multimodal support: text and image processing.
- Persistent conversation history with MongoDB.
- Rate limiting and authentication protection.

### 3. User Management
- JWT-based authentication.
- Role-based access control (student, parent, therapist, admin).
- Personal learning progress tracking.

## 🔑 Demo / Guest Account

To quickly explore the application, you can use the test guest account:
- **Username / Email:** `guest@goodviet.glkh.vn`
- **Password:** `Guest2026#`

### 4. Pronunciation Practice
- Level-based interactive exercises.
- Real-time audio recording and feedback.
- Individual progress tracking.

## 🏗️ Project Structure

```
GoodViet/
├── backend/                      # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/              # Database config, env, GridFS
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

## 🚀 Installation & Setup

### Prerequisites
- Node.js 20.x or higher
- Python 3.9+ (for Python AI Service)
- MongoDB Atlas account or local MongoDB
- npm or pnpm

### 1. Clone the repository
```bash
git clone <repository-url>
cd GoodViet
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env from .env.example
cp .env.example .env

# Configure environment variables:
# - VITE_API_URL: Backend API URL
# - VITE_VOICE_MODEL_ID: Hugging Face model ID
# - VITE_VOICE_MODEL_REVISION: Model revision
# - VITE_GEMINI_API_KEY: Google Gemini API key

# Run development server
npm run dev
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env from .env.example
cp .env.example .env

# Configure environment variables:
# - MONGODB_URI: MongoDB connection string
# - JWT_SECRET: JWT secret key
# - GEMINI_API_KEY: Google Gemini API key
# - AWS_* or CLOUDINARY_*: Storage credentials
# - OLLAMA_BASE_URL: Ollama server URL (optional)

# Run development server
npm run dev

# Or build and start production server
npm run build
npm start
```

### 4. Python AI Service Setup (Optional)

```bash
cd backend/python-ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run service
python app.py

# Or run using PowerShell script (Windows)
.\start-service.ps1
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Chat Endpoints
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/sessions` - List chat sessions
- `GET /api/chat/sessions/:id` - Get chat session details

### Audio Endpoints
- `POST /api/audio/upload` - Upload audio file
- `GET /api/audio/:id` - Fetch audio file
- `POST /api/audio/analyze` - Analyze audio

### Assessment Endpoints
- `POST /api/assessment/create` - Create new assessment
- `GET /api/assessment/:id` - Fetch assessment result

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
npm run test
```

## 🔧 Voice Model Configuration

The voice model is processed entirely within the browser. To prepare the model:

1. Export the model from Hugging Face to ONNX format
2. Optimize for WebGPU/WASM
3. Upload to Hugging Face Hub
4. Set `VITE_VOICE_MODEL_ID` and `VITE_VOICE_MODEL_REVISION`

See details at [`tools/voice-model/README.md`](tools/voice-model/README.md)

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

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on critical endpoints
- Helmet.js for HTTP security headers
- Input validation with Zod
- CORS configuration
- Environment variables for sensitive data

## 📝 License

This project is licensed under the **MIT License**.

## 📧 Contact

- **Development Team:** Nhóm nghiên cứu Gà làm khoa học
- **Email:** galamkhoahoc@gmail.com
