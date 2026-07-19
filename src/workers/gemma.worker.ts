/// <reference lib="webworker" />

import type {
  GemmaMessage,
  GemmaRuntimeState,
  GemmaWorkerMessage,
  GemmaWorkerRequest,
} from '../services/ml/gemma.types';

const DEFAULT_RUNTIME_URL = `${self.location.origin}/ai-runtime/gemma-4-e2b.js`;
const RUNTIME_URL = import.meta.env.VITE_GEMMA_RUNTIME_URL || DEFAULT_RUNTIME_URL;

interface GemmaProgressEvent {
  status?: 'init' | 'tokenizer' | 'weights' | 'ready' | string;
  kind?: 'bytes' | 'tensors';
  fraction?: number;
  loaded?: number;
  total?: number;
  fromCache?: boolean;
  message?: string;
}

interface GemmaGenerationChunk {
  text: string;
}

interface GemmaModel {
  warmup(): Promise<void>;
  generate(
    messages: GemmaMessage[],
    options: { maxNewTokens: number; signal: AbortSignal },
  ): AsyncIterable<GemmaGenerationChunk>;
}

interface GemmaModule {
  Gemma4Mobile: {
    load(modelId: string | null, options: { onProgress: (event: GemmaProgressEvent) => void }): Promise<GemmaModel>;
  };
}

let model: GemmaModel | null = null;
let modelPromise: Promise<GemmaModel> | null = null;
let activeLoadRequestId = '';
let generationQueue: Promise<void> = Promise.resolve();
const abortControllers = new Map<string, AbortController>();

function post(message: GemmaWorkerMessage) {
  self.postMessage(message);
}

function clampFraction(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : 0;
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(value > 1024 ** 3 ? 0 : 1)} MB`;
}

function postState(requestId: string, state: GemmaRuntimeState) {
  post({ type: 'state', requestId, ...state });
}

function progressState(event: GemmaProgressEvent): GemmaRuntimeState {
  const fraction = clampFraction(event.fraction);
  const fromCache = Boolean(event.fromCache);

  if (event.status === 'weights') {
    const progress = 0.04 + fraction * 0.94;
    const loaded = typeof event.loaded === 'number' ? event.loaded : null;
    const total = typeof event.total === 'number' ? event.total : null;
    const verb = fromCache ? 'Đang đọc trọng số Gemma từ cache' : 'Đang tải trọng số Gemma lần đầu';
    const detail = event.kind === 'bytes' && loaded !== null && total !== null
      ? `${verb}: ${formatBytes(loaded)} / ${formatBytes(total)}`
      : event.kind === 'tensors' && loaded !== null && total !== null
        ? `Đang chuẩn bị GPU: ${loaded} / ${total} tensors`
        : verb;
    return { status: fromCache ? 'loading' : 'downloading', progress, detail, fromCache, error: null };
  }

  if (event.status === 'tokenizer') {
    return { status: 'loading', progress: 0.02 + fraction * 0.02, detail: 'Đang nạp tokenizer Gemma…', fromCache, error: null };
  }
  if (event.status === 'ready') {
    return { status: 'loading', progress: 0.98, detail: 'Đang làm nóng WebGPU…', fromCache, error: null };
  }
  return { status: 'checking', progress: Math.max(0.01, fraction * 0.02), detail: 'Đang kiểm tra WebGPU…', fromCache, error: null };
}

async function loadModel(requestId: string) {
  if (model) return model;
  if (!('gpu' in navigator)) {
    throw new Error('WEBGPU_UNAVAILABLE');
  }

  activeLoadRequestId = requestId;
  if (!modelPromise) {
    modelPromise = (async () => {
      postState(requestId, {
        status: 'checking',
        progress: 0.01,
        detail: 'Đang khởi tạo WebGPU…',
        fromCache: false,
        error: null,
      });

      const runtime = await import(/* @vite-ignore */ RUNTIME_URL) as GemmaModule;
      const loaded = await runtime.Gemma4Mobile.load(null, {
        onProgress: (event) => postState(activeLoadRequestId || requestId, progressState(event)),
      });
      postState(activeLoadRequestId || requestId, {
        status: 'loading',
        progress: 0.99,
        detail: 'Đang làm nóng các kernel Gemma…',
        fromCache: true,
        error: null,
      });
      await loaded.warmup();
      return loaded;
    })();
  }

  try {
    model = await modelPromise;
    postState(requestId, {
      status: 'ready',
      progress: 1,
      detail: 'Gemma 4 đã sẵn sàng trên thiết bị',
      fromCache: true,
      error: null,
    });
    return model;
  } catch (error) {
    modelPromise = null;
    throw error;
  }
}

async function initialize(requestId: string) {
  try {
    await loadModel(requestId);
    post({ type: 'complete', requestId, text: '' });
  } catch (error) {
    const unsupported = error instanceof Error && error.message === 'WEBGPU_UNAVAILABLE';
    post({
      type: 'error',
      requestId,
      code: unsupported ? 'WEBGPU_UNAVAILABLE' : 'MODEL_LOAD_FAILED',
      message: unsupported
        ? 'Thiết bị hoặc trình duyệt này chưa hỗ trợ WebGPU. Hãy dùng Chrome/Edge mới và bật tăng tốc phần cứng.'
        : `Không thể tải Gemma 4 cục bộ: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

async function generate(request: Extract<GemmaWorkerRequest, { type: 'generate' }>) {
  try {
    const activeModel = await loadModel(request.requestId);
    const controller = new AbortController();
    abortControllers.set(request.requestId, controller);
    postState(request.requestId, {
      status: 'generating',
      progress: 1,
      detail: 'Gemma 4 đang tạo câu trả lời trên thiết bị…',
      fromCache: true,
      error: null,
    });

    let finalText = '';
    const stream = activeModel.generate(request.messages, {
      maxNewTokens: request.maxNewTokens,
      signal: controller.signal,
    });
    for await (const chunk of stream) {
      finalText = chunk.text;
      post({ type: 'chunk', requestId: request.requestId, text: finalText });
    }
    post({ type: 'complete', requestId: request.requestId, text: finalText.trim() });
    postState(request.requestId, {
      status: 'ready',
      progress: 1,
      detail: 'Gemma 4 đã sẵn sàng trên thiết bị',
      fromCache: true,
      error: null,
    });
  } catch (error) {
    post({
      type: 'error',
      requestId: request.requestId,
      code: model ? 'GENERATION_FAILED' : 'MODEL_LOAD_FAILED',
      message: `Gemma 4 không thể tạo phản hồi: ${error instanceof Error ? error.message : String(error)}`,
    });
  } finally {
    abortControllers.delete(request.requestId);
  }
}

self.onmessage = (event: MessageEvent<GemmaWorkerRequest>) => {
  const request = event.data;
  if (request.type === 'abort') {
    abortControllers.get(request.requestId)?.abort();
    return;
  }
  if (request.type === 'init') {
    void initialize(request.requestId);
    return;
  }
  generationQueue = generationQueue.then(() => generate(request));
};

export {};
