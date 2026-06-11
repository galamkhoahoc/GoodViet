import mongoose, { Schema, Document } from 'mongoose';

export interface IExpert extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  specializations: string[];
  bio: string;
  profileImageUrl?: string;
  experience: number; // years of experience
  averageRating: number;
  totalRatings: number;
  totalSessions: number;
  availability: string[]; // available time slots
  isActive: boolean;
}

const ExpertSchema = new Schema<IExpert>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  specializations: { type: [String], default: [] },
  bio: { type: String, required: true },
  profileImageUrl: { type: String },
  experience: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  availability: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  collection: 'experts'
});

export const Expert = mongoose.model<IExpert>('Expert', ExpertSchema);
