import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'reminder' | 'milestone' | 'alert' | 'expert_session' | 'new_content';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loadNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
}

const defaultNotifications: Notification[] = [
  {
    id: 'n-001', type: 'reminder',
    title: 'Đã đến giờ luyện tập!',
    message: 'Bạn có 2 bài luyện phát âm L/N hôm nay. Chỉ cần 10 phút thôi!',
    read: false, timestamp: '2026-06-09T07:00:00Z',
  },
  {
    id: 'n-002', type: 'milestone',
    title: '🔥 Streak 7 ngày!',
    message: 'Chúc mừng! Bạn đã luyện tập 7 ngày liên tiếp. Cố gắng duy trì nhé!',
    read: false, timestamp: '2026-06-09T06:00:00Z',
  },
  {
    id: 'n-003', type: 'new_content',
    title: 'Video mới: Phân biệt TR và CH',
    message: 'Video hướng dẫn tuần 2 đã sẵn sàng. Xem trước khi luyện tập nhé!',
    read: true, timestamp: '2026-06-08T09:00:00Z',
  },
  {
    id: 'n-004', type: 'alert',
    title: 'Nhắc nhở luyện tập',
    message: 'Bạn đã bỏ lỡ buổi luyện tập hôm qua. Hãy quay lại và hoàn thành bài tập nhé!',
    read: true, timestamp: '2026-06-07T18:00:00Z',
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  loadNotifications: () => {
    try {
      const saved = localStorage.getItem('goodviet_notifications');
      const list: Notification[] = saved ? JSON.parse(saved) : defaultNotifications;
      set({ notifications: list, unreadCount: list.filter(n => !n.read).length });
    } catch {
      set({ notifications: defaultNotifications, unreadCount: defaultNotifications.filter(n => !n.read).length });
    }
  },

  markAsRead: (id: string) => {
    const { notifications } = get();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('goodviet_notifications', JSON.stringify(updated));
    set({ notifications: updated, unreadCount: updated.filter(n => !n.read).length });
  },

  markAllRead: () => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('goodviet_notifications', JSON.stringify(updated));
    set({ notifications: updated, unreadCount: 0 });
  },

  addNotification: (n) => {
    const { notifications } = get();
    const newN: Notification = {
      ...n,
      id: 'n-' + Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
    };
    const updated = [newN, ...notifications];
    localStorage.setItem('goodviet_notifications', JSON.stringify(updated));
    set({ notifications: updated, unreadCount: updated.filter(x => !x.read).length });
  },
}));
