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
  const lastFileRef = useRef<File | null>(null);
  const modelReadyRef = useRef(false);

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
      currentRequestRef.current = null;
      modelReadyRef.current = true;
      setState(previous => ({
        ...previous,
        status: 'complete',
        progress: 1,
        result: message.result,
        error: null,
      }));
      return;
    }

    currentRequestRef.current = null;
    setState(previous => ({
      ...previous,
      status: message.code === 'MISSING_ARTIFACTS' ? 'missing-artifacts' : 'error',
      progress: 0,
      result: null,
      error: message.message,
    }));
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
  }, [handleWorkerMessage]);

  const analyze = useCallback(async (file: File) => {
    lastFileRef.current = file;
    const requestId = createRequestId();
    currentRequestRef.current = requestId;
    setState(previous => ({
      ...previous,
      status: 'checking',
      progress: 0,
      result: null,
      error: null,
    }));

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
      currentRequestRef.current = null;
      setState(previous => ({
        ...previous,
        status: 'error',
        progress: 0,
        result: null,
        error: error instanceof Error ? error.message : 'Không thể chuẩn bị tệp âm thanh để phân tích.',
      }));
    }
  }, [ensureWorker]);

  const retry = useCallback(async () => {
    if (lastFileRef.current) await analyze(lastFileRef.current);
  }, [analyze]);

  const reset = useCallback(() => {
    currentRequestRef.current = null;
    lastFileRef.current = null;
    setState({
      ...INITIAL_STATE,
      status: modelReadyRef.current ? 'ready' : 'idle',
      isCached: modelReadyRef.current,
    });
  }, []);

  useEffect(() => () => {
    currentRequestRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return {
    ...state,
    analyze,
    retry,
    reset,
  };
}
