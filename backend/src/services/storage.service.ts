import mongoose from 'mongoose';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import {
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
  deleteUserFilesFromGridFS,
  getFileMetadata,
  isMissingGridFSFileError,
  streamFromGridFS,
} from '../config/gridfs';
import { env } from '../config/env';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
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
 * GridFS playback URLs use application HMAC grants; S3 uses native presigning.
 */

export interface UploadOptions {
  userId: string;
  storageId?: string;
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

export interface TemporaryStreamOwner {
  userId: string;
  sessionVersion: number;
}

export interface TemporaryStreamGrant extends TemporaryStreamOwner {
  fileId: string;
  expiresAt: number;
}

function extractS3Key(location: string): string {
  if (location.startsWith('s3://')) {
    const withoutScheme = location.slice('s3://'.length);
    const slashIndex = withoutScheme.indexOf('/');
    return slashIndex >= 0 ? withoutScheme.slice(slashIndex + 1) : '';
  }
  if (location.startsWith('http://') || location.startsWith('https://')) {
    return decodeURIComponent(new URL(location).pathname.replace(/^\//, ''));
  }
  return location;
}

function isS3PreconditionFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as {
    name?: unknown;
    $metadata?: { httpStatusCode?: unknown };
  };
  return candidate.name === 'PreconditionFailed'
    || candidate.$metadata?.httpStatusCode === 412;
}

type S3CommandSender = Pick<S3Client, 'send'>;
type S3DeleteTarget = { Key: string; VersionId?: string };

async function deleteS3Batch(
  client: S3CommandSender,
  bucketName: string,
  targets: S3DeleteTarget[]
): Promise<number> {
  let deleted = 0;

  for (let offset = 0; offset < targets.length; offset += 1000) {
    const batch = targets.slice(offset, offset + 1000);
    const result = await client.send(new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: batch, Quiet: true },
    }));
    if (result.Errors && result.Errors.length > 0) {
      throw new Error(`Failed to delete ${result.Errors.length} S3 audio object version(s)`);
    }
    deleted += batch.length;
  }

  return deleted;
}

/**
 * Permanently remove every object version and delete marker in a prefix (or
 * for one exact key), then sweep current unversioned objects. S3's ordinary
 * DeleteObject operation only creates a delete marker in a versioned bucket,
 * so it is insufficient for temporary-account erasure.
 */
