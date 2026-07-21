# Hướng Dẫn Phát Triển (Development Guide) - GoodViet

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc, các công nghệ được sử dụng và cấu trúc thư mục của dự án **GoodViet**, giúp các lập trình viên mới dễ dàng nắm bắt và phát triển hệ thống đúng chuẩn.

---

## 1. Tổng Quan Kiến Trúc (Architecture Overview)

GoodViet được thiết kế theo kiến trúc Client-Server:
- **Frontend (Client)**: Ứng dụng Single Page Application (SPA) xây dựng bằng React, Vite và TypeScript.
- **Backend (Server)**: RESTful API xây dựng bằng Node.js, Express và TypeScript, kết nối với cơ sở dữ liệu MongoDB.
- **AI Services**: Tích hợp các dịch vụ AI như Google Gemini, Ollama (và HuggingFace transformers ở phía frontend/backend tùy chọn) cho tính năng chatbot và đánh giá phát âm.

---

## 2. Frontend (Giao Diện Người Dùng)

### 2.1. Công nghệ sử dụng
- **Core**: React 19, TypeScript, Vite.
- **Routing**: React Router DOM (Xử lý điều hướng trang).
- **State Management**: Zustand (Quản lý trạng thái toàn cục, ví dụ: `chatStore.ts`).
- **Styling**: Tailwind CSS v4, Lucide React (Icons).
- **Charts & Data Visualization**: Recharts.
- **AI & ML**: `@google/genai`, `@huggingface/transformers` (có thể chạy model trực tiếp trên trình duyệt bằng Web Workers).
- **Khác**: `react-markdown`, `rehype-katex` để hiển thị Markdown và công thức Toán.

### 2.2. Cấu trúc thư mục (`/src`)
```text
src/
├── components/   # Các UI components tái sử dụng (Button, Input, Layouts,...)
├── config/       # Cấu hình ứng dụng (API keys, constants,...)
├── data/         # Dữ liệu tĩnh (mock data, translation,...)
├── hooks/        # Custom React Hooks (ví dụ: useAuth, useAudio,...)
├── pages/        # Các component cấp độ trang (DashboardPage, ExpertPage,...)
├── services/     # Gọi API đến Backend (Axios/Fetch configs)
├── store/        # Zustand stores quản lý state toàn cục (vd: chatStore)
├── styles/       # CSS toàn cục hoặc cấu hình theme phụ trợ
├── utils/        # Các hàm tiện ích (formatters, validators,...)
└── workers/      # Web Workers để xử lý tác vụ nặng (như chạy mô hình AI)
```

### 2.3. Hướng dẫn triển khai Frontend
1. **Component**: Chia nhỏ UI thành các component. Mọi component chung nên đặt ở `components/`.
2. **State**: 
   - State cục bộ (component-level) dùng `useState`, `useReducer`.
   - State toàn cục (user info, auth, chat lịch sử) dùng Zustand ở thư mục `store/`.
3. **API Calls**: Không gọi API trực tiếp trong component. Hãy định nghĩa các hàm gọi API ở thư mục `services/` và sử dụng custom hooks (ở thư mục `hooks/`) để fetch dữ liệu, hoặc tích hợp gọi API qua các actions của Zustand.
4. **Styling**: Ưu tiên sử dụng utility classes của Tailwind CSS.
5. **Định tuyến (Routing)**: Thêm routes mới tại file App.tsx hoặc cấu hình router chính, sử dụng cơ chế Lazy load cho các trang lớn.

---

## 3. Backend (Hệ Thống Máy Chủ)

### 3.1. Công nghệ sử dụng
- **Core**: Node.js, Express, TypeScript.
- **Database**: MongoDB (sử dụng Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens), bcrypt.
- **Storage**: AWS S3 (thông qua `@aws-sdk` và `multer-s3`) kết hợp GridFS cho fallback.
- **AI Integration**: Google Generative AI (`@google/generative-ai`), Ollama (`ollama` package).
- **Security & Utils**: Helmet, CORS, Express-Rate-Limit, Zod (validate data).

