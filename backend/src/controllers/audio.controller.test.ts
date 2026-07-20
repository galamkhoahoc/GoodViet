import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AudioRecording } from '../models/AudioRecording';
import { Assessment } from '../models/Assessment';
import { User } from '../models/User';
import { StorageService } from '../services/storage.service';
import { runWithRequestSessionWrite } from '../middleware/auth.middleware';
import { AudioController } from './audio.controller';

jest.mock('../models/AudioRecording');
jest.mock('../models/Assessment');
jest.mock('../models/PracticeProgress');
jest.mock('../models/PracticeSession');
jest.mock('../models/User');
jest.mock('../services/storage.service');
jest.mock('../middleware/auth.middleware', () => ({
  runWithRequestSessionWrite: jest.fn((_context, operation) => operation()),
}));

describe('AudioController ownership', () => {
  let response: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.resetAllMocks();
    (runWithRequestSessionWrite as jest.Mock).mockImplementation(
      (_context, operation) => operation()
    );
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('deletes only a recording owned by the authenticated user', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      params: { recordingId: '507f191e810c19729de860ea' },
    } as unknown as Request;
    (AudioRecording.findOne as jest.Mock).mockResolvedValue({
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      fileUrl: 'gridfs://507f1f77bcf86cd799439012',
    });
    (StorageService.deleteLocation as jest.Mock).mockResolvedValue(undefined);
    (AudioRecording.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

    await AudioController.deleteAudio(request, response as Response, next);

    expect(AudioRecording.findOne).toHaveBeenCalledWith({
      _id: '507f191e810c19729de860ea',
      $or: [
        { userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') },
        { userId: { $exists: false } },
        { userId: null },
      ],
    });
    expect(StorageService.deleteLocation).toHaveBeenCalledWith(
      'gridfs://507f1f77bcf86cd799439012'
    );
    expect(AudioRecording.updateOne).toHaveBeenCalledWith(
      { _id: '507f191e810c19729de860ea' },
      { $set: { deletionPendingAt: expect.any(Date) } }
    );
    expect(AudioRecording.deleteOne).toHaveBeenCalledWith({
      _id: '507f191e810c19729de860ea',
    });
    expect((AudioRecording.updateOne as jest.Mock).mock.invocationCallOrder[0])
      .toBeLessThan((StorageService.deleteLocation as jest.Mock).mock.invocationCallOrder[0]);
    expect((StorageService.deleteLocation as jest.Mock).mock.invocationCallOrder[0])
      .toBeLessThan((AudioRecording.deleteOne as jest.Mock).mock.invocationCallOrder[0]);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('does not reveal or delete another user recording', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      params: { recordingId: '507f191e810c19729de860ea' },
    } as unknown as Request;
    (AudioRecording.findOne as jest.Mock).mockResolvedValue(null);

    await AudioController.deleteAudio(request, response as Response, next);

    expect(StorageService.deleteLocation).not.toHaveBeenCalled();
    expect(AudioRecording.deleteOne).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it('retains access to a legacy recording through an owned assessment', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      params: { recordingId: '507f191e810c19729de860ea' },
    } as unknown as Request;
    (AudioRecording.findOne as jest.Mock).mockResolvedValue({
      assessmentId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      fileUrl: 'gridfs://507f1f77bcf86cd799439012',
    });
    (Assessment.exists as jest.Mock).mockResolvedValue({ _id: 'owned' });
    (StorageService.deleteLocation as jest.Mock).mockResolvedValue(undefined);
    (AudioRecording.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

    await AudioController.deleteAudio(request, response as Response, next);

    expect(Assessment.exists).toHaveBeenCalledWith({
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    });
    expect(StorageService.deleteLocation).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('fails closed when a legacy recording parent is not owned', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      params: { recordingId: '507f191e810c19729de860ea' },
    } as unknown as Request;
    (AudioRecording.findOne as jest.Mock).mockResolvedValue({
      assessmentId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      fileUrl: 'gridfs://507f1f77bcf86cd799439012',
    });
    (Assessment.exists as jest.Mock).mockResolvedValue(null);

    await AudioController.deleteAudio(request, response as Response, next);

    expect(StorageService.deleteLocation).not.toHaveBeenCalled();
    expect(AudioRecording.deleteOne).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it('rejects a raw GridFS ID without a valid signed stream token', async () => {
    const request = {
      params: { fileId: '507f191e810c19729de860ea' },
      query: {},
    } as unknown as Request;
    (StorageService.verifyTemporaryStreamToken as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    await AudioController.streamAudio(request, response as Response, next);

    expect(StorageService.getMetadata).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('streams a signed file with private no-store caching', async () => {
    const request = {
      params: { fileId: '507f191e810c19729de860ea' },
      query: { token: 'signed-token' },
    } as unknown as Request;
    (StorageService.verifyTemporaryStreamToken as jest.Mock).mockReturnValue({
      fileId: request.params.fileId,
      userId: '507f1f77bcf86cd799439011',
      sessionVersion: 7,
      expiresAt: Date.now() + 60_000,
    });
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        isActive: true,
        accountType: 'temporary',
        sessionVersion: 7,
        resetInProgress: false,
      }),
    });
    (StorageService.getMetadata as jest.Mock).mockResolvedValue({
      mimetype: 'audio/webm',
      size: 100,
      filename: 'recording.webm',
    });
    const stream = {
      pipe: jest.fn(),
      on: jest.fn(),
    };
    (StorageService.getStream as jest.Mock).mockReturnValue(stream);

    await AudioController.streamAudio(request, response as Response, next);

    expect(response.set).toHaveBeenCalledWith(expect.objectContaining({
      'Cache-Control': 'private, no-store',
      Pragma: 'no-cache',
    }));
    expect(stream.pipe).toHaveBeenCalledWith(response);
    expect(next).not.toHaveBeenCalled();
  });

  it('invalidates a guest stream grant after its session epoch changes', async () => {
    const request = {
      params: { fileId: '507f191e810c19729de860ea' },
      query: { token: 'signed-token' },
    } as unknown as Request;
    (StorageService.verifyTemporaryStreamToken as jest.Mock).mockReturnValue({
      fileId: request.params.fileId,
      userId: '507f1f77bcf86cd799439011',
      sessionVersion: 6,
      expiresAt: Date.now() + 60_000,
    });
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        isActive: true,
        accountType: 'temporary',
        sessionVersion: 7,
        resetInProgress: false,
      }),
    });

    await AudioController.streamAudio(request, response as Response, next);

    expect(StorageService.getMetadata).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('returns 404 when a signed GridFS object no longer exists', async () => {
    const request = {
      params: { fileId: '507f191e810c19729de860ea' },
      query: { token: 'signed-token' },
    } as unknown as Request;
    (StorageService.verifyTemporaryStreamToken as jest.Mock).mockReturnValue({
      fileId: request.params.fileId,
      userId: '507f1f77bcf86cd799439011',
      sessionVersion: 7,
      expiresAt: Date.now() + 60_000,
    });
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        isActive: true,
        accountType: 'standard',
        sessionVersion: 7,
        resetInProgress: false,
      }),
    });
    (StorageService.getMetadata as jest.Mock).mockResolvedValue(null);

    await AudioController.streamAudio(request, response as Response, next);

    expect(StorageService.getStream).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it('reconciles ambiguous upload commit results before cleaning storage', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      body: {},
      file: {
        originalname: 'recording.webm',
        mimetype: 'audio/webm',
        size: 100,
        buffer: Buffer.from('audio'),
      },
    } as unknown as Request;
    const ambiguousCommit = new Error('commit acknowledgement lost');
    (StorageService.isValidAudioFormat as jest.Mock).mockReturnValue(true);
    (StorageService.isValidFileSize as jest.Mock).mockReturnValue(true);
    (StorageService.upload as jest.Mock).mockResolvedValue('507f1f77bcf86cd799439012');
    (StorageService.getStorageType as jest.Mock).mockReturnValue('gridfs');
    (AudioRecording.create as jest.Mock).mockImplementation(async (recording) => ({
      ...recording,
      uploadedAt: new Date(),
    }));
    (AudioRecording.exists as jest.Mock).mockResolvedValue({ _id: 'committed' });
    (runWithRequestSessionWrite as jest.Mock).mockImplementationOnce(
      async (_context, operation) => {
        await operation();
        throw ambiguousCommit;
      }
    );

    await AudioController.uploadAudio(request, response as Response, next);

    expect(AudioRecording.exists).toHaveBeenCalledWith(expect.objectContaining({
      fileUrl: 'gridfs://507f1f77bcf86cd799439012',
      userId: new mongoose.Types.ObjectId(request.userId),
    }));
    expect(StorageService.deleteLocation).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(ambiguousCommit);
  });

  it('cleans an upload only after reconciliation confirms metadata did not commit', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      body: {},
      file: {
        originalname: 'recording.webm',
        mimetype: 'audio/webm',
        size: 100,
        buffer: Buffer.from('audio'),
      },
    } as unknown as Request;
    (StorageService.isValidAudioFormat as jest.Mock).mockReturnValue(true);
    (StorageService.isValidFileSize as jest.Mock).mockReturnValue(true);
    (StorageService.upload as jest.Mock).mockResolvedValue('507f1f77bcf86cd799439012');
    (StorageService.getStorageType as jest.Mock).mockReturnValue('gridfs');
    (AudioRecording.create as jest.Mock).mockRejectedValue(new Error('metadata failed'));
    (AudioRecording.exists as jest.Mock).mockResolvedValue(null);

    await AudioController.uploadAudio(request, response as Response, next);

    expect(StorageService.deleteLocation).toHaveBeenCalledWith(
      'gridfs://507f1f77bcf86cd799439012'
    );
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('does not destroy storage when the durable deletion marker fails to commit', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      params: { recordingId: '507f191e810c19729de860ea' },
    } as unknown as Request;
    const transactionError = new Error('marker transaction failed');
    (AudioRecording.findOne as jest.Mock).mockResolvedValue({
      userId: new mongoose.Types.ObjectId(request.userId),
      fileUrl: 'gridfs://507f1f77bcf86cd799439012',
    });
    (runWithRequestSessionWrite as jest.Mock).mockRejectedValueOnce(transactionError);
    (AudioRecording.exists as jest.Mock).mockResolvedValue(null);

    await AudioController.deleteAudio(request, response as Response, next);

    expect(StorageService.deleteLocation).not.toHaveBeenCalled();
    expect(AudioRecording.deleteOne).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(transactionError);
  });

  it('keeps a marked row retryable when external deletion fails', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      params: { recordingId: '507f191e810c19729de860ea' },
    } as unknown as Request;
    const storageError = new Error('storage unavailable');
    (AudioRecording.findOne as jest.Mock).mockResolvedValue({
      userId: new mongoose.Types.ObjectId(request.userId),
      fileUrl: 'gridfs://507f1f77bcf86cd799439012',
    });
    (StorageService.deleteLocation as jest.Mock).mockRejectedValue(storageError);

    await AudioController.deleteAudio(request, response as Response, next);

    expect(AudioRecording.updateOne).toHaveBeenCalled();
    expect(AudioRecording.deleteOne).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(storageError);
  });

  it('prevents caching the JSON response that carries a signed URL', async () => {
    const request = {
      userId: '507f1f77bcf86cd799439011',
      sessionVersion: 7,
      params: { recordingId: '507f191e810c19729de860ea' },
      query: {},
    } as unknown as Request;
    (AudioRecording.findOne as jest.Mock).mockResolvedValue({
      userId: new mongoose.Types.ObjectId(request.userId),
      fileUrl: 'gridfs://507f1f77bcf86cd799439012',
    });
    (StorageService.generateTemporaryUrl as jest.Mock).mockResolvedValue({
      url: 'http://localhost:3000/api/audio/stream/file?token=signed',
      expiresAt: new Date(),
      expiresIn: 3600,
    });
    (StorageService.supportsPresignedUrls as jest.Mock).mockReturnValue(true);

    await AudioController.getTemporaryUrl(request, response as Response, next);

    expect(response.set).toHaveBeenCalledWith({
      'Cache-Control': 'private, no-store',
      Pragma: 'no-cache',
      Expires: '0',
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});
