# 🔗 Frontend-Backend Integration Guide

## ✅ Đã Hoàn Thành

### 1. API Client & Auth
- ✅ API client đã sẵn sàng (`src/services/api/apiClient.ts`)
- ✅ Auth store đã tích hợp backend (`src/store/authStore.ts`)
- ✅ Login/Register pages hoạt động với backend
- ✅ JWT token được lưu trong localStorage
- ✅ Auto-redirect khi token hết hạn (401)

### 2. API Services
Đã tạo 5 API services:
- ✅ `assessmentApi.ts` - Assessment system
- ✅ `practiceApi.ts` - Practice pathways & progress
- ✅ `expertApi.ts` - Expert connections & sessions
- ✅ `notificationApi.ts` - Notifications
- ✅ `index.ts` - Central export

### 3. Environment Configuration
- ✅ File `.env` đã tạo
- ✅ `VITE_USE_MOCK_API=false` - Sử dụng backend thật
- ✅ `VITE_API_URL=http://localhost:3000` - Backend local

---

## 🚀 Bắt Đầu Tích Hợp

### Bước 1: Cài Đặt & Chạy

```bash
# Terminal 1: Chạy Backend
cd backend
npm run dev
# Backend chạy ở http://localhost:3000

# Terminal 2: Chạy Frontend
cd ..  # về root
npm run dev
# Frontend chạy ở http://localhost:5173
```

### Bước 2: Test Authentication

1. Mở http://localhost:5173
2. Click "Đăng ký ngay"
3. Đăng ký tài khoản mới:
   - Email: `test@example.com`
   - Password: `Test1234` (min 8 ký tự, 1 chữ, 1 số)
   - Full Name: `Test User`
4. Sau khi đăng ký thành công → auto login → chuyển đến Dashboard
5. Kiểm tra localStorage:
   - `goodviet_token` - JWT token
   - `goodviet_user` - User data

---

## 📋 Các Trang Cần Tích Hợp

### ✅ Đã Tích Hợp
1. **Login Page** - `/login`
2. **Register Page** - `/register`
3. **Chat Page** - `/chat` (đã dùng `chatStore`)

### ⚠️ Cần Cập Nhật (Đang dùng mock data)

#### 1. Dashboard Page
**File**: `src/pages/DashboardPage.tsx`

**Cần làm**:
- Fetch practice progress từ `practiceApi.getProgress()`
- Fetch notifications từ `notificationApi.getNotifications()`
- Update stats với data thực từ backend
- Charts data từ practice sessions

**Ví dụ**:
```typescript
import { practiceApi, notificationApi } from '../services/api';

useEffect(() => {
  async function loadDashboard() {
    try {
      const progress = await practiceApi.getProgress();
      const { notifications } = await notificationApi.getNotifications();
      // Update state với data thật
    } catch (err) {
      console.error('Failed to load dashboard', err);
    }
  }
  loadDashboard();
}, []);
```

#### 2. Assessment Page
**File**: `src/pages/AssessmentPage.tsx`

**Cần làm**:
- Start assessment: `assessmentApi.startAssessment()`
- Upload recordings: `assessmentApi.uploadRecording()`
- Complete phase: `assessmentApi.completePhase()`
- Get results: `assessmentApi.getResult()`

**Flow**:
1. User click "Bắt đầu đánh giá"
2. Call `startAssessment()` → nhận 12 sentences
3. User record từng sentence
4. Upload mỗi recording với `uploadRecording()`
5. Sau 12 sentences → `completePhase('phase_1')`
6. Backend xử lý → chuyển Phase II → Phase III
7. Sau Phase III → `getResult()` hiển thị kết quả

#### 3. Pathway Page
**File**: `src/pages/PathwayPage.tsx`

**Cần làm**:
- Load pathways: `practiceApi.getPathways()`
- Start pathway: `practiceApi.startPathway(pathwayId)`
- Load progress: `practiceApi.getProgress()`
- Load day exercises: `practiceApi.getDayExercises(week, day)`
- Daily check-in: `practiceApi.checkin(week, day, exercisesCompleted)`
- Upload practice recordings: `practiceApi.uploadPracticeRecording()`

