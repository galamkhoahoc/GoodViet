import { apiClient } from './apiClient';

export interface Notification {
  _id: string;
  userId: string;
  type: 'milestone' | 'reminder' | 'expert' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionData?: Record<string, any>;
  timestamp: string;
}

export const notificationApi = {
  /**
   * Get user's notifications
   */
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const response = await apiClient.get<{
      success: boolean;
      notifications: Notification[];
      unreadCount: number;
    }>('/api/notifications');
    return {
      notifications: response.notifications,
      unreadCount: response.unreadCount,
    };
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/api/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const { notifications } = await this.getNotifications();
    await Promise.all(
      notifications
        .filter(n => !n.read)
        .map(n => this.markAsRead(n._id))
    );
  },
};
