import multer from 'multer';
import { Request } from 'express';
import {
  MAX_AUDIO_FIELD_SIZE_BYTES,
  MAX_AUDIO_FILE_SIZE_BYTES,
  MAX_AUDIO_FILE_SIZE_MB,
  MAX_AUDIO_FORM_FIELDS,
} from '../config/audio';

export {
  MAX_AUDIO_FIELD_SIZE_BYTES,
  MAX_AUDIO_FILE_SIZE_BYTES,
  MAX_AUDIO_FILE_SIZE_MB,
  MAX_AUDIO_FORM_FIELDS,
} from '../config/audio';

/**
 * Configure multer storage
 * Buffer uploads in memory so ownership/session fencing runs before any S3 or
 * GridFS side effect. The controller delegates the actual storage write to
 * StorageService inside the temporary-account write transaction.
 */
const storage = multer.memoryStorage();

/**
 * File filter for audio files
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow only audio files
  const allowedMimeTypes = ['audio/wav', 'audio/webm', 'audio/mpeg', 'audio/mp3'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file audio (WAV, WEBM, MP3)'));
  }
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_AUDIO_FILE_SIZE_BYTES,
    files: 1, // Single file upload
    fields: MAX_AUDIO_FORM_FIELDS,
    parts: MAX_AUDIO_FORM_FIELDS + 1,
    fieldNameSize: 100,
    fieldSize: MAX_AUDIO_FIELD_SIZE_BYTES,
    headerPairs: 100,
  },
});

/**
 * Error handler for multer errors
 */
export function handleMulterError(error: any, req: Request, res: any, next: any) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `File quá lớn. Kích thước tối đa ${MAX_AUDIO_FILE_SIZE_MB}MB`,
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Chỉ có thể tải lên 1 file tại một thời điểm',
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      error: 'Upload error',
      message: error.message,
    });
  }
  
  next(error);
}
