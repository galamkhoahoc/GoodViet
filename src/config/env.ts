// Environment configuration for GOODVIET
// All environment variables must be prefixed with VITE_ to be exposed to the client

export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || '',
  
  // Feature Flags
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false', // Default: true (mock mode)
  
  // Audio Configuration
  audio: {
    maxDurationSeconds: 300,
    minStorytellingDuration: 120,
    sampleRate: 16000,
    bitRate: 128000,
    preferredMimeType: 'audio/webm;codecs=opus',
    fallbackMimeType: 'audio/webm',
  },

  // IndexedDB
  indexedDB: {
    dbName: 'goodviet-audio',
    dbVersion: 1,
    storeName: 'recordings',
    maxStorageMB: 200,
    warningThresholdMB: 50,
    retentionDays: 7,
    maxRetries: 3,
  },

  // Sync
  sync: {
    retryDelays: [5000, 15000, 45000], // exponential backoff in ms
  },

  // App Info
  appName: 'GOODVIET',
  appVersion: '1.0.0',
} as const;

export type AppConfig = typeof config;
