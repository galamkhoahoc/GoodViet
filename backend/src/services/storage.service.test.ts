import { StorageService } from './storage.service';

/**
 * Unit tests for StorageService
 */
describe('StorageService', () => {
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
    it('should generate URL with default expiration (3600s)', () => {
      const fileId = '507f1f77bcf86cd799439011';
      const result = StorageService.generateTemporaryUrl(fileId);

      expect(result.url).toContain(fileId);
      expect(result.expiresIn).toBe(3600);
      expect(result.expiresAt).toBeInstanceOf(Date);

      // Check expiration is approximately 1 hour from now
      const expectedExpiration = Date.now() + 3600 * 1000;
      const timeDiff = Math.abs(result.expiresAt.getTime() - expectedExpiration);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should generate URL with custom expiration', () => {
      const fileId = '507f1f77bcf86cd799439011';
      const result = StorageService.generateTemporaryUrl(fileId, 7200);

      expect(result.expiresIn).toBe(7200);

      // Check expiration is approximately 2 hours from now
      const expectedExpiration = Date.now() + 7200 * 1000;
      const timeDiff = Math.abs(result.expiresAt.getTime() - expectedExpiration);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should throw error for invalid file ID', () => {
      expect(() => {
        StorageService.generateTemporaryUrl('invalid-id');
      }).toThrow('Invalid file ID');
    });
  });

  describe('getStorageType', () => {
    it('should return gridfs for current implementation', () => {
      expect(StorageService.getStorageType()).toBe('gridfs');
    });
  });

  describe('supportsPresignedUrls', () => {
    it('should return false for gridfs', () => {
      expect(StorageService.supportsPresignedUrls()).toBe(false);
    });
  });
});
