/// <reference lib="webworker" />

import { AutoFeatureExtractor, Wav2Vec2ForCTC, env } from '@huggingface/transformers';
import { VI_PHONE_LABELS } from '../data/voicePhonemes';
import { decodeCtcLogits } from '../services/ml/ctcDecoder';
import type {
  AnalyzeVoiceRequest,
  LocalVoiceBackend,
  VoiceModelWorkerMessage,
  VoiceModelWorkerRequest,
} from '../services/ml/voiceModel.types';

const DEFAULT_MODEL_ID = 'tuanio/wav2vec2-base-finetune-vi_phone-non_freeze-spec_aug-500epoch';
const MODEL_ID = import.meta.env.VITE_VOICE_MODEL_ID || DEFAULT_MODEL_ID;
const MODEL_REVISION = import.meta.env.VITE_VOICE_MODEL_REVISION || 'main';

env.allowRemoteModels = true;
env.useBrowserCache = typeof caches !== 'undefined';

interface TensorLike {
  data: ArrayLike<number>;
  dims: number[];
}

interface FeatureExtractorOutput {
  input_values: unknown;
}

interface ModelOutput {
  logits: TensorLike;
}

type FeatureExtractorRunner = (audio: Float32Array) => Promise<FeatureExtractorOutput>;
type VoiceModelRunner = (inputs: { input_values: unknown }) => Promise<ModelOutput>;

interface VoiceRuntime {
  featureExtractor: FeatureExtractorRunner;
  model: VoiceModelRunner;
  backend: LocalVoiceBackend;
}

interface ProgressInfo {
  status?: string;
  file?: string;
  progress?: number;
}

interface RuntimeCandidate {
  backend: LocalVoiceBackend;
  device: 'webgpu' | 'wasm';
  dtype: 'fp16' | 'q8';
}

let runtime: VoiceRuntime | null = null;
let runtimePromise: Promise<VoiceRuntime> | null = null;

function post(message: VoiceModelWorkerMessage) {
  self.postMessage(message);
}

function postState(
  requestId: string,
  status: Extract<VoiceModelWorkerMessage, { type: 'state' }>['status'],
  progress: number,
  isCached?: boolean,
) {
  post({ type: 'state', requestId, status, progress, isCached });
}

