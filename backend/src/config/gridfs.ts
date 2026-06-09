import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let bucket: GridFSBucket | null = null;

/**
 * Initialize GridFS bucket for file storage
 */
export function initGridFS(): void {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB connection not established');
  }

  // Create GridFS bucket
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'audio_files' // Collection name prefix
  });

  console.log('✅ GridFS initialized for audio file storage');
}

/**
 * Get GridFS bucket instance
 */
export function getGridFSBucket(): GridFSBucket {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized. Call initGridFS() first.');
  }
  return bucket;
}

/**
 * Upload file to GridFS
 */
export async function uploadToGridFS(
  filename: string,
  buffer: Buffer,
  metadata?: Record<string, any>
): Promise<mongoose.Types.ObjectId> {
  const bucketInstance = getGridFSBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucketInstance.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadedAt: new Date(),
      },
    });

    uploadStream.on('finish', () => {
      resolve(uploadStream.id as mongoose.Types.ObjectId);
    });

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.end(buffer);
  });
}

/**
 * Download file from GridFS
 */
export async function downloadFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<Buffer> {
  const bucketInstance = getGridFSBucket();

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const downloadStream = bucketInstance.openDownloadStream(fileId);

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    downloadStream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Delete file from GridFS
 */
export async function deleteFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<void> {
  const bucketInstance = getGridFSBucket();
  
  try {
    await bucketInstance.delete(fileId);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

/**
 * Get file metadata from GridFS
 */
export async function getFileMetadata(
  fileId: mongoose.Types.ObjectId
): Promise<any> {
  const bucketInstance = getGridFSBucket();

  const files = await bucketInstance.find({ _id: fileId }).toArray();
  
  if (files.length === 0) {
    throw new Error('File not found');
  }

  return files[0];
}

/**
 * Stream file from GridFS (for serving to client)
 */
export function streamFromGridFS(
  fileId: mongoose.Types.ObjectId
): NodeJS.ReadableStream {
  const bucketInstance = getGridFSBucket();
  return bucketInstance.openDownloadStream(fileId);
}