export async function deleteS3ObjectScope(
  client: S3CommandSender,
  bucketName: string,
  prefix: string,
  exactKey?: string
): Promise<number> {
  const inScope = (key: string | undefined): key is string => (
    Boolean(key) && (!exactKey || key === exactKey)
  );
  let deleted = 0;
  let keyMarker: string | undefined;
  let versionIdMarker: string | undefined;
  let versionsTruncated: boolean;

  do {
    const listed = await client.send(new ListObjectVersionsCommand({
      Bucket: bucketName,
      Prefix: prefix,
      KeyMarker: keyMarker,
      VersionIdMarker: versionIdMarker,
    }));
    const versionTargets: S3DeleteTarget[] = [
      ...(listed.Versions ?? []),
      ...(listed.DeleteMarkers ?? []),
    ]
      .filter((entry) => inScope(entry.Key))
      .map((entry) => entry.VersionId
        ? { Key: entry.Key!, VersionId: entry.VersionId }
        : { Key: entry.Key! });

    deleted += await deleteS3Batch(client, bucketName, versionTargets);
    versionsTruncated = Boolean(listed.IsTruncated);
    keyMarker = listed.NextKeyMarker;
    versionIdMarker = listed.NextVersionIdMarker;
    if (versionsTruncated && !keyMarker) {
      throw new Error('S3 version listing was truncated without a continuation marker');
    }
  } while (versionsTruncated);

  let continuationToken: string | undefined;
  let objectsTruncated: boolean;
  do {
    const listed = await client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    const currentTargets = (listed.Contents ?? [])
      .filter((entry) => inScope(entry.Key))
      .map((entry) => ({ Key: entry.Key! }));

    deleted += await deleteS3Batch(client, bucketName, currentTargets);
    objectsTruncated = Boolean(listed.IsTruncated);
    continuationToken = listed.NextContinuationToken;
    if (objectsTruncated && !continuationToken) {
      throw new Error('S3 object listing was truncated without a continuation token');
    }
  } while (objectsTruncated);

  return deleted;
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
      if (s3Client && env.S3_BUCKET_NAME) {
        const storageId = options.storageId || new mongoose.Types.ObjectId().toString();
        const safeFilename = filename
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .slice(-120) || 'audio';
        const key = `audio/${options.userId}/${storageId}-${safeFilename}`;
        const location = `s3://${env.S3_BUCKET_NAME}/${key}`;
        try {
          await s3Client.send(new PutObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: options.mimetype,
            CacheControl: 'private, no-store',
            // MongoDB may retry a transaction callback. A conditional write
            // keeps the stable storageId from creating another S3 version.
            IfNoneMatch: '*',
          }));
        } catch (uploadError) {
          if (isS3PreconditionFailure(uploadError)) {
            return location;
          }
          // A transport failure can happen after S3 persisted the object. Head
          // the deterministic key before surfacing the error so the caller
          // does not create or delete contradictory metadata.
          try {
            await s3Client.send(new HeadObjectCommand({
              Bucket: env.S3_BUCKET_NAME,
              Key: key,
            }));
          } catch {
            throw uploadError;
          }
        }
        return location;
      }

      const requestedFileId = options.storageId
        ? new mongoose.Types.ObjectId(options.storageId)
        : undefined;
      const contentSha256 = createHash('sha256').update(buffer).digest('hex');
      const fileId = await uploadToGridFS(filename, buffer, {
        userId: options.userId,
        assessmentId: options.assessmentId,
        practiceSessionId: options.practiceSessionId,
        phase: options.phase,
        sentenceId: options.sentenceId,
        exerciseId: options.exerciseId,
        mimetype: options.mimetype,
        size: options.size,
        contentSha256,
      }, requestedFileId);

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
   * Delete a stored object from the canonical location persisted on an
   * AudioRecording. GridFS locations use gridfs://<objectId>; S3 locations are
   * stored as an s3:// location (legacy HTTP S3 URLs remain supported).
   */
  static async deleteLocation(fileUrl: string): Promise<void> {
    if (fileUrl.startsWith('gridfs://')) {
      await this.delete(fileUrl.slice('gridfs://'.length));
      return;
    }

    if (fileUrl.startsWith('s3://') || fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      if (!s3Client || !env.S3_BUCKET_NAME) {
        throw new Error('S3 is not configured; cannot delete stored audio object');
      }

      const key = extractS3Key(fileUrl);

      if (!key) {
        throw new Error('Invalid S3 audio location');
      }

      await deleteS3ObjectScope(s3Client, env.S3_BUCKET_NAME, key, key);
      return;
    }

    // Backward compatibility for old GridFS rows that stored only an ObjectId.
    await this.delete(fileUrl);
  }

  /** Delete orphaned GridFS uploads tagged with this user ID. */
  static async deleteGridFSFilesForUser(userId: string): Promise<number> {
    return deleteUserFilesFromGridFS(userId);
  }

  /**
   * Delete every S3 object under the per-user upload prefix. This also catches
   * uploads that reached S3 but failed before an AudioRecording row was saved.
   */
  static async deleteS3FilesForUser(userId: string): Promise<number> {
    if (!s3Client || !env.S3_BUCKET_NAME) {
      return 0;
    }

    return deleteS3ObjectScope(
      s3Client,
      env.S3_BUCKET_NAME,
      `audio/${userId}/`
    );
  }

  /**
   * Get file metadata
   * 
   * @param fileId - File identifier
   * @returns File metadata
   */
  static async getMetadata(fileId: string): Promise<FileMetadata | null> {
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
      if (isMissingGridFSFileError(error)) {
        return null;
      }
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

  static async generateTemporaryUrl(
    fileId: string,
    expiresIn: number = 3600,
    owner?: TemporaryStreamOwner
  ): Promise<TemporaryUrl> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // If it's an S3 URL (we assume fileId is the S3 object key or URL if s3 is configured)
    if (
      s3Client
      && env.S3_BUCKET_NAME
      && !mongoose.Types.ObjectId.isValid(fileId)
    ) {
      const key = extractS3Key(fileId);
      
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
    if (
      !owner?.userId
      || !Number.isInteger(owner.sessionVersion)
      || owner.sessionVersion < 0
    ) {
      throw new Error('Audio stream owner context is required');
    }

    const baseUrl = env.API_BASE_URL || `http://localhost:${env.PORT}`;
    const payload = Buffer.from(JSON.stringify({
      f: fileId,
      u: owner.userId,
      v: owner.sessionVersion,
      exp: expiresAt.getTime(),
    })).toString('base64url');
    const signature = createHmac('sha256', env.JWT_SECRET)
      .update(payload)
      .digest('base64url');
    const token = `${payload}.${signature}`;
    const url = `${baseUrl}/api/audio/stream/${fileId}?token=${encodeURIComponent(token)}`;

    return {
      url,
      expiresAt,
      expiresIn,
    };
  }

  static verifyTemporaryStreamToken(fileId: string, token: string): TemporaryStreamGrant {
    const [payload, providedSignature, extra] = token.split('.');
    if (!payload || !providedSignature || extra) {
      throw new Error('Invalid or expired audio access token');
    }

    const expectedSignature = createHmac('sha256', env.JWT_SECRET)
      .update(payload)
      .digest('base64url');
    const provided = Buffer.from(providedSignature);
    const expected = Buffer.from(expectedSignature);
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      throw new Error('Invalid or expired audio access token');
    }

    let decoded: { f?: unknown; u?: unknown; v?: unknown; exp?: unknown };
    try {
      decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
      throw new Error('Invalid or expired audio access token');
    }

    if (
      decoded.f !== fileId
      || typeof decoded.u !== 'string'
      || !decoded.u
      || typeof decoded.v !== 'number'
      || !Number.isInteger(decoded.v)
      || decoded.v < 0
      || typeof decoded.exp !== 'number'
      || !Number.isFinite(decoded.exp)
      || decoded.exp <= Date.now()
    ) {
      throw new Error('Invalid or expired audio access token');
    }

    return {
      fileId,
      userId: decoded.u,
      sessionVersion: decoded.v,
      expiresAt: decoded.exp,
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
    // S3 uses AWS presigning; GridFS uses an HMAC-scoped, expiring stream URL.
    return true;
  }
}

/**
 * Export utility functions
 */
export const isValidAudioFormat = StorageService.isValidAudioFormat;
export const isValidFileSize = StorageService.isValidFileSize;
