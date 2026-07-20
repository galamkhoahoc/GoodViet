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
import { IUser, User } from '../models/User';
import { StorageService } from './storage.service';

export interface TemporaryAccountResetResult {
  user: IUser;
  deleted: {
    assessments: number;
    audioRecordings: number;
    auditLogs: number;
    chatMessages: number;
    chatSessions: number;
    expertConnections: number;
    expertSessions: number;
    notifications: number;
    practiceProgress: number;
    practiceSessions: number;
    orphanedGridFSFiles: number;
    orphanedS3Files: number;
  };
}

const RESET_LOCK_POLL_MS = 50;
const RESET_LOCK_TIMEOUT_MS = 60_000;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

interface ResetLockOwnership {
  objectId: mongoose.Types.ObjectId;
  epoch: number;
}

function resetSupersededError(): Error {
  return new Error('Temporary account reset was superseded by another session');
}

function temporarySessionInactiveError(): Error {
  return new Error('Temporary account session is no longer active');
}

/**
 * Renew the reset lease and fence stale workers with the sessionVersion epoch.
 * If explicit recovery changes that epoch, every later phase in the old reset
 * observes a zero-match update and stops before issuing more deletes.
 */
async function assertResetLockOwned(lock: ResetLockOwnership): Promise<void> {
  const result = await User.updateOne(
    {
      _id: lock.objectId,
      accountType: 'temporary',
      sessionVersion: lock.epoch,
      resetInProgress: true,
    },
    { $set: { resetStartedAt: new Date() } }
  );

  if (result.matchedCount !== 1) {
    throw resetSupersededError();
  }
}

async function acquireResetLock(
  objectId: mongoose.Types.ObjectId,
  expectedSessionVersion?: number
): Promise<IUser> {
  const deadline = Date.now() + RESET_LOCK_TIMEOUT_MS;

  while (true) {
    const lockedUser = await User.findOneAndUpdate(
      {
        _id: objectId,
        accountType: 'temporary',
        ...(expectedSessionVersion === undefined
          ? {}
          : { sessionVersion: expectedSessionVersion }),
        // Never steal a stale-looking lease automatically. A worker can pause
        // inside an external storage call and later resume; letting another
        // reset take over would allow that old worker to delete new-session
        // data. Hard-crash recovery must explicitly clear the lock after an
        // operator has confirmed the old worker is no longer running.
        resetInProgress: { $ne: true },
      },
      {
        $inc: { sessionVersion: 1 },
        $set: { resetInProgress: true, resetStartedAt: new Date() },
      },
      { new: true }
    ).select('+sessionVersion +resetInProgress +resetStartedAt');

    if (lockedUser) {
      return lockedUser;
    }

    const existing = await User.findOne({ _id: objectId, accountType: 'temporary' })
      .select('_id sessionVersion resetInProgress');
    if (!existing) {
      throw new Error('Temporary account not found');
    }
    if (
      expectedSessionVersion !== undefined
      && (
        existing.sessionVersion !== expectedSessionVersion
        || existing.resetInProgress
      )
    ) {
      // A logout belongs to one exact JWT epoch. It must never wait through a
      // newer reset/login and then erase the data created by that new session.
      throw temporarySessionInactiveError();
    }
    if (Date.now() >= deadline) {
      throw new Error('Timed out waiting for temporary account reset');
    }

    await wait(RESET_LOCK_POLL_MS);
  }
}

function defaultFullName(email: string): string {
  const localPart = email.split('@')[0] || 'Guest';
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Guest';
}

/**
 * Removes all mutable data owned by a temporary account while preserving the
 * account identity and credentials. The operation is intentionally idempotent:
 * it is called both on logout and before each new temporary-account login.
 */
