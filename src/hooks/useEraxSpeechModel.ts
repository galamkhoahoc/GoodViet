import { useCallback, useEffect, useRef, useState } from 'react';
import { prepareVoiceAudio } from '../services/ml/audioPreprocessing';
import type {
  EraxModelStatus,
  EraxTranscriptResult,
  EraxWorkerMessage,
  EraxWorkerRequest,
} from '../services/ml/erax.types';

interface EraxState {
  status: EraxModelStatus;
  progress: number;
  detail: string;
  result: EraxTranscriptResult | null;
  error: string | null;
  isCached: boolean;
}

const INITIAL_STATE: EraxState = {
  status: 'idle',
  progress: 0,
  detail: 'EraX chưa được nạp',
  result: null,
  error: null,
  isCached: false,
};

function createRequestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `erax-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useEraxSpeechModel() {
  const [state, setState] = useState<EraxState>(INITIAL_STATE);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const pendingRef = useRef<{
    resolve: (result: EraxTranscriptResult) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const handleMessage = useCallback((event: MessageEvent<EraxWorkerMessage>) => {
    const message = event.data;
    if (!message || message.requestId !== requestIdRef.current) return;
    if (message.type === 'state') {
      setState(previous => ({
        ...previous,
        status: message.status,
        progress: message.progress,
        detail: message.detail,
        isCached: message.isCached ?? previous.isCached,
        error: null,
      }));
      return;
    }
    if (message.type === 'result') {
      const pending = pendingRef.current;
      pendingRef.current = null;
      requestIdRef.current = null;
      setState(previous => ({ ...previous, status: 'complete', progress: 1, result: message.result, error: null }));
      pending?.resolve(message.result);
      return;
    }
    const pending = pendingRef.current;
    pendingRef.current = null;
    requestIdRef.current = null;
    const error = new Error(message.message);
    setState(previous => ({
      ...previous,
      status: message.code === 'MISSING_BROWSER_MODEL' ? 'missing-artifacts' : 'error',
      progress: 0,
      detail: message.message,
      result: null,
      error: message.message,
    }));
    pending?.reject(error);
  }, []);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(new URL('../workers/erax.worker.ts', import.meta.url), {
      type: 'module',
      name: 'goodviet-erax-local-stt',
    });
    worker.onmessage = handleMessage;
    worker.onerror = () => {
      const error = new Error('Không thể khởi động EraX trên trình duyệt này.');
      pendingRef.current?.reject(error);
      pendingRef.current = null;
      requestIdRef.current = null;
      setState(previous => ({ ...previous, status: 'error', error: error.message, detail: error.message }));
    };
    workerRef.current = worker;
    return worker;
  }, [handleMessage]);

  const transcribeAsync = useCallback(async (file: File): Promise<EraxTranscriptResult> => {
    pendingRef.current?.reject(new Error('Yêu cầu EraX trước đã được thay thế.'));
    const requestId = createRequestId();
    requestIdRef.current = requestId;
    setState(previous => ({ ...previous, status: 'checking', progress: 0, result: null, error: null }));

    return new Promise<EraxTranscriptResult>((resolve, reject) => {
      pendingRef.current = { resolve, reject };
      void (async () => {
        try {
          if (navigator.storage?.persist) void navigator.storage.persist().catch(() => false);
          const prepared = await prepareVoiceAudio(file);
          if (requestIdRef.current !== requestId) return;
          const request: EraxWorkerRequest = { type: 'transcribe', requestId, audio: prepared.samples };
          ensureWorker().postMessage(request, [prepared.samples.buffer as ArrayBuffer]);
        } catch (error) {
          if (requestIdRef.current !== requestId) return;
          const normalized = error instanceof Error ? error : new Error('Không thể chuẩn bị audio cho EraX.');
          pendingRef.current = null;
          requestIdRef.current = null;
          setState(previous => ({ ...previous, status: 'error', progress: 0, error: normalized.message, detail: normalized.message }));
          reject(normalized);
        }
      })();
    });
  }, [ensureWorker]);

  const reset = useCallback(() => {
    pendingRef.current?.reject(new Error('Yêu cầu EraX đã bị hủy.'));
    pendingRef.current = null;
    requestIdRef.current = null;
    setState(previous => ({ ...INITIAL_STATE, status: previous.isCached ? 'ready' : 'idle', isCached: previous.isCached }));
  }, []);

  useEffect(() => () => {
    pendingRef.current?.reject(new Error('Yêu cầu EraX đã bị hủy.'));
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return { ...state, transcribeAsync, reset };
}