### 3.2. Cấu trúc thư mục (`/backend/src`)
```text
backend/src/
├── config/       # Cấu hình môi trường (env), kết nối DB (database.ts)
├── controllers/  # Xử lý logic request/response cho từng route
├── middleware/   # Express middlewares (auth, error handler, rate limit, upload)
├── models/       # Định nghĩa các Mongoose schemas & interfaces
├── routes/       # Khai báo endpoints và gán controllers tương ứng
├── scripts/      # Các script chạy một lần (seed data, migrations)
├── services/     # Logic nghiệp vụ lõi, giao tiếp Database/External APIs
├── test/         # Unit & Integration tests
├── utils/        # Các hàm tiện ích (logger, helpers,...)
├── app.ts        # Thiết lập Express App (CORS, Helmet, gắn Routes)
└── server.ts     # Khởi động server HTTP
```

### 3.3. Hướng dẫn triển khai Backend
Backend áp dụng mô hình **MVC** mở rộng với layer **Service**:
1. **Routes (`routes/`)**: Chỉ định nghĩa endpoints (URL, method) và gắn các middleware (như authenticate, rate limit), sau đó chuyển request tới Controller.
2. **Controllers (`controllers/`)**: Xử lý Input (Request) và Output (Response). **KHÔNG** chứa logic nghiệp vụ phức tạp ở đây. Nhận dữ liệu, gọi Service tương ứng, và trả về Response.
3. **Services (`services/`)**: Nơi chứa toàn bộ logic nghiệp vụ (Business Logic). Tái sử dụng code, xử lý logic lưu Database, gọi API ngoài (AI, Email).
4. **Models (`models/`)**: Định nghĩa cấu trúc Database (Mongoose Schema). Mọi thay đổi về schema cần khai báo cẩn thận để tránh lỗi type trên TypeScript.
5. **Middlewares (`middleware/`)**: Dùng cho xác thực (JWT Auth), phân quyền, upload file (Multer), xử lý lỗi toàn cục.

#### Các API Endpoint chính (được định nghĩa trong `app.ts`):
- `/api/users`: Quản lý người dùng, đăng nhập/đăng ký.
- `/api/audio`: Xử lý tải lên audio (Lưu S3/MongoDB).
- `/api/assessments`: Các bài kiểm tra và đánh giá phát âm.
- `/api/chat`: Xử lý giao tiếp với chatbot AI.
- `/api/practice`: Các phiên luyện tập.
- `/api/experts`: Liên quan đến chuyên gia (chuyên viên trị liệu).

---

## 4. Workflow Phát Triển Tính Năng Mới

1. **Hiểu Yêu Cầu**: Xác định tính năng cần thay đổi ở Frontend, Backend hay cả hai.
2. **Backend Trước (Nếu có)**:
   - Cập nhật/Tạo `models/` nếu cần lưu dữ liệu mới.
   - Thêm logic vào `services/`.
   - Tạo endpoint mới tại `routes/` và xử lý tại `controllers/`.
   - Test API (bằng Postman hoặc viết test ở `test/`).
3. **Frontend Sau**:
   - Khai báo API call trong `src/services/`.
   - Cập nhật State Manager (`src/store/`) hoặc tạo hooks để lấy dữ liệu.
   - Tạo/Cập nhật UI Components và Pages để hiển thị/tương tác với dữ liệu mới.
4. **Quy tắc Code**:
   - **Luôn dùng TypeScript**: Khai báo Interface/Type đầy đủ cho dữ liệu để tận dụng tối đa lợi ích của TS.
   - **Xử lý lỗi**: Ở Backend luôn dùng block `try-catch` trong controller và gọi hàm `next(error)` để Middleware xử lý lỗi toàn cục. Ở Frontend, hiển thị toast hoặc thông báo thân thiện khi API trả về lỗi.

---

> **Khởi động dự án cục bộ**:
> - Frontend: `npm run dev` trong thư mục gốc.
> - Backend: `npm run dev` trong thư mục `backend/`.
> Chắc chắn rằng các file `.env` (từ `.env.example`) đã được cấu hình đúng.

> **Về AI Integration**: Nếu cập nhật logic liên quan đến chatbot AI, hãy tham khảo thêm các tài liệu hướng dẫn về Ollama (`backend/OLLAMA_INTEGRATION_GUIDE.md`) và Python Service có sẵn trong thư mục backend để hiểu cách phân phối workload AI.
