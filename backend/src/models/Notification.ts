import mongoose, { Schema, Document } from 'mongoose';

export const NOTIFICATION_TYPES = [
  'reminder',
  'milestone',
  'alert',
  'expert_session',
  'new_content',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionData?: any;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [...NOTIFICATION_TYPES],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  actionUrl: { type: String },
  actionData: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
  collection: 'notifications',
});

// Optimized index for common query: unread notifications for a user, sorted by time
NotificationSchema.index({ userId: 1, read: 1, timestamp: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
