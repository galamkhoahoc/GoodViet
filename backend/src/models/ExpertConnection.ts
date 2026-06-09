import mongoose, { Schema, Document } from 'mongoose';

export interface IExpertConnection extends Document {
  userId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: Date;
  respondedAt?: Date;
}

const ExpertConnectionSchema = new Schema<IExpertConnection>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'expert_connections'
});

// Ensure a user can only have one connection to a specific expert
ExpertConnectionSchema.index({ userId: 1, expertId: 1 }, { unique: true });

export const ExpertConnection = mongoose.model<IExpertConnection>('ExpertConnection', ExpertConnectionSchema);
