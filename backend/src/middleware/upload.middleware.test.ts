import multer from 'multer';
import type { Request } from 'express';
import {
  handleMulterError,
  MAX_AUDIO_FIELD_SIZE_BYTES,
  MAX_AUDIO_FILE_SIZE_BYTES,
  MAX_AUDIO_FORM_FIELDS,
  upload,
} from './upload.middleware';

describe('audio upload middleware', () => {
  it('bounds the in-memory multipart envelope at the shared 50MB limit', () => {
    const limits = (upload as unknown as {
      limits: Record<string, number>;
    }).limits;

    expect(limits).toMatchObject({
      fileSize: MAX_AUDIO_FILE_SIZE_BYTES,
      files: 1,
      fields: MAX_AUDIO_FORM_FIELDS,
      parts: MAX_AUDIO_FORM_FIELDS + 1,
      fieldNameSize: 100,
      fieldSize: MAX_AUDIO_FIELD_SIZE_BYTES,
      headerPairs: 100,
    });
  });

  it('reports the same 50MB limit when multer rejects a large file', () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    handleMulterError(
      new multer.MulterError('LIMIT_FILE_SIZE'),
      {} as Request,
      response,
      jest.fn()
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('50MB'),
    }));
  });
});
