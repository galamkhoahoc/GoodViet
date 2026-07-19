import { useCallback, useEffect, useRef, useState } from 'react';
import { prepareVoiceAudio } from '../services/ml/audioPreprocessing';
import type {
  LocalVoiceModelStatus,
  LocalVoiceResult,
  VoiceModelWorkerMessage,
  VoiceModelWorkerRequest,
} from '../services/ml/voiceModel.types';

interface LocalVoiceModelState {
  status: LocalVoiceModelStatus;
  progress: number;
  result: LocalVoiceResult | null;
  error: string | null;
  isCached: boolean;
}

interface PendingAnalysis {
  requestId: string;
  resolve: (result: LocalVoiceResult) => void;
  reject: (error: Error) => void;
}

const INITIAL_STATE: LocalVoiceModelState = {
  status: 'idle',
  progress: 0,
  result: null,
  error: null,
  isCached: false,
};

function createRequestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `voice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useLocalVoiceModel() {
  const [state, setState] = useState<LocalVoiceModelState>(INITIAL_STATE);
  const workerRef = useRef<Worker | null>(null);
  const currentRequestRef = useRef<string | null>(null);
  const pendingRef = useRef<PendingAnalysis | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const modelReadyRef = useRef(false);

  const rejectPending = useCallback((message: string) => {
    pendingRef.current?.reject(new Error(message));
    pendingRef.current = null;
  }, []);

  const handleWorkerMessage = useCallback((event: MessageEvent<VoiceModelWorkerMessage>) => {
    const message = event.data;
    if (!message || message.requestId !== currentRequestRef.current) return;

    if (message.type === 'state') {
      if (message.status === 'ready') modelReadyRef.current = true;
      setState(previous => ({
        ...previous,
        status: message.status,
        progress: message.progress,
        error: null,
        isCached: message.isCached ?? previous.isCached,
      }));
      return;
    }

    if (message.type === 'result') {
      const pending = pendingRef.current;
      pendingRef.current = null;
      currentRequestRef.current = null;
      modelReadyRef.current = true;
      setState(previous => ({
        ...previous,
        status: 'complete',
        progress: 1,
        result: message.result,
        error: null,
      }));
      pending?.resolve(message.result);
      return;
    }

    const pending = pendingRef.current;
    pendingRef.current = null;
    currentRequestRef.current = null;
    const error = new Error(message.message);
    setState(previous => ({
      ...previous,
      status: message.code === 'MISSING_ARTIFACTS' ? 'missing-artifacts' : 'error',
      progress: 0,
      result: null,
      error: message.message,
    }));
    pending?.reject(error);
  }, []);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;

    const worker = new Worker(new URL('../workers/voiceModel.worker.ts', import.meta.url), {
      type: 'module',
      name: 'goodviet-local-voice-model',
    });
    worker.onmessage = handleWorkerMessage;
    worker.onerror = () => {
      currentRequestRef.current = null;
      rejectPending('Không thể khởi động bộ xử lý giọng nói cục bộ trên trình duyệt này.');
      setState(previous => ({
        ...previous,
        status: 'error',
        progress: 0,
        result: null,
        error: 'Không thể khởi động bộ xử lý giọng nói cục bộ trên trình duyệt này.',
      }));
    };
    workerRef.current = worker;
    return worker;
  }, [handleWorkerMessage, rejectPending]);

  const analyzeAsync = useCallback(async (file: File): Promise<LocalVoiceResult> => {
    lastFileRef.current = file;
    rejectPending('Yêu cầu phân tích trước đã được thay thế.');
    const requestId = createRequestId();
    currentRequestRef.current = requestId;
    setState(previous => ({
      ...previous,
      status: 'checking',
      progress: 0,
      result: null,
      error: null,
    }));

    return new Promise<LocalVoiceResult>((resolve, reject) => {
      pendingRef.current = { requestId, resolve, reject };
      void (async () => {
        try {
          if (navigator.storage?.persist) {
            void navigator.storage.persist().catch(() => false);
          }
          const prepared = await prepareVoiceAudio(file);
          if (currentRequestRef.current !== requestId) return;

          const request: VoiceModelWorkerRequest = {
            type: 'analyze',
            requestId,
            audio: prepared.samples,
            durationSeconds: prepared.durationSeconds,
          };
          ensureWorker().postMessage(request, [prepared.samples.buffer as ArrayBuffer]);
        } catch (error) {
          if (currentRequestRef.current !== requestId) return;
          const normalized = error instanceof Error
            ? error
            : new Error('Không thể chuẩn bị tệp âm thanh để phân tích.');
          currentRequestRef.current = null;
          pendingRef.current = null;
          setState(previous => ({
            ...previous,
            status: 'error',
            progress: 0,
            result: null,
            error: normalized.message,
          }));
          reject(normalized);
        }
      })();
    });
  }, [ensureWorker, rejectPending]);

  const analyze = useCallback((file: File) => {
    void analyzeAsync(file).catch(() => undefined);
  }, [analyzeAsync]);

  const retry = useCallback(async () => {
    if (lastFileRef.current) await analyzeAsync(lastFileRef.current);
  }, [analyzeAsync]);

  const reset = useCallback(() => {
    currentRequestRef.current = null;
    rejectPending('Yêu cầu phân tích đã bị hủy.');
    lastFileRef.current = null;
    setState({
      ...INITIAL_STATE,
      status: modelReadyRef.current ? 'ready' : 'idle',
      isCached: modelReadyRef.current,
    });
  }, [rejectPending]);

  useEffect(() => () => {
    currentRequestRef.current = null;
    rejectPending('Yêu cầu phân tích đã bị hủy.');
    workerRef.current?.terminate();
    workerRef.current = null;
  }, [rejectPending]);

  return {
    ...state,
    analyze,
    analyzeAsync,
    retry,
    reset,
  };
}
