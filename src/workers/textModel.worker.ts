/// <reference lib="webworker" />

import type {
  TextModelMessage,
  TextModelRuntimeState,
  TextModelWorkerMessage,
  TextModelWorkerRequest,
} from '../services/ml/textModel.types';

const DEFAULT_RUNTIME_URL = `${self.location.origin}/ai-runtime/gemma-4-e2b.js`;
const RUNTIME_URL = import.meta.env.VITE_GEMMA_RUNTIME_URL || DEFAULT_RUNTIME_URL;

interface TextModelProgressEvent {
  status?: 'init' | 'tokenizer' | 'weights' | 'ready' | string;
  kind?: 'bytes' | 'tensors';
  fraction?: number;
  loaded?: number;
  total?: number;
  fromCache?: boolean;
  message?: string;
}

interface TextModelGenerationChunk {
  text: string;
}

interface TextModelType {
  warmup(): Promise<void>;
  generate(
    messages: TextModelMessage[],
    options: { maxNewTokens: number; signal: AbortSignal },
  ): AsyncIterable<TextModelGenerationChunk>;
}

interface TextModelModule {
  Gemma4Mobile: {
    load(modelId: string | null, options: { 
      onProgress: (event: TextModelProgressEvent) => void;
      runtimeOptions?: { device?: 'wasm' | 'webgpu' };
    }): Promise<TextModelType>;
  };
}

let model: TextModelType | null = null;
let modelPromise: Promise<TextModelType> | null = null;
let activeLoadRequestId = '';
let generationQueue: Promise<void> = Promise.resolve();
const abortControllers = new Map<string, AbortController>();
let forceWasm = false;

function post(message: TextModelWorkerMessage) {
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

function postState(requestId: string, state: TextModelRuntimeState) {
  post({ type: 'state', requestId, ...state });
}

function progressState(event: TextModelProgressEvent): TextModelRuntimeState {
  const fraction = clampFraction(event.fraction);
  const fromCache = Boolean(event.fromCache);

  if (event.status === 'weights') {
    const progress = 0.04 + fraction * 0.94;
    const loaded = typeof event.loaded === 'number' ? event.loaded : null;
    const total = typeof event.total === 'number' ? event.total : null;
    const verb = fromCache ? 'Đang đọc trọng số AI từ cache' : 'Đang tải trọng số AI lần đầu';
    const detail = event.kind === 'bytes' && loaded !== null && total !== null
      ? `${verb}: ${formatBytes(loaded)} / ${formatBytes(total)}`
      : event.kind === 'tensors' && loaded !== null && total !== null
        ? `Đang chuẩn bị GPU: ${loaded} / ${total} tensors`
        : verb;
    return { status: fromCache ? 'loading' : 'downloading', progress, detail, fromCache, error: null };
  }

  if (event.status === 'tokenizer') {
    return { status: 'loading', progress: 0.02 + fraction * 0.02, detail: 'Đang nạp tokenizer…', fromCache, error: null };
  }
  if (event.status === 'ready') {
    return { status: 'loading', progress: 0.98, detail: 'Đang làm nóng WebGPU…', fromCache, error: null };
  }
  return { status: 'checking', progress: Math.max(0.01, fraction * 0.02), detail: 'Đang kiểm tra WebGPU…', fromCache, error: null };
}

async function loadModel(requestId: string) {
  if (model) return model;

  activeLoadRequestId = requestId;
  if (!modelPromise) {
    modelPromise = (async () => {
      postState(requestId, {
        status: 'checking',
        progress: 0.01,
        detail: 'Đang khởi tạo AI…',
        fromCache: false,
        error: null,
      });

      const runtime = await import(/* @vite-ignore */ RUNTIME_URL) as TextModelModule;
      
      let loaded: TextModelType;
      try {
        if (!('gpu' in navigator) || forceWasm) {
          throw new Error('WEBGPU_UNAVAILABLE');
        }
        loaded = await runtime.Gemma4Mobile.load(null, {
          onProgress: (event) => postState(activeLoadRequestId || requestId, progressState(event)),
        });
      } catch (e) {
        console.warn('WebGPU load failed or skipped, falling back to WASM (CPU)', e);
        postState(activeLoadRequestId || requestId, {
          status: 'checking',
          progress: 0.05,
          detail: 'Đang dùng CPU (chế độ này sẽ chậm hơn). Đừng tắt máy nhé…',
          fromCache: false,
          error: null,
        });
        
        loaded = await runtime.Gemma4Mobile.load(null, {
          onProgress: (event) => postState(activeLoadRequestId || requestId, progressState(event)),
          runtimeOptions: { device: 'wasm' }
        });
      }
      postState(activeLoadRequestId || requestId, {
        status: 'loading',
        progress: 0.99,
        detail: 'Đang làm nóng các kernel AI…',
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
      detail: 'Trợ lý AI đã sẵn sàng trên thiết bị',
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    const unsupported = errorMsg === 'WEBGPU_UNAVAILABLE' || errorMsg.toLowerCase().includes('webgpu');
    post({
      type: 'error',
      requestId,
      code: unsupported ? 'WEBGPU_UNAVAILABLE' : 'MODEL_LOAD_FAILED',
      message: unsupported
        ? 'Thiết bị hoặc trình duyệt này không tương thích với mô hình WebGPU. Hãy thử dùng máy tính khác hoặc sử dụng tính năng Đám mây (nếu có).'
        : `Không thể tải Trợ lý AI cục bộ: ${errorMsg}`,
    });
  }
}

async function generate(request: Extract<TextModelWorkerRequest, { type: 'generate' }>) {
  try {
    const activeModel = await loadModel(request.requestId);
    const controller = new AbortController();
    abortControllers.set(request.requestId, controller);
    postState(request.requestId, {
      status: 'generating',
      progress: 1,
      detail: 'Trợ lý AI đang tạo câu trả lời trên thiết bị…',
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
      detail: 'Trợ lý AI đã sẵn sàng trên thiết bị',
      fromCache: true,
      error: null,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (!forceWasm && errorMsg.toLowerCase().includes('webgpu')) {
      console.warn('WebGPU crashed during generation. Falling back to WASM...', error);
      forceWasm = true;
      model = null;
      modelPromise = null;
      abortControllers.delete(request.requestId);
      return generate(request); // Retry recursively with WASM
    }

    post({
      type: 'error',
      requestId: request.requestId,
      code: model ? 'GENERATION_FAILED' : 'MODEL_LOAD_FAILED',
      message: `Trợ lý AI không thể tạo phản hồi: ${errorMsg}`,
    });
  } finally {
    abortControllers.delete(request.requestId);
  }
}

self.onmessage = (event: MessageEvent<TextModelWorkerRequest>) => {
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
