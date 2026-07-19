/// <reference lib="webworker" />

import { env, pipeline } from '@huggingface/transformers';
import type {
  EraxTranscriptResult,
  EraxWorkerMessage,
  EraxWorkerRequest,
} from '../services/ml/erax.types';

const SOURCE_MODEL_ID = 'erax-ai/EraX-WoW-Turbo-V1.1';
const BROWSER_MODEL_ID = import.meta.env.VITE_ERAX_BROWSER_MODEL_ID || '';
const MODEL_REVISION = import.meta.env.VITE_ERAX_MODEL_REVISION || 'main';
const REQUESTED_DEVICE = import.meta.env.VITE_ERAX_DEVICE === 'webgpu' ? 'webgpu' : 'wasm';

env.allowRemoteModels = true;
env.useBrowserCache = typeof caches !== 'undefined';

interface ProgressInfo {
  status?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

interface TranscriptionOutput {
  text: string;
  language?: string;
  language_probability?: number;
}

type Transcriber = (
  audio: Float32Array,
  options: Record<string, unknown>,
) => Promise<TranscriptionOutput | TranscriptionOutput[]>;

let transcriber: Transcriber | null = null;
let transcriberPromise: Promise<Transcriber> | null = null;
let backend: 'webgpu' | 'wasm' = REQUESTED_DEVICE;

function post(message: EraxWorkerMessage) {
  self.postMessage(message);
}

function postState(
  requestId: string,
  status: Extract<EraxWorkerMessage, { type: 'state' }>['status'],
  progress: number,
  detail: string,
  isCached?: boolean,
) {
  post({ type: 'state', requestId, status, progress, detail, isCached });
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function formatMegabytes(value: number) {
  return `${Math.round(value / (1024 * 1024))} MB`;
}

function browserModelHelp() {
  return 'EraX cần bản ONNX dành cho browser. Hãy chạy tools/erax-browser-model/export_erax_model.ps1, upload thư mục output lên Hugging Face rồi đặt VITE_ERAX_BROWSER_MODEL_ID.';
}

async function createTranscriber(requestId: string): Promise<Transcriber> {
  if (!BROWSER_MODEL_ID) throw new Error(`MISSING_BROWSER_MODEL: ${browserModelHelp()}`);

  let visibleProgress = 0;
  const progressCallback = (value: unknown) => {
    const info = value as ProgressInfo;
    if (info.status !== 'download' && info.status !== 'progress') return;
    const fileProgress = Math.min(1, Math.max(0, (info.progress ?? 0) / 100));
    visibleProgress = Math.max(visibleProgress, fileProgress * 0.94);
    const loaded = typeof info.loaded === 'number' ? info.loaded : null;
    const total = typeof info.total === 'number' ? info.total : null;
    const detail = loaded !== null && total !== null
      ? `Đang tải EraX lần đầu: ${formatMegabytes(loaded)} / ${formatMegabytes(total)}`
      : `Đang tải ${info.file || 'trọng số EraX'}…`;
    postState(requestId, 'downloading', visibleProgress, detail, false);
  };

  postState(requestId, 'checking', 0, 'Đang kiểm tra model EraX trong cache…', false);
  const candidates: Array<{
    device: 'webgpu' | 'wasm';
    dtype: Record<string, 'fp16' | 'q8' | 'q4'>;
  }> = REQUESTED_DEVICE === 'webgpu' && 'gpu' in navigator
    ? [
        { device: 'webgpu', dtype: { encoder_model: 'fp16', decoder_model_merged: 'fp16' } },
        { device: 'wasm', dtype: { encoder_model: 'q8', decoder_model_merged: 'q8' } },
      ]
    : [{ device: 'wasm', dtype: { encoder_model: 'q8', decoder_model_merged: 'q8' } }];

  const errors: string[] = [];
  for (const candidate of candidates) {
    try {
      const runner = await pipeline('automatic-speech-recognition', BROWSER_MODEL_ID, {
        revision: MODEL_REVISION,
        device: candidate.device,
        dtype: candidate.dtype,
        progress_callback: progressCallback,
      });
      backend = candidate.device;
      postState(requestId, 'loading', Math.max(visibleProgress, 0.98), 'Đang khởi tạo bộ nhận dạng tiếng Việt…', true);
      return runner as unknown as Transcriber;
    } catch (error) {
      errors.push(readableError(error));
    }
  }
  throw new Error(`MODEL_LOAD_FAILED: ${errors.at(-1) || 'Không đọc được artifact ONNX.'}`);
}

async function ensureTranscriber(requestId: string) {
  if (transcriber) {
    postState(requestId, 'ready', 1, 'EraX đã sẵn sàng trên thiết bị', true);
    return transcriber;
  }
  if (!transcriberPromise) transcriberPromise = createTranscriber(requestId);
  try {
    transcriber = await transcriberPromise;
    postState(requestId, 'ready', 1, 'EraX đã sẵn sàng trên thiết bị', true);
    return transcriber;
  } catch (error) {
    transcriberPromise = null;
    throw error;
  }
}

async function transcribe(request: EraxWorkerRequest) {
  const startedAt = performance.now();
  try {
    const runner = await ensureTranscriber(request.requestId);
    postState(request.requestId, 'running', 1, 'EraX đang chuyển giọng nói thành văn bản…', true);
    const raw = await runner(request.audio, {
      language: 'vi',
      task: 'transcribe',
      return_timestamps: false,
      chunk_length_s: 30,
    });
    const output = Array.isArray(raw) ? raw[0] : raw;
    const result: EraxTranscriptResult = {
      text: (output?.text || '').trim(),
      language: output?.language || 'vi',
      languageProbability: output?.language_probability,
      processingTimeMs: performance.now() - startedAt,
      backend,
      modelId: BROWSER_MODEL_ID,
    };
    post({ type: 'result', requestId: request.requestId, result });
  } catch (error) {
    const message = readableError(error);
    const missing = message.startsWith('MISSING_BROWSER_MODEL:');
    const loadFailed = message.startsWith('MODEL_LOAD_FAILED:');
    post({
      type: 'error',
      requestId: request.requestId,
      code: missing ? 'MISSING_BROWSER_MODEL' : loadFailed ? 'MODEL_LOAD_FAILED' : 'INFERENCE_FAILED',
      message: missing
        ? message.replace('MISSING_BROWSER_MODEL:', '').trim()
        : loadFailed
          ? `Không thể nạp bản ONNX của ${SOURCE_MODEL_ID}. Kiểm tra model ID, revision và các file encoder/decoder đã quantize.`
          : `EraX không thể nhận dạng bản ghi: ${message}`,
    });
  }
}

self.onmessage = (event: MessageEvent<EraxWorkerRequest>) => {
  void transcribe(event.data);
};

export {};
