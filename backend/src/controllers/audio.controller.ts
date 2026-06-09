import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AudioRecording } from '../models/AudioRecording';
import { AppError } from '../middleware/error.middleware';
import { StorageService } from '../services/storage.service';

/**
 * Audio controller for file upload and retrieval
 */
export class AudioController {
  /**
   * POST /api/audio/upload
   * Upload audio file to GridFS
   */
  static async uploadAudio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      // Check if file exists
      if (!req.file) {
        throw new AppError(400, 'Không có file audio được tải lên');
      }

      const file = req.file;

      // Validate file type
      if (!StorageService.isValidAudioFormat(file.mimetype)) {
        throw new AppError(400, 'Định dạng file không hợp lệ. Chỉ chấp nhận WAV, WEBM, MP3');
      }

      // Validate file size (max 50MB per requirements)
      if (!StorageService.isValidFileSize(file.size, 50)) {
        throw new AppError(400, 'File quá lớn. Kích thước tối đa 50MB');
      }

      // Extract metadata from request
      const { assessmentId, practiceSessionId, phase, sentenceId, exerciseId } = req.body;

      let fileId = '';
      let storageType = 's3';

      // Check if uploaded to S3 via multer-s3
      if ((file as any).location) {
        // file is already in S3
        fileId = (file as any).location; // Use full URL as fileId or extract key
      } else {
        // Upload to storage (GridFS fallback)
        const uploadedFileId = await StorageService.upload(file.originalname, file.buffer, {
          userId,
          assessmentId,
          practiceSessionId,
          phase,
          sentenceId,
          exerciseId,
          mimetype: file.mimetype,
          size: file.size,
        });
        fileId = uploadedFileId.toString();
        storageType = StorageService.getStorageType();
      }

      // Determine format
      let format: 'wav' | 'webm' | 'mp3' = 'wav';
      if (file.mimetype === 'audio/webm') format = 'webm';
      if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') format = 'mp3';

      // Create AudioRecording document
      const recording = await AudioRecording.create({
        assessmentId: assessmentId ? new mongoose.Types.ObjectId(assessmentId) : undefined,
        practiceSessionId: practiceSessionId ? new mongoose.Types.ObjectId(practiceSessionId) : undefined,
        phase,
        sentenceId,
        exerciseId,
        fileUrl: storageType === 's3' ? fileId : `${storageType}://${fileId}`,
        fileSize: file.size,
        duration: 0, // TODO: Extract from audio metadata
        format,
        sampleRate: 44100, // TODO: Extract from audio metadata
      });

      res.status(201).json({
        success: true,
        message: 'File đã được tải lên thành công',
        recording: {
          id: recording._id,
          fileId: fileId.toString(),
          filename: file.originalname,
          size: file.size,
          format,
          uploadedAt: recording.uploadedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/audio/:fileId
   * Stream audio file from GridFS
   */
  static async streamAudio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fileId } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new AppError(400, 'ID file không hợp lệ');
      }

      const objectId = new mongoose.Types.ObjectId(fileId);

      // Get file metadata
      const metadata = await StorageService.getMetadata(fileId);

      if (!metadata) {
        throw new AppError(404, 'File không tồn tại');
      }

      // Set appropriate headers
      res.set({
        'Content-Type': metadata.mimetype,
        'Content-Length': metadata.size.toString(),
        'Content-Disposition': `inline; filename="${metadata.filename}"`,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      });

      // Stream file
      const stream = StorageService.getStream(fileId);
      stream.pipe(res);

      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Không thể tải file',
            message: 'Đã xảy ra lỗi khi tải file',
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/audio/:recordingId
   * Delete audio recording
   */
  static async deleteAudio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const { recordingId } = req.params;

      // Find recording
      const recording = await AudioRecording.findById(recordingId);

      if (!recording) {
        throw new AppError(404, 'Recording không tồn tại');
      }

      // Extract fileId from fileUrl (format: storageType://fileId)
      const fileId = recording.fileUrl.split('://')[1];

      if (!fileId) {
        throw new AppError(400, 'Invalid file URL format');
      }

      // Delete from storage
      await StorageService.delete(fileId);

      // Delete recording document
      await AudioRecording.findByIdAndDelete(recordingId);

      res.status(200).json({
        success: true,
        message: 'File đã được xóa thành công',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/audio/recordings/:assessmentId
   * Get all recordings for an assessment
   */
  static async getAssessmentRecordings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const { assessmentId } = req.params;

      // Find recordings
      const recordings = await AudioRecording.find({ assessmentId }).sort({ uploadedAt: -1 });

      res.status(200).json({
        success: true,
        count: recordings.length,
        recordings: recordings.map((r) => ({
          id: r._id,
          fileId: r.fileUrl.replace('gridfs://', ''),
          phase: r.phase,
          sentenceId: r.sentenceId,
          fileSize: r.fileSize,
          duration: r.duration,
          format: r.format,
          uploadedAt: r.uploadedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/audio/url/:recordingId
   * Generate temporary URL for audio file access
   * Requirement 12.4: Generate secure temporary URLs expiring after 3600 seconds
   */
  static async getTemporaryUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const { recordingId } = req.params;
      const expiresIn = parseInt(req.query.expiresIn as string) || 3600; // Default 1 hour

      // Validate expiration time (max 24 hours)
      if (expiresIn < 60 || expiresIn > 86400) {
        throw new AppError(400, 'Thời gian hết hạn phải từ 60 đến 86400 giây');
      }

      // Find recording
      const recording = await AudioRecording.findById(recordingId);

      if (!recording) {
        throw new AppError(404, 'Recording không tồn tại');
      }

      // TODO: Verify user owns this recording (check via assessment or practice session)

      // Extract fileId from fileUrl
      const fileId = recording.fileUrl.split('://')[1];

      if (!fileId) {
        throw new AppError(400, 'Invalid file URL format');
      }

      // Generate temporary URL
      const tempUrl = await StorageService.generateTemporaryUrl(fileId, expiresIn);

      res.status(200).json({
        success: true,
        url: tempUrl.url,
        expiresAt: tempUrl.expiresAt,
        expiresIn: tempUrl.expiresIn,
        warning: StorageService.supportsPresignedUrls()
          ? undefined
          : 'URL expiration not enforced with current storage (GridFS). Migrate to S3/GCS for secure presigned URLs.',
      });
    } catch (error) {
      next(error);
    }
  }
}
