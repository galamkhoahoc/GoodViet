export type EraxModelStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'running'
  | 'complete'
  | 'missing-artifacts'
  | 'error';

export interface EraxTranscriptResult {
  text: string;
  language: string;
  languageProbability?: number;
  processingTimeMs: number;
  backend: 'webgpu' | 'wasm';
  modelId: string;
}

export interface EraxTranscribeRequest {
  type: 'transcribe';
  requestId: string;
  audio: Float32Array;
}

export type EraxWorkerRequest = EraxTranscribeRequest;

export type EraxWorkerMessage =
  | {
      type: 'state';
      requestId: string;
      status: Extract<EraxModelStatus, 'checking' | 'downloading' | 'loading' | 'ready' | 'running'>;
      progress: number;
      detail: string;
      isCached?: boolean;
    }
  | { type: 'result'; requestId: string; result: EraxTranscriptResult }
  | {
      type: 'error';
      requestId: string;
      code: 'MISSING_BROWSER_MODEL' | 'MODEL_LOAD_FAILED' | 'INFERENCE_FAILED';
      message: string;
    };
