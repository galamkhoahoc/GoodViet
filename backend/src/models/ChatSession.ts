import mongoose, { Schema, Document } from 'mongoose';

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Cuộc trò chuyện mới' },
  lastMessageAt: { type: Date, default: Date.now, index: true },
}, {
  timestamps: true,
  collection: 'chat_sessions'
});

// Index for getting user's sessions sorted by most recent activity
ChatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
