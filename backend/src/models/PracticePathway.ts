import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticePathway extends Document {
  name: string;
  description: string;
  durationDays: number;
  targetPhonemes: string[];
  weeks: any; // Flexible JSON structure
  isActive: boolean;
  createdAt: Date;
}

const PracticePathwaySchema = new Schema<IPracticePathway>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  durationDays: { type: Number, required: true },
  targetPhonemes: { type: [String], default: [] },
  weeks: { type: Schema.Types.Mixed, required: true }, // Store the JSON array of week data with exercises
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'practice_pathways'
});

export const PracticePathway = mongoose.model<IPracticePathway>('PracticePathway', PracticePathwaySchema);
