import mongoose from 'mongoose';
import { Assessment } from '../models/Assessment';
import { AudioRecording } from '../models/AudioRecording';
import { AuditLog } from '../models/AuditLog';
import { ChatMessage } from '../models/ChatMessage';
import { ChatSession } from '../models/ChatSession';
import { ExpertConnection } from '../models/ExpertConnection';
import { ExpertSession } from '../models/ExpertSession';
import { Notification } from '../models/Notification';
import { PracticeProgress } from '../models/PracticeProgress';
import { PracticeSession } from '../models/PracticeSession';
import { User } from '../models/User';
import { StorageService } from './storage.service';
import { TemporaryAccountService } from './temporary-account.service';

jest.mock('../models/Assessment');
jest.mock('../models/AudioRecording');
jest.mock('../models/AuditLog');
jest.mock('../models/ChatMessage');
jest.mock('../models/ChatSession');
jest.mock('../models/ExpertConnection');
jest.mock('../models/ExpertSession');
jest.mock('../models/Notification');
jest.mock('../models/PracticeProgress');
jest.mock('../models/PracticeSession');
jest.mock('../models/User');
jest.mock('./storage.service');

function selectedQuery<T>(value: T) {
  return { select: jest.fn().mockResolvedValue(value) };
}

describe('TemporaryAccountService', () => {
  const userId = new mongoose.Types.ObjectId();
  const assessmentId = new mongoose.Types.ObjectId();
  const progressId = new mongoose.Types.ObjectId();
  const practiceSessionId = new mongoose.Types.ObjectId();
  const connectionId = new mongoose.Types.ObjectId();
  const recordingId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();

    (Assessment.distinct as jest.Mock).mockResolvedValue([assessmentId]);
    (PracticeProgress.distinct as jest.Mock).mockResolvedValue([progressId]);
    (ExpertConnection.distinct as jest.Mock).mockResolvedValue([connectionId]);
    (PracticeSession.distinct as jest.Mock).mockResolvedValue([practiceSessionId]);

    (AudioRecording.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: recordingId, fileUrl: 'gridfs://507f1f77bcf86cd799439011' },
        ]),
      }),
    });

    for (const model of [
      AudioRecording,
      PracticeSession,
      PracticeProgress,
      ExpertSession,
      ExpertConnection,
      Assessment,
      ChatMessage,
      ChatSession,
      Notification,
      AuditLog,
    ]) {
      (model.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
    }

    (StorageService.deleteLocation as jest.Mock).mockResolvedValue(undefined);
    (StorageService.deleteGridFSFilesForUser as jest.Mock).mockResolvedValue(2);
    (StorageService.deleteS3FilesForUser as jest.Mock).mockResolvedValue(3);
    (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  });

  it('deletes all owned data and restores a clean guest profile', async () => {
    const lockedUser = {
      _id: userId,
      email: 'guest@goodviet.glkh.vn',
      accountType: 'temporary',
      sessionVersion: 8,
    };
    const resetUser = { ...lockedUser, fullName: 'Guest', resetInProgress: false };

    (User.findOneAndUpdate as jest.Mock)
      .mockReturnValueOnce(selectedQuery(lockedUser))
      .mockReturnValueOnce(selectedQuery(resetUser));

    const result = await TemporaryAccountService.reset(userId);

    expect(User.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _id: userId,
        accountType: 'temporary',
        resetInProgress: { $ne: true },
      }),
      expect.objectContaining({
        $inc: { sessionVersion: 1 },
        $set: expect.objectContaining({ resetInProgress: true, resetStartedAt: expect.any(Date) }),
      }),
      { new: true }
    );
    expect(StorageService.deleteLocation).toHaveBeenCalledWith('gridfs://507f1f77bcf86cd799439011');
    expect(StorageService.deleteGridFSFilesForUser).toHaveBeenCalledWith(userId.toString());
    expect(StorageService.deleteS3FilesForUser).toHaveBeenCalledWith(userId.toString());
    expect(Assessment.deleteMany).toHaveBeenCalledWith({ userId });
    expect(PracticeSession.deleteMany).toHaveBeenCalledWith({ progressId: { $in: [progressId] } });
    expect(ExpertSession.deleteMany).toHaveBeenCalledWith({ connectionId: { $in: [connectionId] } });
    expect(User.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      {
        _id: userId,
        accountType: 'temporary',
        sessionVersion: 8,
        resetInProgress: true,
      },
      expect.objectContaining({
        $set: expect.objectContaining({
          fullName: 'Guest',
          totalRecordings: 0,
          assessmentCompleted: false,
          resetInProgress: false,
        }),
        $unset: expect.objectContaining({
          phoneNumber: 1,
          currentPathwayId: 1,
          targetGoals: 1,
          resetStartedAt: 1,
          temporaryWriteFence: 1,
        }),
      }),
      { new: true, runValidators: true }
    );
    expect(result.user).toBe(resetUser);
    expect(result.deleted).toEqual(expect.objectContaining({
      assessments: 1,
      audioRecordings: 1,
      practiceSessions: 1,
      orphanedGridFSFiles: 2,
      orphanedS3Files: 3,
    }));
  });

  it('is safe to repeat when the account no longer has related records', async () => {
    const lockedUser = {
      _id: userId,
      email: 'guest@goodviet.glkh.vn',
      accountType: 'temporary',
      sessionVersion: 9,
    };

    (Assessment.distinct as jest.Mock).mockResolvedValue([]);
    (PracticeProgress.distinct as jest.Mock).mockResolvedValue([]);
    (ExpertConnection.distinct as jest.Mock).mockResolvedValue([]);
    (AudioRecording.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
    });
    (User.findOneAndUpdate as jest.Mock)
      .mockReturnValueOnce(selectedQuery(lockedUser))
      .mockReturnValueOnce(selectedQuery(lockedUser));

    await expect(TemporaryAccountService.reset(userId)).resolves.toBeDefined();
    expect(PracticeSession.distinct).not.toHaveBeenCalled();
    expect(StorageService.deleteLocation).not.toHaveBeenCalled();
  });

  it('does not reset a standard or missing account', async () => {
    (User.findOneAndUpdate as jest.Mock).mockReturnValueOnce(selectedQuery(null));
    (User.findOne as jest.Mock).mockReturnValueOnce(selectedQuery(null));

    await expect(TemporaryAccountService.reset(userId)).rejects.toThrow('Temporary account not found');
    expect(Assessment.distinct).not.toHaveBeenCalled();
  });

  it('rejects a stale logout epoch immediately without cleaning newer-session data', async () => {
    (User.findOneAndUpdate as jest.Mock).mockReturnValueOnce(selectedQuery(null));
    (User.findOne as jest.Mock).mockReturnValueOnce(selectedQuery({
      _id: userId,
      sessionVersion: 15,
      resetInProgress: false,
    }));

    await expect(TemporaryAccountService.reset(userId, 14)).rejects.toThrow(
      'Temporary account session is no longer active'
    );

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: userId,
        accountType: 'temporary',
        sessionVersion: 14,
        resetInProgress: { $ne: true },
      },
      expect.any(Object),
      { new: true }
    );
    expect(Assessment.distinct).not.toHaveBeenCalled();
    expect(StorageService.deleteLocation).not.toHaveBeenCalled();
    expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('rejects a reset superseded by a newer temporary session', async () => {
    const lockedUser = {
      _id: userId,
      email: 'guest@goodviet.glkh.vn',
      accountType: 'temporary',
      sessionVersion: 10,
    };
    (User.findOneAndUpdate as jest.Mock)
      .mockReturnValueOnce(selectedQuery(lockedUser))
      .mockReturnValueOnce(selectedQuery(null));

    await expect(TemporaryAccountService.reset(userId)).rejects.toThrow(
      'Temporary account reset was superseded by another session'
    );
  });

  it('fences an old reset before its next delete phase if recovery revokes its epoch', async () => {
    const lockedUser = {
      _id: userId,
      email: 'guest@goodviet.glkh.vn',
      accountType: 'temporary',
      sessionVersion: 12,
    };
    (User.findOneAndUpdate as jest.Mock).mockReturnValueOnce(selectedQuery(lockedUser));
    (User.updateOne as jest.Mock)
      // Initial ownership check before taking the cleanup snapshot succeeds.
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 })
      // Explicit recovery has changed sessionVersion after stopping the worker.
      .mockResolvedValueOnce({ matchedCount: 0, modifiedCount: 0 })
      // The catch-path unlock is fenced by the same old epoch and is a no-op.
      .mockResolvedValueOnce({ matchedCount: 0, modifiedCount: 0 });

    await expect(TemporaryAccountService.reset(userId)).rejects.toThrow(
      'Temporary account reset was superseded by another session'
    );

    expect((User.updateOne as jest.Mock).mock.calls[1][0]).toEqual({
      _id: userId,
      accountType: 'temporary',
      sessionVersion: 12,
      resetInProgress: true,
    });
    expect(StorageService.deleteLocation).not.toHaveBeenCalled();
    expect(StorageService.deleteGridFSFilesForUser).not.toHaveBeenCalled();
    expect(AudioRecording.deleteMany).not.toHaveBeenCalled();
    expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('waits for an occupied lock instead of taking over based on its age', async () => {
    const lockedUser = {
      _id: userId,
      email: 'guest@goodviet.glkh.vn',
      accountType: 'temporary',
      sessionVersion: 13,
    };
    const resetUser = { ...lockedUser, resetInProgress: false };

    (User.findOneAndUpdate as jest.Mock)
      // Another reset owns the lock, regardless of how old resetStartedAt is.
      .mockReturnValueOnce(selectedQuery(null))
      // The owner releases it; this waiter can now acquire a fresh epoch.
      .mockReturnValueOnce(selectedQuery(lockedUser))
      .mockReturnValueOnce(selectedQuery(resetUser));
    (User.findOne as jest.Mock).mockReturnValueOnce(selectedQuery({
      _id: userId,
      resetInProgress: true,
      resetStartedAt: new Date(0),
    }));

    await expect(TemporaryAccountService.reset(userId)).resolves.toBeDefined();

    expect(User.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      {
        _id: userId,
        accountType: 'temporary',
        resetInProgress: { $ne: true },
      },
      expect.any(Object),
      { new: true }
    );
    expect(User.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      {
        _id: userId,
        accountType: 'temporary',
        resetInProgress: { $ne: true },
      },
      expect.any(Object),
      { new: true }
    );
  });

  it('releases its lock when storage cleanup fails so the next login can retry', async () => {
    const lockedUser = {
      _id: userId,
      email: 'guest@goodviet.glkh.vn',
      accountType: 'temporary',
      sessionVersion: 11,
    };
    (User.findOneAndUpdate as jest.Mock).mockReturnValueOnce(selectedQuery(lockedUser));
    (StorageService.deleteLocation as jest.Mock).mockRejectedValueOnce(new Error('storage unavailable'));

    await expect(TemporaryAccountService.reset(userId)).rejects.toThrow('storage unavailable');

    expect(User.updateOne).toHaveBeenCalledWith(
      {
        _id: userId,
        accountType: 'temporary',
        sessionVersion: 11,
        resetInProgress: true,
      },
      {
        $set: { resetInProgress: false },
        $unset: { resetStartedAt: 1 },
      }
    );
  });
});
