import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  eventType: string;
  userId?: mongoose.Types.ObjectId;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  changes?: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  eventType: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  entityType: { type: String },
  entityId: { type: Schema.Types.ObjectId },
  ipAddress: { type: String },
  userAgent: { type: String },
  changes: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: false, // We only need createdAt, defined above
  collection: 'audit_logs'
});

// TTL index to automatically delete logs older than 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ eventType: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
