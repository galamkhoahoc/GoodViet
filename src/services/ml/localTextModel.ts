import type {
  TextModelMessage,
  TextModelRuntimeState,
  TextModelWorkerMessage,
  TextModelWorkerRequest,
} from './textModel.types';

const INITIAL_STATE: TextModelRuntimeState = {
  status: 'idle',
  progress: 0,
  detail: 'Trợ lý AI chưa được nạp',
  fromCache: false,
  error: null,
};

interface PendingRequest {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
  onText?: (text: string) => void;
}

export interface GemmaGenerateOptions {
  maxNewTokens?: number;
  onText?: (text: string) => void;
}

function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `gemma-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

class LocalGemmaClient {
  private worker: Worker | null = null;
  private state: TextModelRuntimeState = INITIAL_STATE;
  private pending = new Map<string, PendingRequest>();
  private listeners = new Set<(state: TextModelRuntimeState) => void>();
  private preloadPromise: Promise<void> | null = null;

  getState() {
    return this.state;
  }

  subscribe(listener: (state: TextModelRuntimeState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(next: TextModelRuntimeState) {
    this.state = next;
    this.listeners.forEach((listener) => listener(next));
  }

  private ensureWorker() {
    if (this.worker) return this.worker;
    if (typeof Worker === 'undefined') throw new Error('Web Worker không khả dụng trên trình duyệt này.');

    const worker = new Worker(new URL('../../workers/textModel.worker.ts', import.meta.url), {
      type: 'module',
      name: 'goodviet-gemma-4-local',
    });
    worker.onmessage = (event: MessageEvent<TextModelWorkerMessage>) => this.handleMessage(event.data);
    worker.onerror = () => {
      const error = new Error('Tiến trình Trợ lý AI cục bộ đã dừng ngoài dự kiến.');
      this.pending.forEach((request) => request.reject(error));
      this.pending.clear();
      this.setState({ ...this.state, status: 'error', error: error.message, detail: error.message });
      this.worker?.terminate();
      this.worker = null;
      this.preloadPromise = null;
    };
    this.worker = worker;
    return worker;
  }

  private handleMessage(message: TextModelWorkerMessage) {
    if (message.type === 'state') {
      this.setState({
        status: message.status,
        progress: message.progress,
        detail: message.detail,
        fromCache: message.fromCache,
        error: message.error,
      });
      return;
    }

    const pending = this.pending.get(message.requestId);
    if (!pending) return;
    if (message.type === 'chunk') {
      pending.onText?.(message.text);
      return;
    }
    this.pending.delete(message.requestId);
    if (message.type === 'complete') {
      pending.resolve(message.text);
      return;
    }

    const status = message.code === 'WEBGPU_UNAVAILABLE' ? 'unsupported' : 'error';
    this.setState({ ...this.state, status, detail: message.message, error: message.message });
    pending.reject(new Error(message.message));
  }

  private request(payload: TextModelWorkerRequest, onText?: (text: string) => void) {
    return new Promise<string>((resolve, reject) => {
      this.pending.set(payload.requestId, { resolve, reject, onText });
      this.ensureWorker().postMessage(payload);
    });
  }

  async preload() {
    if (this.state.status === 'ready' || this.state.status === 'generating') return;
    if (this.preloadPromise) return this.preloadPromise;
    const requestId = createRequestId();
    this.preloadPromise = this.request({ type: 'init', requestId })
      .then(() => undefined)
      .finally(() => {
        this.preloadPromise = null;
      });
    return this.preloadPromise;
  }

  async generate(messages: TextModelMessage[], options: GemmaGenerateOptions = {}) {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      void navigator.storage.persist().catch(() => false);
    }
    const requestId = createRequestId();
    return this.request({
      type: 'generate',
      requestId,
      messages,
      maxNewTokens: options.maxNewTokens ?? 512,
    }, options.onText);
  }

  abort(requestId: string) {
    this.worker?.postMessage({ type: 'abort', requestId } satisfies TextModelWorkerRequest);
  }
}

export const localTextModel = new LocalGemmaClient();
