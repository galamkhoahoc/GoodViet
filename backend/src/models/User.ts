import mongoose, { Schema, Document } from 'mongoose';

/**
 * User interface
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  
  // Account status
  isActive: boolean;
  verifiedEmail: boolean;
  lastLoginAt?: Date;
  
  // Profile
  profileImageUrl?: string;
  targetGoals?: string;
  learningStyle?: string;
  
  // Assessment status
  assessmentCompleted: boolean;
  currentPathwayId?: mongoose.Types.ObjectId;
  
  // Timestamps (auto-managed by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema definition
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^0\d{9}$/, 'Phone number must be 10 digits starting with 0'],
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: Date,
    
    profileImageUrl: String,
    targetGoals: String,
    learningStyle: String,
    
    assessmentCompleted: {
      type: Boolean,
      default: false,
    },
    currentPathwayId: {
      type: Schema.Types.ObjectId,
      ref: 'PracticePathway',
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes for performance
// Note: email already indexed via unique:true, no need to index again
UserSchema.index({ createdAt: -1 });
UserSchema.index({ assessmentCompleted: 1 });

/**
 * Export User model
 */
export const User = mongoose.model<IUser>('User', UserSchema);
