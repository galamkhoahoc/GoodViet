import mongoose, { Schema, Document } from 'mongoose';

/**
 * Pronunciation Issue interface
 */
interface IPronunciationIssue {
  phoneme: 'L/N' | 'TR/CH' | 'S/X';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  timestamps: number[]; // seconds into recording
  detectedWord?: string;
  expectedWord?: string;
}

/**
 * Assessment interface
 */
export interface IAssessment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Completion status
  completedAt?: Date;
  phase: 'not_started' | 'phase_1' | 'phase_2' | 'phase_3' | 'processing' | 'completed';
  
  // Results (embedded)
  overallScore?: number;
  clarityScore?: number;
  fluencyScore?: number;
  speechRate?: number; // words per minute
  confidenceLevel?: 'low' | 'medium' | 'high';
  
  // Pronunciation issues (embedded array)
  pronunciationIssues: IPronunciationIssue[];
  
  // Recommended pathway
  recommendedPathwayId?: mongoose.Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pronunciation Issue sub-schema
 */
const PronunciationIssueSchema = new Schema<IPronunciationIssue>(
  {
    phoneme: {
      type: String,
      enum: ['L/N', 'TR/CH', 'S/X'],
      required: [true, 'Phoneme is required'],
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: [true, 'Severity is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    timestamps: {
      type: [Number],
      default: [],
    },
    detectedWord: {
      type: String,
      trim: true,
    },
    expectedWord: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Assessment schema definition
 */
const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    
    completedAt: Date,
    phase: {
      type: String,
      enum: ['not_started', 'phase_1', 'phase_2', 'phase_3', 'processing', 'completed'],
      default: 'not_started',
    },
    
    overallScore: {
      type: Number,
      min: [0, 'Overall score cannot be negative'],
      max: [100, 'Overall score cannot exceed 100'],
    },
    clarityScore: {
      type: Number,
      min: [0, 'Clarity score cannot be negative'],
      max: [100, 'Clarity score cannot exceed 100'],
    },
    fluencyScore: {
      type: Number,
      min: [0, 'Fluency score cannot be negative'],
      max: [100, 'Fluency score cannot exceed 100'],
    },
    speechRate: {
      type: Number,
      min: [0, 'Speech rate cannot be negative'],
    },
    confidenceLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    
    pronunciationIssues: {
      type: [PronunciationIssueSchema],
      default: [],
    },
    
    recommendedPathwayId: {
      type: Schema.Types.ObjectId,
      ref: 'PracticePathway',
    },
  },
  {
    timestamps: true,
    collection: 'assessments',
  }
);

// Indexes for performance
AssessmentSchema.index({ userId: 1 });
AssessmentSchema.index({ completedAt: -1 });
AssessmentSchema.index({ userId: 1, phase: 1 });
AssessmentSchema.index({ phase: 1 });

/**
 * Export Assessment model
 */
export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
