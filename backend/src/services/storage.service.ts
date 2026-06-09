import mongoose from 'mongoose';
import {
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
  getFileMetadata,
  streamFromGridFS,
} from '../config/gridfs';
import { env } from '../config/env';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Configure AWS S3 Client
 */
let s3Client: S3Client | null = null;
if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.S3_BUCKET_NAME) {
  s3Client = new S3Client({
    region: env.AWS_REGION || 'ap-southeast-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Storage service abstraction layer
 * 
 * Currently uses MongoDB GridFS for file storage.
 * Can be easily migrated to AWS S3 or Google Cloud Storage in the future.
 * 
 * LIMITATIONS:
 * - GridFS URLs do not truly expire (Requirement 12.4 not fully met)
 * - For production, migrate to S3/GCS for presigned URLs with expiration
 */

export interface UploadOptions {
  userId?: string;
  assessmentId?: string;
  practiceSessionId?: string;
  phase?: string;
  sentenceId?: string;
  exerciseId?: string;
  mimetype: string;
  size: number;
}

export interface FileMetadata {
  fileId: string;
  filename: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export interface TemporaryUrl {
  url: string;
  expiresAt: Date;
  expiresIn: number; // seconds
}

/**
 * Storage Service
 */
export class StorageService {
  /**
   * Upload a file to storage
   * 
   * @param filename - Original filename
   * @param buffer - File buffer
   * @param options - Upload options and metadata
   * @returns File ID
   */
  static async upload(
    filename: string,
    buffer: Buffer,
    options: UploadOptions
  ): Promise<string> {
    try {
      const fileId = await uploadToGridFS(filename, buffer, {
        userId: options.userId,
        assessmentId: options.assessmentId,
        practiceSessionId: options.practiceSessionId,
        phase: options.phase,
        sentenceId: options.sentenceId,
        exerciseId: options.exerciseId,
        mimetype: options.mimetype,
        size: options.size,
      });

      return fileId.toString();
    } catch (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Download a file from storage
   * 
   * @param fileId - File identifier
   * @returns File buffer
   */
  static async download(fileId: string): Promise<Buffer> {
    try {
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error('Invalid file ID');
      }

      const objectId = new mongoose.Types.ObjectId(fileId);
      return await downloadFromGridFS(objectId);
    } catch (error) {
      console.error('Storage download error:', error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  /**
   * Delete a file from storage
   * 
   * @param fileId - File identifier
   */
  static async delete(fileId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error('Invalid file ID');
      }

      const objectId = new mongoose.Types.ObjectId(fileId);
      await deleteFromGridFS(objectId);
    } catch (error) {
      console.error('Storage delete error:', error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Get file metadata
   * 
   * @param fileId - File identifier
   * @returns File metadata
   */
  static async getMetadata(fileId: string): Promise<FileMetadata> {
    try {
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new Error('Invalid file ID');
      }

      const objectId = new mongoose.Types.ObjectId(fileId);
      const metadata = await getFileMetadata(objectId);

      return {
        fileId: metadata._id.toString(),
        filename: metadata.filename,
        size: metadata.length,
        mimetype: metadata.metadata?.mimetype || 'application/octet-stream',
        uploadedAt: metadata.uploadDate,
        metadata: metadata.metadata,
      };
    } catch (error) {
      console.error('Storage metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  /**
   * Get a stream for file download
   * 
   * @param fileId - File identifier
   * @returns Readable stream
   */
  static getStream(fileId: string): NodeJS.ReadableStream {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      throw new Error('Invalid file ID');
    }

    const objectId = new mongoose.Types.ObjectId(fileId);
    return streamFromGridFS(objectId);
  }

  static async generateTemporaryUrl(fileId: string, expiresIn: number = 3600): Promise<TemporaryUrl> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // If it's an S3 URL (we assume fileId is the S3 object key or URL if s3 is configured)
    if (s3Client && env.S3_BUCKET_NAME) {
      // In AudioController we save fileId as the full location URL or key. Let's assume it's the key if we use S3.
      // Wait, multer-s3 returns location (full URL) and key (S3 key). 
      // If we pass the S3 key or full url, we can extract the key.
      let key = fileId;
      if (fileId.startsWith('http')) {
        const parts = fileId.split('.com/');
        if (parts.length > 1) key = parts[1];
      }
      
      const command = new GetObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      
      return {
        url,
        expiresAt,
        expiresIn,
      };
    }

    // Fallback to GridFS
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      throw new Error('Invalid file ID');
    }

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/audio/stream/${fileId}`;

    return {
      url,
      expiresAt,
      expiresIn,
    };
  }

  /**
   * Validate file type
   * 
   * @param mimetype - File MIME type
   * @returns True if valid audio format
   */
  static isValidAudioFormat(mimetype: string): boolean {
    const allowedMimeTypes = [
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/webm',
      'audio/mpeg',
      'audio/mp3',
    ];
    return allowedMimeTypes.includes(mimetype.toLowerCase());
  }

  /**
   * Validate file size
   * 
   * @param size - File size in bytes
   * @param maxSizeMB - Maximum size in MB (default: 50MB per requirements)
   * @returns True if within size limit
   */
  static isValidFileSize(size: number, maxSizeMB: number = 50): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size > 0 && size <= maxBytes;
  }

  static getStorageType(): string {
    if (s3Client && env.S3_BUCKET_NAME) return 's3';
    return 'gridfs';
  }

  /**
   * Check if storage supports presigned URLs
   * 
   * @returns True if presigned URLs are supported
   */
  static supportsPresignedUrls(): boolean {
    // GridFS doesn't support true presigned URLs
    // S3 and GCS do support them
    return this.getStorageType() === 's3' || this.getStorageType() === 'gcs';
  }
}

/**
 * Export utility functions
 */
export const isValidAudioFormat = StorageService.isValidAudioFormat;
export const isValidFileSize = StorageService.isValidFileSize;
