import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AudioRecording } from '../models/AudioRecording';
import { Assessment } from '../models/Assessment';
import { PracticeProgress } from '../models/PracticeProgress';
import { PracticeSession } from '../models/PracticeSession';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';
import { runWithRequestSessionWrite } from '../middleware/auth.middleware';
import { StorageService } from '../services/storage.service';
import { MAX_AUDIO_FILE_SIZE_MB } from '../config/audio';

async function findOwnedRecording(
  recordingId: string,
  userId: string,
  includeDeletionPending = false
) {
  if (!mongoose.Types.ObjectId.isValid(recordingId)) {
    throw new AppError(400, 'Invalid Recording ID');
  }

  const ownerId = new mongoose.Types.ObjectId(userId);
  const recording = await AudioRecording.findOne({
    _id: recordingId,
    ...(includeDeletionPending ? {} : { deletionPendingAt: { $exists: false } }),
    $or: [
      { userId: ownerId },
      { userId: { $exists: false } },
      { userId: null },
    ],
  });

  if (!recording || recording.userId) {
    return recording;
  }

  // Recordings created before userId was introduced are owned through their
  // assessment or practice-session parent. Never grant access to an unlinked
  // legacy recording.
  let hasResolvedParent = false;
  if (recording.assessmentId) {
    hasResolvedParent = true;
    const ownedAssessment = await Assessment.exists({
      _id: recording.assessmentId,
      userId: ownerId,
    });
    if (!ownedAssessment) return null;
  }

  if (recording.practiceSessionId) {
    hasResolvedParent = true;
    const practiceSession = await PracticeSession.findById(recording.practiceSessionId)
      .select('progressId')
      .lean();
    const ownedProgress = practiceSession
      ? await PracticeProgress.exists({ _id: practiceSession.progressId, userId: ownerId })
      : null;
    if (!ownedProgress) return null;
  }

  return hasResolvedParent ? recording : null;
}

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
    let pendingUpload: {
      location: string;
      recordingId: mongoose.Types.ObjectId;
      userId: string;
    } | undefined;

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
      if (!StorageService.isValidFileSize(file.size, MAX_AUDIO_FILE_SIZE_MB)) {
        throw new AppError(
          400,
          `File quá lớn. Kích thước tối đa ${MAX_AUDIO_FILE_SIZE_MB}MB`
        );
      }

      // Extract metadata from request
      const { assessmentId, practiceSessionId, phase, sentenceId, exerciseId } = req.body;

      if (assessmentId) {
        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
          throw new AppError(400, 'Invalid Assessment ID');
        }
        const assessment = await Assessment.exists({ _id: assessmentId, userId });
        if (!assessment) {
          throw new AppError(404, 'Assessment not found');
        }
      }

      if (practiceSessionId) {
        if (!mongoose.Types.ObjectId.isValid(practiceSessionId)) {
          throw new AppError(400, 'Invalid Practice Session ID');
        }
        const practiceSession = await PracticeSession.findById(practiceSessionId)
          .select('progressId')
          .lean();
        const ownedProgress = practiceSession
          ? await PracticeProgress.exists({ _id: practiceSession.progressId, userId })
          : null;
        if (!practiceSession || !ownedProgress) {
          throw new AppError(404, 'Practice session not found');
        }
      }

      // Determine format
      let format: 'wav' | 'webm' | 'mp3' = 'wav';
      if (file.mimetype === 'audio/webm') format = 'webm';
      if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') format = 'mp3';

      const storageId = new mongoose.Types.ObjectId().toString();
      const recordingId = new mongoose.Types.ObjectId();
      let fileId = '';
      const recording = await runWithRequestSessionWrite(req, async () => {
        // Storage uses the stable storageId, making a MongoDB transaction retry
        // idempotent for both S3 and GridFS.
        fileId = await StorageService.upload(file.originalname, file.buffer, {
          userId,
          storageId,
          assessmentId,
          practiceSessionId,
          phase,
          sentenceId,
          exerciseId,
          mimetype: file.mimetype,
          size: file.size,
        });
        const storageType = StorageService.getStorageType();
        const fileLocation = storageType === 's3'
          ? fileId
          : `${storageType}://${fileId}`;
        pendingUpload = {
          location: fileLocation,
          recordingId,
          userId,
        };

        return AudioRecording.create({
          _id: recordingId,
          userId: new mongoose.Types.ObjectId(userId),
          assessmentId: assessmentId ? new mongoose.Types.ObjectId(assessmentId) : undefined,
          practiceSessionId: practiceSessionId ? new mongoose.Types.ObjectId(practiceSessionId) : undefined,
          phase,
          sentenceId,
          exerciseId,
          fileUrl: fileLocation,
          fileSize: file.size,
          duration: 0, // TODO: Extract from audio metadata
          format,
          sampleRate: 44100, // TODO: Extract from audio metadata
        });
      });
      pendingUpload = undefined;

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
      if (pendingUpload) {
        try {
          // A transaction can commit even if its acknowledgement is lost.
          // Reconcile the stable metadata ID before removing the external blob
          // so a committed recording never points at a deleted object.
          const committed = await AudioRecording.exists({
            _id: pendingUpload.recordingId,
            userId: new mongoose.Types.ObjectId(pendingUpload.userId),
            fileUrl: pendingUpload.location,
          });
          if (!committed) {
            await StorageService.deleteLocation(pendingUpload.location);
          }
        } catch (reconciliationError) {
          // Keeping a possible orphan is safer than deleting a blob whose
          // transaction outcome cannot be established. Guest reset sweeps the
          // user-scoped storage prefix as a final backstop.
          console.error('Failed to reconcile an interrupted audio upload:', reconciliationError);
        }
      }
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

      const token = typeof req.query.token === 'string' ? req.query.token : '';
      let grant: ReturnType<typeof StorageService.verifyTemporaryStreamToken>;
      try {
        grant = StorageService.verifyTemporaryStreamToken(fileId, token);
      } catch {
        throw new AppError(401, 'Invalid or expired audio access token');
      }

      const owner = await User.findById(grant.userId)
        .select('accountType sessionVersion resetInProgress isActive');
      if (
        !owner?.isActive
        || (
          owner.accountType === 'temporary'
          && (
            owner.sessionVersion !== grant.sessionVersion
            || owner.resetInProgress
          )
        )
      ) {
        throw new AppError(401, 'Invalid or expired audio access token');
      }

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
        'Cache-Control': 'private, no-store',
        Pragma: 'no-cache',
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

      // New recordings carry userId. Legacy recordings are resolved through an
      // owned assessment/practice parent so existing users retain access.
      const recording = await findOwnedRecording(recordingId, userId, true);

      if (!recording) {
        throw new AppError(404, 'Recording không tồn tại');
      }

      try {
        await runWithRequestSessionWrite(req, () => AudioRecording.updateOne(
          { _id: recordingId },
          { $set: { deletionPendingAt: new Date() } }
        ));
      } catch (markError) {
        try {
          const markerCommitted = await AudioRecording.exists({
            _id: recordingId,
            deletionPendingAt: { $exists: true },
          });
          if (!markerCommitted) throw markError;
        } catch (reconciliationError) {
          throw reconciliationError === markError ? markError : reconciliationError;
        }
      }

      // The durable marker commits before the destructive external side effect.
      // If storage deletion fails, the row remains retryable instead of
      // silently becoming an unreachable orphan.
      await StorageService.deleteLocation(recording.fileUrl);

      try {
        await runWithRequestSessionWrite(req, () => AudioRecording.deleteOne({ _id: recordingId }));
      } catch (deleteError) {
        try {
          const rowStillExists = await AudioRecording.exists({ _id: recordingId });
          if (rowStillExists) throw deleteError;
        } catch (reconciliationError) {
          throw reconciliationError === deleteError ? deleteError : reconciliationError;
        }
      }

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

      if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
        throw new AppError(400, 'Invalid Assessment ID');
      }

      const ownerId = new mongoose.Types.ObjectId(userId);
      const ownedAssessment = await Assessment.exists({ _id: assessmentId, userId: ownerId });
      if (!ownedAssessment) {
        throw new AppError(404, 'Assessment not found');
      }

      // Include legacy rows without userId only after establishing ownership of
      // the parent assessment.
      const recordings = await AudioRecording.find({
        assessmentId,
        deletionPendingAt: { $exists: false },
        $or: [
          { userId: ownerId },
          { userId: { $exists: false } },
          { userId: null },
        ],
      }).sort({ uploadedAt: -1 });

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

      const recording = await findOwnedRecording(recordingId, userId);

      if (!recording) {
        throw new AppError(404, 'Recording không tồn tại');
      }

      const fileId = recording.fileUrl.startsWith('gridfs://')
        ? recording.fileUrl.slice('gridfs://'.length)
        : recording.fileUrl;

      // Generate temporary URL
      const tempUrl = await StorageService.generateTemporaryUrl(fileId, expiresIn, {
        userId,
        sessionVersion: req.sessionVersion ?? 0,
      });

      res.set({
        'Cache-Control': 'private, no-store',
        Pragma: 'no-cache',
        Expires: '0',
      });
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
