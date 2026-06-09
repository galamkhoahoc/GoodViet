import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { Request } from 'express';
import { env } from '../config/env';

/**
 * Configure AWS S3 Client
 */
let s3: S3Client | null = null;
if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.S3_BUCKET_NAME) {
  s3 = new S3Client({
    region: env.AWS_REGION || 'ap-southeast-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Configure multer storage
 * Uses S3 if configured, otherwise falls back to memoryStorage (for local dev)
 */
const storage = s3 
  ? multerS3({
      s3: s3,
      bucket: env.S3_BUCKET_NAME!,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req: Request, file: Express.Multer.File, cb: any) {
        cb(null, `audio/${Date.now().toString()}-${file.originalname}`);
      }
    })
  : multer.memoryStorage();

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
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1, // Single file upload
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
        message: 'File quá lớn. Kích thước tối đa 10MB',
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
