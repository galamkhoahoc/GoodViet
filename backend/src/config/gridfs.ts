import mongoose from 'mongoose';

let bucket: mongoose.mongo.GridFSBucket | null = null;

export function isMissingGridFSFileError(error: unknown): boolean {
  return error instanceof Error && /file\s*not\s*found/i.test(error.message);
}

/**
 * Initialize GridFS bucket for file storage
 */
export function initGridFS(): void {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB connection not established');
  }

  // Create GridFS bucket
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'audio_files' // Collection name prefix
  });

  console.log('✅ GridFS initialized for audio file storage');
}

/**
 * Get GridFS bucket instance
 */
export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
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
  metadata?: Record<string, any>,
  fileId?: mongoose.Types.ObjectId
): Promise<mongoose.Types.ObjectId> {
  const bucketInstance = getGridFSBucket();

  if (fileId) {
    const existing = await bucketInstance.find({ _id: fileId }).limit(1).toArray();
    if (existing.length > 0) {
      const existingFile = existing[0];
      const existingMetadata = existingFile.metadata ?? {};
      const identityFields = ['userId', 'mimetype', 'size', 'contentSha256'];
      const matchesExpectedUpload = existingFile.filename === filename
        && existingFile.length === buffer.length
        && identityFields.every((field) => (
          metadata?.[field] === undefined
          || existingMetadata[field] === metadata[field]
        ));

      if (matchesExpectedUpload) return fileId;

      // Never overwrite or clean up an existing object whose stable ID belongs
      // to different content. A transaction retry is accepted only when its
      // owner/content identity is identical to the completed first attempt.
      throw new Error(`GridFS storage ID collision for ${fileId.toString()}`);
    }
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      metadata: {
        ...metadata,
        uploadedAt: new Date(),
      },
    };
    const uploadStream = fileId
      ? bucketInstance.openUploadStreamWithId(fileId, filename, uploadOptions)
      : bucketInstance.openUploadStream(filename, uploadOptions);

    let settled = false;

    uploadStream.once('finish', () => {
      if (settled) return;
      settled = true;
      resolve(uploadStream.id as mongoose.Types.ObjectId);
    });

    uploadStream.once('error', (error) => {
      if (settled) return;
      settled = true;

      void (async () => {
        let cleanupError: unknown;

        // abort() is the driver's supported way to remove chunks written by a
        // failed upload. It can reject after _final has started, so follow it
        // with bucket.delete(), which also removes orphan chunks before it
        // reports a missing files document.
        try {
          await uploadStream.abort();
        } catch (abortError) {
          cleanupError = abortError;
        }

        try {
          await bucketInstance.delete(uploadStream.id as mongoose.Types.ObjectId);
          cleanupError = undefined;
        } catch (deleteError) {
          if (isMissingGridFSFileError(deleteError)) {
            // GridFSBucket.delete() removes orphan chunks before emitting its
            // missing-file error, so this is a successful cleanup outcome.
            cleanupError = undefined;
          } else {
            cleanupError = deleteError;
          }
        }

        if (cleanupError) {
          const detail = cleanupError instanceof Error
            ? cleanupError.message
            : String(cleanupError);
          reject(new Error(`GridFS upload failed and partial-file cleanup failed: ${detail}`));
          return;
        }

        reject(error);
      })();
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
    if (isMissingGridFSFileError(error)) {
      return;
    }
    throw new Error(`Failed to delete file: ${error}`);
  }
}

/**
 * Delete every GridFS file owned by a user, including orphaned uploads that do
 * not have a matching AudioRecording document.
 */
export async function deleteUserFilesFromGridFS(userId: string): Promise<number> {
  const bucketInstance = getGridFSBucket();
  const files = await bucketInstance.find({ 'metadata.userId': userId }).toArray();

  for (const file of files) {
    try {
      await bucketInstance.delete(file._id);
    } catch (error) {
      // A concurrent/idempotent reset may already have removed the same file.
      if (!isMissingGridFSFileError(error)) {
        throw error;
      }
    }
  }

  return files.length;
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
