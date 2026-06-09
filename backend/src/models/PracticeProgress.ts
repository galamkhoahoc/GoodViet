import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticeProgress extends Document {
  userId: mongoose.Types.ObjectId;
  pathwayId: mongoose.Types.ObjectId;
  currentWeek: number;
  currentDay: number;
  startedAt: Date;
  completedAt?: Date;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: Date;
}

const PracticeProgressSchema = new Schema<IPracticeProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  pathwayId: { type: Schema.Types.ObjectId, ref: 'PracticePathway', required: true },
  currentWeek: { type: Number, default: 1 },
  currentDay: { type: Number, default: 1 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCheckIn: { type: Date },
}, {
  timestamps: true,
  collection: 'practice_progress'
});

export const PracticeProgress = mongoose.model<IPracticeProgress>('PracticeProgress', PracticeProgressSchema);
