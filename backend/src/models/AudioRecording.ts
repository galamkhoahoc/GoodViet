import mongoose, { Schema, Document } from 'mongoose';

/**
 * AudioRecording interface
 */
export interface IAudioRecording extends Document {
  _id: mongoose.Types.ObjectId;
  assessmentId?: mongoose.Types.ObjectId;
  practiceSessionId?: mongoose.Types.ObjectId;
  
  // Recording details
  phase?: 'phase_1' | 'phase_2' | 'phase_3';
  sentenceId?: string;
  exerciseId?: string;
  
  // File information
  fileUrl: string; // S3/GCS URL
  fileSize: number; // bytes
  duration: number; // seconds
  format: 'wav' | 'webm' | 'mp3';
  sampleRate: number; // Hz
  
  // Upload metadata
  uploadedAt: Date;
}

/**
 * AudioRecording schema definition
 */
const AudioRecordingSchema = new Schema<IAudioRecording>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      index: true,
    },
    practiceSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'PracticeSession',
      index: true,
    },
    
    phase: {
      type: String,
      enum: ['phase_1', 'phase_2', 'phase_3'],
    },
    sentenceId: {
      type: String,
      trim: true,
    },
    exerciseId: {
      type: String,
      trim: true,
    },
    
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration cannot be negative'],
    },
    format: {
      type: String,
      enum: ['wav', 'webm', 'mp3'],
      required: [true, 'Format is required'],
    },
    sampleRate: {
      type: Number,
      required: [true, 'Sample rate is required'],
      min: [0, 'Sample rate cannot be negative'],
    },
    
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'audio_recordings',
  }
);

// Indexes for performance
// Note: assessmentId, practiceSessionId, uploadedAt already indexed via index:true
// Compound index for assessment recordings
AudioRecordingSchema.index({ assessmentId: 1, phase: 1 });

/**
 * Export AudioRecording model
 */
export const AudioRecording = mongoose.model<IAudioRecording>('AudioRecording', AudioRecordingSchema);
