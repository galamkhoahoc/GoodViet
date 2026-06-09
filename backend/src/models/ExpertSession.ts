import mongoose, { Schema, Document } from 'mongoose';

export interface IExpertSession extends Document {
  connectionId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number; // minutes
  sessionType: 'initial_consultation' | 'follow_up' | 'progress_review';
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingUrl?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  completedAt?: Date;
}

const ExpertSessionSchema = new Schema<IExpertSession>({
  connectionId: { type: Schema.Types.ObjectId, ref: 'ExpertConnection', required: true },
  expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  sessionType: { 
    type: String, 
    enum: ['initial_consultation', 'follow_up', 'progress_review'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  meetingUrl: { type: String },
  notes: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  completedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'expert_sessions'
});

export const ExpertSession = mongoose.model<IExpertSession>('ExpertSession', ExpertSessionSchema);
