import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticeSession extends Document {
  progressId: mongoose.Types.ObjectId;
  week: number;
  day: number;
  completedAt: Date;
  exercisesCompleted: number;
  accuracyScore?: number;
}

const PracticeSessionSchema = new Schema<IPracticeSession>({
  progressId: { type: Schema.Types.ObjectId, ref: 'PracticeProgress', required: true },
  week: { type: Number, required: true },
  day: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  exercisesCompleted: { type: Number, required: true },
  accuracyScore: { type: Number },
}, {
  timestamps: true,
  collection: 'practice_sessions'
});

export const PracticeSession = mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);
