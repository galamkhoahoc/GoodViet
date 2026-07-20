import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import {
  initGridFS,
  isMissingGridFSFileError,
  uploadToGridFS,
} from './gridfs';

async function withGridFSBucket<T>(
  fakeBucket: unknown,
  operation: () => Promise<T>
): Promise<T> {
  const bucketDescriptor = Object.getOwnPropertyDescriptor(
    mongoose.mongo,
    'GridFSBucket'
  );
  const connectionDbDescriptor = Object.getOwnPropertyDescriptor(
    mongoose.connection,
    'db'
  );

  try {
    Object.defineProperty(mongoose.mongo, 'GridFSBucket', {
      configurable: true,
      value: jest.fn(() => fakeBucket),
    });
    Object.defineProperty(mongoose.connection, 'db', {
      configurable: true,
      value: {},
    });
    initGridFS();
    return await operation();
  } finally {
    if (bucketDescriptor) {
      Object.defineProperty(mongoose.mongo, 'GridFSBucket', bucketDescriptor);
    }
    if (connectionDbDescriptor) {
      Object.defineProperty(mongoose.connection, 'db', connectionDbDescriptor);
    } else {
      delete (mongoose.connection as unknown as { db?: unknown }).db;
    }
  }
}

describe('GridFS missing-file detection', () => {
  it.each([
    'File not found for id 507f1f77bcf86cd799439011',
    'FileNotFound: 507f1f77bcf86cd799439011',
  ])('treats an already deleted file as idempotent: %s', (message) => {
    expect(isMissingGridFSFileError(new Error(message))).toBe(true);
  });

  it('does not hide unrelated storage failures', () => {
    expect(isMissingGridFSFileError(new Error('connection closed'))).toBe(false);
  });

  it('aborts and sweeps orphan chunks before rejecting a failed upload', async () => {
    const uploadError = new Error('chunk write failed');
    const stream = new EventEmitter() as EventEmitter & {
      id: mongoose.Types.ObjectId;
      abort: jest.Mock;
      end: jest.Mock;
    };
    stream.id = new mongoose.Types.ObjectId();
    stream.abort = jest.fn().mockResolvedValue(undefined);
    stream.end = jest.fn(() => {
      queueMicrotask(() => stream.emit('error', uploadError));
    });

    const fakeBucket = {
      openUploadStream: jest.fn().mockReturnValue(stream),
      delete: jest.fn().mockRejectedValue(new Error(`File not found for id ${stream.id}`)),
    };

    await withGridFSBucket(fakeBucket, async () => {
      await expect(uploadToGridFS('failed.webm', Buffer.from('audio')))
        .rejects.toBe(uploadError);
      expect(stream.abort).toHaveBeenCalledTimes(1);
      expect(fakeBucket.delete).toHaveBeenCalledWith(stream.id);
    });
  });

  it('reuses a completed same-ID upload only when owner and content match', async () => {
    const fileId = new mongoose.Types.ObjectId();
    const buffer = Buffer.from('same audio');
    const metadata = {
      userId: '507f1f77bcf86cd799439011',
      mimetype: 'audio/webm',
      size: buffer.length,
      contentSha256: 'expected-content-hash',
    };
    const cursor = {
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{
        _id: fileId,
        filename: 'retry.webm',
        length: buffer.length,
        metadata,
      }]),
    };
    const fakeBucket = {
      find: jest.fn().mockReturnValue(cursor),
      openUploadStreamWithId: jest.fn(),
    };

    await withGridFSBucket(fakeBucket, async () => {
      await expect(uploadToGridFS(
        'retry.webm',
        buffer,
        metadata,
        fileId
      )).resolves.toEqual(fileId);
    });

    expect(fakeBucket.find).toHaveBeenCalledWith({ _id: fileId });
    expect(fakeBucket.openUploadStreamWithId).not.toHaveBeenCalled();
  });

  it('refuses a same-ID collision without deleting the existing blob', async () => {
    const fileId = new mongoose.Types.ObjectId();
    const cursor = {
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{
        _id: fileId,
        filename: 'existing.webm',
        length: 10,
        metadata: {
          userId: 'different-owner',
          contentSha256: 'different-content',
        },
      }]),
    };
    const fakeBucket = {
      find: jest.fn().mockReturnValue(cursor),
      openUploadStreamWithId: jest.fn(),
      delete: jest.fn(),
    };

    await withGridFSBucket(fakeBucket, async () => {
      await expect(uploadToGridFS(
        'retry.webm',
        Buffer.from('new audio'),
        {
          userId: '507f1f77bcf86cd799439011',
          contentSha256: 'new-content',
        },
        fileId
      )).rejects.toThrow('GridFS storage ID collision');
    });

    expect(fakeBucket.openUploadStreamWithId).not.toHaveBeenCalled();
    expect(fakeBucket.delete).not.toHaveBeenCalled();
  });
});