function supportsWebGpu() {
  return 'gpu' in navigator;
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function looksLikeMissingOnnx(error: unknown) {
  const message = readableError(error);
  return /(404|not found|could not locate|no such file|unauthorized access to file)/i.test(message)
    && /onnx[\\/]model_(fp16|quantized)\.onnx/i.test(message);
}

function remoteArtifactUrl(file: string) {
  const path = env.remotePathTemplate
    .replaceAll('{model}', MODEL_ID)
    .replaceAll('{revision}', encodeURIComponent(MODEL_REVISION));
  return `${env.remoteHost.replace(/\/$/, '')}/${path.replace(/^\//, '')}${file}`;
}

async function findCachedArtifacts(files: string[]) {
  const cached = new Set<string>();
  if (!env.useBrowserCache || typeof caches === 'undefined') return cached;

  try {
    const cache = await caches.open('transformers-cache');
    await Promise.all(files.map(async file => {
      if (await cache.match(remoteArtifactUrl(file))) cached.add(file);
    }));
  } catch {
    // Cache access can be denied in private mode. Loading still works over the network.
  }
  return cached;
}

async function createRuntime(requestId: string): Promise<VoiceRuntime> {
  let visibleProgress = 0;
  const cachedArtifacts = await findCachedArtifacts([
    'config.json',
    'preprocessor_config.json',
    'onnx/model_fp16.onnx',
    'onnx/model_quantized.onnx',
  ]);

  const progressCallback = (event: unknown) => {
    const info = event as ProgressInfo;
    const file = info.file ?? '';

    if (info.status === 'download' || info.status === 'progress') {
      const fileProgress = Math.min(1, Math.max(0, (info.progress ?? 0) / 100));
      const mapped = file.endsWith('.onnx')
        ? 0.08 + fileProgress * 0.84
        : Math.min(0.08, 0.02 + fileProgress * 0.06);
      visibleProgress = Math.max(visibleProgress, mapped);
      const cacheHit = cachedArtifacts.has(file);
      postState(requestId, cacheHit ? 'loading' : 'downloading', visibleProgress, cacheHit);
    }
  };

  postState(requestId, 'checking', 0, false);

  let featureExtractor: FeatureExtractorRunner;
  try {
    featureExtractor = await AutoFeatureExtractor.from_pretrained(MODEL_ID, {
      revision: MODEL_REVISION,
      progress_callback: progressCallback,
    }) as unknown as FeatureExtractorRunner;
  } catch (error) {
    throw new Error(`MODEL_LOAD_FAILED: ${readableError(error)}`, { cause: error });
  }

  const candidates: RuntimeCandidate[] = supportsWebGpu()
    ? [
        { backend: 'webgpu', device: 'webgpu', dtype: 'fp16' },
        { backend: 'wasm', device: 'wasm', dtype: 'q8' },
      ]
    : [{ backend: 'wasm', device: 'wasm', dtype: 'q8' }];

  const failures: unknown[] = [];
  for (const candidate of candidates) {
    try {
      const model = await Wav2Vec2ForCTC.from_pretrained(MODEL_ID, {
        revision: MODEL_REVISION,
        device: candidate.device,
        dtype: candidate.dtype,
        progress_callback: progressCallback,
      }) as unknown as VoiceModelRunner;

      postState(requestId, 'loading', Math.max(visibleProgress, 0.96), false);
      return { featureExtractor, model, backend: candidate.backend };
    } catch (error) {
      failures.push(error);
    }
  }

  const missingArtifacts = failures.length > 0 && failures.every(looksLikeMissingOnnx);
  if (missingArtifacts) {
    throw new Error('MISSING_ARTIFACTS: Model Hugging Face chưa có tệp onnx/model_fp16.onnx hoặc onnx/model_quantized.onnx dành cho trình duyệt.');
  }
  throw new Error(`MODEL_LOAD_FAILED: ${readableError(failures.at(-1))}`);
}

async function ensureRuntime(requestId: string) {
  if (runtime) {
    postState(requestId, 'ready', 1, true);
    return runtime;
  }

  if (!runtimePromise) {
    runtimePromise = createRuntime(requestId);
  }

  try {
    runtime = await runtimePromise;
    postState(requestId, 'ready', 1, true);
    return runtime;
  } catch (error) {
    runtimePromise = null;
    throw error;
  }
}

async function analyze(request: AnalyzeVoiceRequest) {
  const startedAt = performance.now();

  try {
    const activeRuntime = await ensureRuntime(request.requestId);
    postState(request.requestId, 'running', 0, true);

    const features = await activeRuntime.featureExtractor(request.audio);
    const output = await activeRuntime.model({ input_values: features.input_values });
    const logits = output.logits;
    const frameCount = logits.dims.at(-2);
    const vocabSize = logits.dims.at(-1);

    if (frameCount === undefined || vocabSize === undefined || vocabSize !== VI_PHONE_LABELS.length) {
      throw new Error(`Kích thước logits không hợp lệ: ${logits.dims.join(' × ')}.`);
    }

    const decoded = decodeCtcLogits(
      logits.data,
      frameCount,
      vocabSize,
      request.durationSeconds,
    );

    post({
      type: 'result',
      requestId: request.requestId,
      result: {
        ...decoded,
        processingTimeMs: performance.now() - startedAt,
        backend: activeRuntime.backend,
      },
    });
  } catch (error) {
    const message = readableError(error);
    const isMissing = message.startsWith('MISSING_ARTIFACTS:');
    const isLoadFailure = message.startsWith('MODEL_LOAD_FAILED:');
    post({
      type: 'error',
      requestId: request.requestId,
      code: isMissing ? 'MISSING_ARTIFACTS' : isLoadFailure ? 'MODEL_LOAD_FAILED' : 'INFERENCE_FAILED',
      message: isMissing
        ? message.replace('MISSING_ARTIFACTS:', '').trim()
        : isLoadFailure
          ? 'Không thể tải model cục bộ. Hãy kiểm tra kết nối, dung lượng lưu trữ và thử lại.'
          : `Không thể phân tích bản ghi: ${message}`,
    });
  }
}

self.onmessage = (event: MessageEvent<VoiceModelWorkerRequest>) => {
  if (event.data.type === 'reset') return;
  void analyze(event.data);
};

export {};
