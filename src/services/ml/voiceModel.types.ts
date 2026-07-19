export type LocalVoiceModelStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'running'
  | 'complete'
  | 'error'
  | 'missing-artifacts';

export type LocalVoiceBackend = 'webgpu' | 'wasm';

export interface LocalVoicePhoneme {
  token: string;
  confidence?: number;
  startTime?: number;
  endTime?: number;
}

export interface LocalVoiceResult {
  phonemes: LocalVoicePhoneme[];
  confidence?: number;
  processingTimeMs?: number;
  backend?: LocalVoiceBackend;
}

export interface AnalyzeVoiceRequest {
  type: 'analyze';
  requestId: string;
  audio: Float32Array;
  durationSeconds: number;
}

export interface ResetVoiceModelRequest {
  type: 'reset';
}

export type VoiceModelWorkerRequest = AnalyzeVoiceRequest | ResetVoiceModelRequest;

export interface VoiceModelStateMessage {
  type: 'state';
  requestId: string;
  status: Extract<LocalVoiceModelStatus, 'checking' | 'downloading' | 'loading' | 'ready' | 'running'>;
  progress: number;
  isCached?: boolean;
}

export interface VoiceModelResultMessage {
  type: 'result';
  requestId: string;
  result: LocalVoiceResult;
}

export interface VoiceModelErrorMessage {
  type: 'error';
  requestId: string;
  code: 'MISSING_ARTIFACTS' | 'MODEL_LOAD_FAILED' | 'INFERENCE_FAILED';
  message: string;
}

export type VoiceModelWorkerMessage =
  | VoiceModelStateMessage
  | VoiceModelResultMessage
  | VoiceModelErrorMessage;