export class TemporaryAccountService {
  static async reset(
    userId: string | mongoose.Types.ObjectId,
    expectedSessionVersion?: number
  ): Promise<TemporaryAccountResetResult> {
    if (
      expectedSessionVersion !== undefined
      && (!Number.isInteger(expectedSessionVersion) || expectedSessionVersion < 0)
    ) {
      throw temporarySessionInactiveError();
    }

    const objectId = typeof userId === 'string'
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // Acquiring the lock also invalidates every previously issued guest JWT.
    // Concurrent login/logout requests serialize here instead of running two
    // destructive cleanup passes at the same time.
    const lockedUser = await acquireResetLock(objectId, expectedSessionVersion);
    const acquiredSessionVersion = lockedUser.sessionVersion;
    const lock: ResetLockOwnership = {
      objectId,
      epoch: acquiredSessionVersion,
    };

    try {
      await assertResetLockOwned(lock);

      const [assessmentIds, progressIds, connectionIds] = await Promise.all([
        Assessment.distinct('_id', { userId: objectId }) as Promise<mongoose.Types.ObjectId[]>,
        PracticeProgress.distinct('_id', { userId: objectId }) as Promise<mongoose.Types.ObjectId[]>,
        ExpertConnection.distinct('_id', { userId: objectId }) as Promise<mongoose.Types.ObjectId[]>,
      ]);

      const practiceSessionIds = progressIds.length > 0
        ? await PracticeSession.distinct('_id', { progressId: { $in: progressIds } }) as mongoose.Types.ObjectId[]
        : [];

      const recordingOwnership: Record<string, unknown>[] = [{ userId: objectId }];
      if (assessmentIds.length > 0) {
        recordingOwnership.push({ assessmentId: { $in: assessmentIds } });
      }
      if (practiceSessionIds.length > 0) {
        recordingOwnership.push({ practiceSessionId: { $in: practiceSessionIds } });
      }

      const recordings = await AudioRecording.find({ $or: recordingOwnership })
        .select('_id fileUrl')
        .lean();

      // Delete blobs before their metadata so a failed storage operation remains
      // discoverable and can be retried on the next login.
      for (const recording of recordings) {
        await assertResetLockOwned(lock);
        await StorageService.deleteLocation(recording.fileUrl);
      }

      await assertResetLockOwned(lock);
      const orphanedGridFSFiles = await StorageService.deleteGridFSFilesForUser(objectId.toString());
      await assertResetLockOwned(lock);
      const orphanedS3Files = await StorageService.deleteS3FilesForUser(objectId.toString());

      // Keep each destructive database operation behind its own epoch check.
      // Sequential phases are intentional: a worker whose epoch was explicitly
      // revoked must not enqueue any remaining deletes.
      await assertResetLockOwned(lock);
      const audioResult = await AudioRecording.deleteMany({
        _id: { $in: recordings.map((recording) => recording._id) },
      });
      await assertResetLockOwned(lock);
      const practiceSessionResult = await PracticeSession.deleteMany({ progressId: { $in: progressIds } });
      await assertResetLockOwned(lock);
      const practiceProgressResult = await PracticeProgress.deleteMany({ userId: objectId });
      await assertResetLockOwned(lock);
      const expertSessionResult = await ExpertSession.deleteMany({ connectionId: { $in: connectionIds } });
      await assertResetLockOwned(lock);
      const expertConnectionResult = await ExpertConnection.deleteMany({ userId: objectId });
      await assertResetLockOwned(lock);
      const assessmentResult = await Assessment.deleteMany({ userId: objectId });
      await assertResetLockOwned(lock);
      const chatMessageResult = await ChatMessage.deleteMany({ userId: objectId });
      await assertResetLockOwned(lock);
      const chatSessionResult = await ChatSession.deleteMany({ userId: objectId });
      await assertResetLockOwned(lock);
      const notificationResult = await Notification.deleteMany({ userId: objectId });
      await assertResetLockOwned(lock);
      const auditLogResult = await AuditLog.deleteMany({ userId: objectId });

      await assertResetLockOwned(lock);

      const resetUser = await User.findOneAndUpdate(
        {
          _id: objectId,
          accountType: 'temporary',
          sessionVersion: acquiredSessionVersion,
          resetInProgress: true,
        },
        {
          $set: {
            fullName: defaultFullName(lockedUser.email),
            totalRecordings: 0,
            totalPracticeTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            assessmentCompleted: false,
            resetInProgress: false,
          },
          $unset: {
            phoneNumber: 1,
            dateOfBirth: 1,
            age: 1,
            gender: 1,
            lastLoginAt: 1,
            profileImageUrl: 1,
            targetGoals: 1,
            learningStyle: 1,
            currentPathwayId: 1,
            resetStartedAt: 1,
            temporaryWriteFence: 1,
          },
        },
        { new: true, runValidators: true }
      ).select('+sessionVersion +resetInProgress +resetStartedAt');

      if (!resetUser) {
        throw resetSupersededError();
      }

      return {
        user: resetUser,
        deleted: {
          assessments: assessmentResult.deletedCount,
          audioRecordings: audioResult.deletedCount,
          auditLogs: auditLogResult.deletedCount,
          chatMessages: chatMessageResult.deletedCount,
          chatSessions: chatSessionResult.deletedCount,
          expertConnections: expertConnectionResult.deletedCount,
          expertSessions: expertSessionResult.deletedCount,
          notifications: notificationResult.deletedCount,
          practiceProgress: practiceProgressResult.deletedCount,
          practiceSessions: practiceSessionResult.deletedCount,
          orphanedGridFSFiles,
          orphanedS3Files,
        },
      };
    } catch (error) {
      // Never leave the account permanently locked after a transient storage or
      // database failure. The sessionVersion predicate avoids unlocking a newer
      // reset if a stale lock was recovered elsewhere.
      await User.updateOne(
        {
          _id: objectId,
          accountType: 'temporary',
          sessionVersion: acquiredSessionVersion,
          resetInProgress: true,
        },
        {
          $set: { resetInProgress: false },
          $unset: { resetStartedAt: 1 },
        }
      ).catch(() => undefined);
      throw error;
    }
  }
}