**Ví dụ**:
```typescript
// Load pathways list
const { pathways } = await practiceApi.getPathways();

// Start a pathway
const result = await practiceApi.startPathway(selectedPathwayId);

// Get current progress
const progress = await practiceApi.getProgress();
console.log(`Week ${progress.currentWeek}, Day ${progress.currentDay}`);
console.log(`Streak: ${progress.currentStreak} days`);

// Load today's exercises
const dayContent = await practiceApi.getDayExercises(
  progress.currentWeek,
  progress.currentDay
);

// Complete daily check-in
const checkin = await practiceApi.checkin(
  progress.currentWeek,
  progress.currentDay,
  3 // number of exercises completed
);
console.log(`New streak: ${checkin.newStreak}`);
if (checkin.milestoneAchieved) {
  console.log(checkin.milestoneAchieved.message);
}
```

#### 4. Expert Page
**File**: `src/pages/ExpertPage.tsx`

**Cần làm**:
- Load experts: `expertApi.getExperts()`
- Request connection: `expertApi.requestConnection(expertId)`
- Get connections: `expertApi.getConnections()`
- Book session: `expertApi.bookSession()`
- Get sessions: `expertApi.getSessions()`

**Ví dụ**:
```typescript
// Load experts list
const { experts } = await expertApi.getExperts();

// Request connection
const { connectionId } = await expertApi.requestConnection(expertId);

// Check connections status
const { connections } = await expertApi.getConnections();

// Book a session (after connection accepted)
const { sessionId } = await expertApi.bookSession(
  expertId,
  '2024-02-15T10:00:00Z',
  60, // duration in minutes
  'consultation'
);
```

#### 5. Profile Page
**File**: `src/pages/ProfilePage.tsx`

**Cần làm**:
- Load user profile (đã có trong authStore)
- Update profile: `authStore.updateUser(updates)`
- Load assessment result: `assessmentApi.getResult()`
- Load practice stats: `practiceApi.getProgress()`

---

## 🎨 Update Zustand Stores

### 1. Assessment Store
**File**: `src/store/assessmentStore.ts`

**Cần thêm**:
```typescript
import { assessmentApi } from '../services/api';

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessment: null,
  currentPhase: null,
  sentences: [],
  recordings: [],

  startAssessment: async () => {
    const response = await assessmentApi.startAssessment();
    set({
      assessment: response.assessmentId,
      currentPhase: 'phase_1',
      sentences: response.sentences,
    });
  },

  uploadRecording: async (blob, sentenceId, metadata) => {
    const { assessment, currentPhase } = get();
    const response = await assessmentApi.uploadRecording(
      blob,
      assessment!,
      currentPhase!,
      sentenceId,
      metadata
    );
    // Update recordings array
    set(state => ({
      recordings: [...state.recordings, response.recordingId],
    }));
  },

  // ... more methods
}));
```

### 2. Practice Store
**File**: `src/store/practiceStore.ts` (Cần tạo mới)

```typescript
import { create } from 'zustand';
import { practiceApi, PracticePathway, PracticeProgress } from '../services/api';

interface PracticeState {
  pathways: PracticePathway[];
  currentProgress: PracticeProgress | null;
  loadPathways: () => Promise<void>;
  startPathway: (pathwayId: string) => Promise<void>;
  loadProgress: () => Promise<void>;
  checkin: (week: number, day: number, exercises: number) => Promise<void>;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  pathways: [],
  currentProgress: null,

  loadPathways: async () => {
    const { pathways } = await practiceApi.getPathways();
    set({ pathways });
  },

  startPathway: async (pathwayId: string) => {
    await practiceApi.startPathway(pathwayId);
    // Reload progress
    const progress = await practiceApi.getProgress();
    set({ currentProgress: progress });
  },

  loadProgress: async () => {
    try {
      const progress = await practiceApi.getProgress();
      set({ currentProgress: progress });
    } catch (err) {
      console.error('No active pathway');
    }
  },

  checkin: async (week: number, day: number, exercises: number) => {
    const response = await practiceApi.checkin(week, day, exercises);
    // Reload progress to get updated streak
    const progress = await practiceApi.getProgress();
    set({ currentProgress: progress });
    
    // Show milestone notification if achieved
    if (response.milestoneAchieved) {
      // Trigger toast/notification
    }
  },
}));
```

