import { openDB, type IDBPDatabase } from 'idb';
import { config } from '../../config/env';

export interface StoredRecording {
  id: string;
  blob: Blob;
  metadata: {
    userId: string;
    sentenceId?: string;
    exerciseId?: string;
    phase?: string;
    duration: number;
    format: string;
    timestamp: string;
    uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
    retryCount: number;
    fileSize: number;
  };
}

const { dbName, dbVersion, storeName } = config.indexedDB;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(dbName, dbVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'metadata.timestamp');
          store.createIndex('uploadStatus', 'metadata.uploadStatus');
          store.createIndex('userId', 'metadata.userId');
        }
      },
    });
  }
  return dbPromise;
}

export const indexedDBService = {
  async saveRecording(
    blob: Blob,
    metadata: Omit<StoredRecording['metadata'], 'uploadStatus' | 'retryCount' | 'fileSize'>,
  ): Promise<string> {
    const db = await getDB();
    const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: StoredRecording = {
      id,
      blob,
      metadata: {
        ...metadata,
        uploadStatus: 'pending',
        retryCount: 0,
        fileSize: blob.size,
      },
    };
    await db.put(storeName, record);
    return id;
  },

  async getRecording(id: string): Promise<StoredRecording | undefined> {
    const db = await getDB();
    return db.get(storeName, id);
  },

  async getAllRecordings(userId?: string): Promise<StoredRecording[]> {
    const db = await getDB();
    const all = await db.getAll(storeName);
    if (userId) {
      return all.filter(r => r.metadata.userId === userId);
    }
    return all;
  },

  async getPendingUploads(): Promise<StoredRecording[]> {
    const db = await getDB();
    const all = await db.getAll(storeName);
    return all
      .filter(r => r.metadata.uploadStatus === 'pending' || r.metadata.uploadStatus === 'failed')
      .sort((a, b) => new Date(a.metadata.timestamp).getTime() - new Date(b.metadata.timestamp).getTime());
  },

  async markAsUploading(id: string): Promise<void> {
    const db = await getDB();
    const record = await db.get(storeName, id);
    if (record) {
      record.metadata.uploadStatus = 'uploading';
      await db.put(storeName, record);
    }
  },

  async markAsUploaded(id: string): Promise<void> {
    const db = await getDB();
    const record = await db.get(storeName, id);
    if (record) {
      record.metadata.uploadStatus = 'uploaded';
      await db.put(storeName, record);
    }
  },

  async markAsFailed(id: string): Promise<void> {
    const db = await getDB();
    const record = await db.get(storeName, id);
    if (record) {
      record.metadata.uploadStatus = 'failed';
      record.metadata.retryCount += 1;
      await db.put(storeName, record);
    }
  },

  async deleteRecording(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(storeName, id);
  },

  async getStorageUsage(): Promise<{ usedBytes: number; count: number }> {
    const db = await getDB();
    const all = await db.getAll(storeName);
    const usedBytes = all.reduce((sum, r) => sum + (r.metadata.fileSize || 0), 0);
    return { usedBytes, count: all.length };
  },

  async cleanupOldRecordings(retentionDays: number = config.indexedDB.retentionDays): Promise<number> {
    const db = await getDB();
    const all = await db.getAll(storeName);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    let deleted = 0;
    for (const record of all) {
      if (
        record.metadata.uploadStatus === 'uploaded' &&
        new Date(record.metadata.timestamp) < cutoff
      ) {
        await db.delete(storeName, record.id);
        deleted++;
      }
    }
    return deleted;
  },

  async enforceQuota(): Promise<number> {
    const maxBytes = config.indexedDB.maxStorageMB * 1024 * 1024;
    const { usedBytes } = await this.getStorageUsage();

    if (usedBytes <= maxBytes) return 0;

    const db = await getDB();
    const all = await db.getAll(storeName);

    // Delete oldest uploaded recordings first
    const uploaded = all
      .filter(r => r.metadata.uploadStatus === 'uploaded')
      .sort((a, b) => new Date(a.metadata.timestamp).getTime() - new Date(b.metadata.timestamp).getTime());

    let freedBytes = 0;
    let deleted = 0;

    for (const record of uploaded) {
      if (usedBytes - freedBytes <= maxBytes) break;
      freedBytes += record.metadata.fileSize || 0;
      await db.delete(storeName, record.id);
      deleted++;
    }

    return deleted;
  },
};
