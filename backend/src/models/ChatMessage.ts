import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  userId: mongoose.Types.ObjectId;
  senderType: 'user' | 'bot';
  content: string;
  timestamp: Date;
  promptTokens?: number;
  completionTokens?: number;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  senderType: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  promptTokens: { type: Number },
  completionTokens: { type: Number },
}, {
  timestamps: true,
  collection: 'chat_messages'
});

// Composite index for fast history retrieval
ChatMessageSchema.index({ userId: 1, timestamp: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
