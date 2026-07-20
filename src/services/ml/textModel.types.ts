export type TextModelRuntimeStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'generating'
  | 'unsupported'
  | 'error';

export interface TextModelMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TextModelRuntimeState {
  status: TextModelRuntimeStatus;
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
  messages: TextModelMessage[];
  maxNewTokens: number;
}

export interface GemmaAbortRequest {
  type: 'abort';
  requestId: string;
}

export type TextModelWorkerRequest = GemmaInitRequest | GemmaGenerateRequest | GemmaAbortRequest;

export type TextModelWorkerMessage =
  | ({ type: 'state'; requestId: string } & TextModelRuntimeState)
  | { type: 'chunk'; requestId: string; text: string }
  | { type: 'complete'; requestId: string; text: string }
  | { type: 'error'; requestId: string; code: 'WEBGPU_UNAVAILABLE' | 'MODEL_LOAD_FAILED' | 'GENERATION_FAILED'; message: string };
