import { Router } from 'express';
import { AudioController } from '../controllers/audio.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload, handleMulterError } from '../middleware/upload.middleware';
import { uploadLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

/**
 * POST /api/audio/upload
 * Upload audio file
 * Requires authentication
 */
router.post(
  '/upload',
  authMiddleware,
  uploadLimiter,
  upload.single('audio'), // Field name must be 'audio'
  handleMulterError,
  AudioController.uploadAudio
);

/**
 * GET /api/audio/:fileId
 * Stream audio file
 * Public endpoint (for playback)
 */
router.get(
  '/stream/:fileId',
  AudioController.streamAudio
);

/**
 * GET /api/audio/url/:recordingId
 * Generate temporary URL for audio file
 * Requires authentication
 * Requirement 12.4: Generate secure temporary URLs expiring after 3600 seconds
 */
router.get(
  '/url/:recordingId',
  authMiddleware,
  AudioController.getTemporaryUrl
);

/**
 * DELETE /api/audio/:recordingId
 * Delete audio recording
 * Requires authentication
 */
router.delete(
  '/:recordingId',
  authMiddleware,
  AudioController.deleteAudio
);

/**
 * GET /api/audio/recordings/:assessmentId
 * Get all recordings for an assessment
 * Requires authentication
 */
router.get(
  '/recordings/:assessmentId',
  authMiddleware,
  AudioController.getAssessmentRecordings
);

export default router;