### 3. Notification Store
**File**: `src/store/notificationStore.ts`

**Cần cập nhật**:
```typescript
import { notificationApi } from '../services/api';

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  loadNotifications: async () => {
    const { notifications, unreadCount } = await notificationApi.getNotifications();
    set({ notifications, unreadCount });
  },

  markAsRead: async (notificationId: string) => {
    await notificationApi.markAsRead(notificationId);
    // Update local state
    set(state => ({
      notifications: state.notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
}));
```

---

## 🧪 Testing Integration

### Test Checklist

#### Authentication ✅
- [ ] Register new account
- [ ] Login with registered account
- [ ] JWT token saved in localStorage
- [ ] Auto-redirect on 401 (expired token)
- [ ] Logout clears token

#### Dashboard
- [ ] Shows user stats from backend
- [ ] Displays practice progress
- [ ] Shows streak correctly
- [ ] Charts display real data

#### Assessment
- [ ] Start assessment gets 12 sentences
- [ ] Upload recordings works
- [ ] Phase progression works
- [ ] Results displayed correctly

#### Practice
- [ ] Pathways list loads
- [ ] Can start a pathway
- [ ] Daily exercises load
- [ ] Check-in updates streak
- [ ] Milestone notifications appear

#### Chat ✅
- [ ] Send message works
- [ ] Bot responds correctly
- [ ] Chat history loads
- [ ] No thinking output in responses

#### Expert
- [ ] Expert list loads
- [ ] Can request connection
- [ ] Connection status updates
- [ ] Can book session

#### Notifications
- [ ] Notifications load
- [ ] Unread count correct
- [ ] Mark as read works

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Error**: `Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**: Backend đã config CORS cho port 5173. Restart backend nếu cần.

### Issue 2: 401 Unauthorized
**Problem**: API calls return 401

**Solutions**:
1. Check token exists: `localStorage.getItem('goodviet_token')`
2. Token valid? Try login again
3. Check Authorization header in Network tab

### Issue 3: Rate Limiting (429)
**Problem**: Too many requests

**Solutions**:
1. Wait 15 minutes for rate limit reset
2. Or restart backend server
3. Use the persistent test account: `persistent-test@goodviet.com` / `Test1234`

### Issue 4: Empty Response
**Problem**: API returns empty data

**Solutions**:
1. Check if user has data (newly registered user = no progress/assessments)
2. Complete some actions first (start pathway, do assessment)
3. Check backend logs for errors

---

## 📝 Next Steps

### Priority 1: Essential Features
1. ✅ Authentication (Done)
2. ✅ Chat (Done)
3. **Dashboard** - Update to use real data
4. **Practice Pathway** - Full integration
5. **Assessment** - Full integration

### Priority 2: Enhanced Features
6. **Expert System** - Full integration
7. **Notifications** - Full integration
8. **Profile** - Show complete stats

### Priority 3: Advanced Features
9. Audio recording with IndexedDB
10. Offline sync manager
11. Progressive Web App (PWA)
12. Push notifications

---

## 🎯 Current Status

| Component | Mock Data | Backend API | Status |
|-----------|-----------|-------------|--------|
| Login | ❌ | ✅ | **100%** |
| Register | ❌ | ✅ | **100%** |
| Chat | ❌ | ✅ | **100%** |
| Dashboard | ✅ | ⏳ | **30%** |
| Assessment | ✅ | ⏳ | **0%** |
| Practice | ✅ | ⏳ | **0%** |
| Expert | ✅ | ⏳ | **0%** |
| Profile | ⏳ | ⏳ | **50%** |
| Notifications | ✅ | ⏳ | **0%** |

**Overall Progress: ~40%**

---

## 💡 Tips

1. **Start với Dashboard** - Nó dùng nhiều API khác nhau, test tốt sẽ biết các API hoạt động
2. **Test từng feature riêng** - Đừng integrate all cùng lúc
3. **Check Network tab** - Xem requests/responses để debug
4. **Use React DevTools** - Xem Zustand store state
5. **Console.log is your friend** - Debug API responses
6. **Backend logs** - Check terminal chạy backend để thấy errors

---

**Bắt đầu với Dashboard ngay bây giờ?** Let me know và tôi sẽ giúp bạn update `DashboardPage.tsx`! 🚀
