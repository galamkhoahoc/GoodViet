import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
import * as gridfs from '../config/gridfs';
import { deleteS3ObjectScope, StorageService } from './storage.service';

/**
 * Unit tests for StorageService
 */
describe('StorageService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('upload', () => {
    it('binds a stable GridFS retry ID to a content digest and owner metadata', async () => {
      const fileId = '507f1f77bcf86cd799439011';
      const uploadSpy = jest.spyOn(gridfs, 'uploadToGridFS')
        .mockResolvedValueOnce(new mongoose.Types.ObjectId(fileId));

      await expect(StorageService.upload(
        'recording.webm',
        Buffer.from('audio'),
        {
          userId: '507f1f77bcf86cd799439012',
          storageId: fileId,
          mimetype: 'audio/webm',
          size: 5,
        }
      )).resolves.toBe(fileId);

      expect(uploadSpy).toHaveBeenCalledWith(
        'recording.webm',
        Buffer.from('audio'),
        expect.objectContaining({
          userId: '507f1f77bcf86cd799439012',
          mimetype: 'audio/webm',
          size: 5,
          contentSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
        expect.any(mongoose.Types.ObjectId)
      );
    });
  });

  describe('isValidAudioFormat', () => {
    it('should accept valid audio formats', () => {
      expect(StorageService.isValidAudioFormat('audio/wav')).toBe(true);
      expect(StorageService.isValidAudioFormat('audio/wave')).toBe(true);
      expect(StorageService.isValidAudioFormat('audio/x-wav')).toBe(true);
      expect(StorageService.isValidAudioFormat('audio/webm')).toBe(true);
      expect(StorageService.isValidAudioFormat('audio/mpeg')).toBe(true);
      expect(StorageService.isValidAudioFormat('audio/mp3')).toBe(true);
    });

    it('should reject invalid audio formats', () => {
      expect(StorageService.isValidAudioFormat('video/mp4')).toBe(false);
      expect(StorageService.isValidAudioFormat('image/png')).toBe(false);
      expect(StorageService.isValidAudioFormat('application/pdf')).toBe(false);
      expect(StorageService.isValidAudioFormat('')).toBe(false);
    });

    it('should handle case-insensitive MIME types', () => {
      expect(StorageService.isValidAudioFormat('AUDIO/WAV')).toBe(true);
      expect(StorageService.isValidAudioFormat('Audio/WebM')).toBe(true);
    });
  });

  describe('isValidFileSize', () => {
    it('should accept files within size limit', () => {
      expect(StorageService.isValidFileSize(1024)).toBe(true); // 1KB
      expect(StorageService.isValidFileSize(1024 * 1024)).toBe(true); // 1MB
      expect(StorageService.isValidFileSize(10 * 1024 * 1024)).toBe(true); // 10MB
      expect(StorageService.isValidFileSize(50 * 1024 * 1024)).toBe(true); // 50MB (max)
    });

    it('should reject files exceeding size limit', () => {
      expect(StorageService.isValidFileSize(51 * 1024 * 1024)).toBe(false); // 51MB
      expect(StorageService.isValidFileSize(100 * 1024 * 1024)).toBe(false); // 100MB
    });

    it('should reject zero or negative file sizes', () => {
      expect(StorageService.isValidFileSize(0)).toBe(false);
      expect(StorageService.isValidFileSize(-1)).toBe(false);
    });

    it('should accept custom max size limits', () => {
      expect(StorageService.isValidFileSize(5 * 1024 * 1024, 10)).toBe(true); // 5MB with 10MB limit
      expect(StorageService.isValidFileSize(15 * 1024 * 1024, 10)).toBe(false); // 15MB with 10MB limit
    });
  });

  describe('generateTemporaryUrl', () => {
    const owner = { userId: '507f1f77bcf86cd799439012', sessionVersion: 7 };

    it('should generate URL with default expiration (3600s)', async () => {
      const fileId = '507f1f77bcf86cd799439011';
      const result = await StorageService.generateTemporaryUrl(fileId, 3600, owner);

      expect(result.url).toContain(fileId);
      expect(result.url).toContain('token=');
      expect(result.expiresIn).toBe(3600);
      expect(result.expiresAt).toBeInstanceOf(Date);

      // Check expiration is approximately 1 hour from now
      const expectedExpiration = Date.now() + 3600 * 1000;
      const timeDiff = Math.abs(result.expiresAt.getTime() - expectedExpiration);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should generate URL with custom expiration', async () => {
      const fileId = '507f1f77bcf86cd799439011';
      const result = await StorageService.generateTemporaryUrl(fileId, 7200, owner);

      expect(result.expiresIn).toBe(7200);

      // Check expiration is approximately 2 hours from now
      const expectedExpiration = Date.now() + 7200 * 1000;
      const timeDiff = Math.abs(result.expiresAt.getTime() - expectedExpiration);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should throw error for invalid file ID', async () => {
      await expect(StorageService.generateTemporaryUrl('invalid-id')).rejects.toThrow('Invalid file ID');
    });

    it('requires owner context for a GridFS stream grant', async () => {
      await expect(StorageService.generateTemporaryUrl(
        '507f1f77bcf86cd799439011'
      )).rejects.toThrow('Audio stream owner context is required');
    });

    it('verifies a scoped token and rejects file-id tampering', async () => {
      const fileId = '507f1f77bcf86cd799439011';
      const result = await StorageService.generateTemporaryUrl(fileId, 3600, owner);
      const token = new URL(result.url).searchParams.get('token');

      expect(token).toBeTruthy();
      expect(StorageService.verifyTemporaryStreamToken(fileId, token!)).toEqual({
        fileId,
        userId: owner.userId,
        sessionVersion: owner.sessionVersion,
        expiresAt: result.expiresAt.getTime(),
      });
      expect(() => StorageService.verifyTemporaryStreamToken(
        '507f1f77bcf86cd799439099',
        token!
      )).toThrow('Invalid or expired audio access token');
    });

    it('rejects an expired GridFS stream token', async () => {
      jest.useFakeTimers();
      try {
        const fileId = '507f1f77bcf86cd799439011';
        const result = await StorageService.generateTemporaryUrl(fileId, 1, owner);
        const token = new URL(result.url).searchParams.get('token')!;
        jest.advanceTimersByTime(1001);

        expect(() => StorageService.verifyTemporaryStreamToken(fileId, token))
          .toThrow('Invalid or expired audio access token');
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('getStorageType', () => {
    it('should return gridfs for current implementation', () => {
      expect(StorageService.getStorageType()).toBe('gridfs');
    });
  });

  describe('supportsPresignedUrls', () => {
    it('should support expiring signed URLs for GridFS', () => {
      expect(StorageService.supportsPresignedUrls()).toBe(true);
    });
  });

  describe('getMetadata', () => {
    it('maps a missing GridFS files document to null for an HTTP 404', async () => {
      const metadataSpy = jest.spyOn(gridfs, 'getFileMetadata')
        .mockRejectedValueOnce(new Error('File not found'));

      await expect(StorageService.getMetadata('507f1f77bcf86cd799439011'))
        .resolves.toBeNull();

      metadataSpy.mockRestore();
    });
  });

  describe('deleteS3FilesForUser', () => {
    it('is a no-op when S3 is not configured', async () => {
      await expect(StorageService.deleteS3FilesForUser('guest-user')).resolves.toBe(0);
    });
  });

  describe('permanent S3 erasure', () => {
    it('paginates versions and current objects and deletes delete markers too', async () => {
      const send = jest.fn(async (command: unknown) => {
        if (command instanceof ListObjectVersionsCommand) {
          if (!command.input.KeyMarker) {
            return {
              Versions: [
                { Key: 'audio/guest/a.webm', VersionId: 'v2' },
                { Key: 'audio/guest/a.webm', VersionId: 'v1' },
              ],
              DeleteMarkers: [
                { Key: 'audio/guest/a.webm', VersionId: 'marker-1' },
              ],
              IsTruncated: true,
              NextKeyMarker: 'audio/guest/a.webm',
              NextVersionIdMarker: 'v1',
            };
          }
          return {
            Versions: [{ Key: 'audio/guest/b.webm', VersionId: 'null' }],
            IsTruncated: false,
          };
        }
        if (command instanceof ListObjectsV2Command) {
          return {
            Contents: [{ Key: 'audio/guest/unversioned.webm' }],
            IsTruncated: false,
          };
        }
        if (command instanceof DeleteObjectsCommand) {
          return {};
        }
        throw new Error('Unexpected S3 command');
      });
      const client = { send } as unknown as Pick<S3Client, 'send'>;

      await expect(deleteS3ObjectScope(
        client,
        'audio-bucket',
        'audio/guest/'
      )).resolves.toBe(5);

      const deleteTargets = send.mock.calls
        .map(([command]) => command)
        .filter((command): command is DeleteObjectsCommand => command instanceof DeleteObjectsCommand)
        .flatMap((command) => command.input.Delete?.Objects ?? []);
      expect(deleteTargets).toEqual(expect.arrayContaining([
        { Key: 'audio/guest/a.webm', VersionId: 'v2' },
        { Key: 'audio/guest/a.webm', VersionId: 'v1' },
        { Key: 'audio/guest/a.webm', VersionId: 'marker-1' },
        { Key: 'audio/guest/b.webm', VersionId: 'null' },
        { Key: 'audio/guest/unversioned.webm' },
      ]));
      expect(send).toHaveBeenCalledWith(expect.objectContaining({
        input: expect.objectContaining({
          KeyMarker: 'audio/guest/a.webm',
          VersionIdMarker: 'v1',
        }),
      }));
    });

    it('filters an exact key and batches at S3\'s 1000-object limit', async () => {
      const exactKey = 'audio/guest/exact.webm';
      const versions = Array.from({ length: 1001 }, (_, index) => ({
        Key: exactKey,
        VersionId: `v-${index}`,
      }));
      versions.push({ Key: `${exactKey}.other`, VersionId: 'out-of-scope' });
      const send = jest.fn(async (command: unknown) => {
        if (command instanceof ListObjectVersionsCommand) {
          return { Versions: versions, IsTruncated: false };
        }
        if (command instanceof ListObjectsV2Command) {
          return {
            Contents: [
              { Key: `${exactKey}.other` },
            ],
            IsTruncated: false,
          };
        }
        if (command instanceof DeleteObjectsCommand) return {};
        throw new Error('Unexpected S3 command');
      });
      const client = { send } as unknown as Pick<S3Client, 'send'>;

      await expect(deleteS3ObjectScope(
        client,
        'audio-bucket',
        exactKey,
        exactKey
      )).resolves.toBe(1001);

      const deleteCommands = send.mock.calls
        .map(([command]) => command)
        .filter((command): command is DeleteObjectsCommand => command instanceof DeleteObjectsCommand);
      expect(deleteCommands).toHaveLength(2);
      expect(deleteCommands[0].input.Delete?.Objects).toHaveLength(1000);
      expect(deleteCommands[1].input.Delete?.Objects).toHaveLength(1);
      expect(deleteCommands.flatMap((command) => command.input.Delete?.Objects ?? []))
        .not.toContainEqual(expect.objectContaining({ Key: `${exactKey}.other` }));
    });
  });
});
