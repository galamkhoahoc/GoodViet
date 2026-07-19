export type GemmaRuntimeStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'generating'
  | 'unsupported'
  | 'error';

export interface GemmaMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GemmaRuntimeState {
  status: GemmaRuntimeStatus;
  progress: number;
  detail: string;
  fromCache: boolean;
  error: string | null;
}

export interface GemmaInitRequest {
  type: 'init';
  requestId: string;
}

export interface GemmaGenerateRequest {
  type: 'generate';
  requestId: string;
  messages: GemmaMessage[];
  maxNewTokens: number;
}

export interface GemmaAbortRequest {
  type: 'abort';
  requestId: string;
}

export type GemmaWorkerRequest = GemmaInitRequest | GemmaGenerateRequest | GemmaAbortRequest;

export type GemmaWorkerMessage =
  | ({ type: 'state'; requestId: string } & GemmaRuntimeState)
  | { type: 'chunk'; requestId: string; text: string }
  | { type: 'complete'; requestId: string; text: string }
  | { type: 'error'; requestId: string; code: 'WEBGPU_UNAVAILABLE' | 'MODEL_LOAD_FAILED' | 'GENERATION_FAILED'; message: string };
