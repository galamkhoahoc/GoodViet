import { useState, useRef, useCallback, useEffect } from 'react';
import { config } from '../config/env';

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  hasPermission: boolean | null; // null = not asked
  error: string | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
  analyserNode: AnalyserNode | null;
}

export interface UseAudioRecorderReturn extends AudioRecorderState {
  requestPermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  resetRecording: () => void;
}

export function useAudioRecorder(options?: {
  maxDuration?: number;
  minDuration?: number;
  onComplete?: (blob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
}): UseAudioRecorderReturn {
  const {
    maxDuration = config.audio.maxDurationSeconds,
    minDuration = 0,
    onComplete,
    onError,
  } = options || {};

  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    hasPermission: null,
    error: null,
    audioBlob: null,
    audioUrl: null,
    analyserNode: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const getSupportedMimeType = useCallback((): string => {
    const types = [
      config.audio.preferredMimeType,
      config.audio.fallbackMimeType,
      'audio/ogg;codecs=opus',
      'audio/wav',
      '',
    ];
    for (const type of types) {
      if (type === '' || MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.audio.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      // Stop tracks immediately - we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, hasPermission: true, error: null }));
      return true;
    } catch (err) {
      const errorMsg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Quyền truy cập microphone bị từ chối. Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt.'
        : 'Không thể truy cập microphone. Vui lòng kiểm tra thiết bị ghi âm.';
      setState(prev => ({ ...prev, hasPermission: false, error: errorMsg }));
      onError?.(new Error(errorMsg));
      return false;
    }
  }, [onError]);

  const startRecording = useCallback(async () => {
    try {
      // Clean up previous recording
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.audio.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Set up audio analyser for waveform visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = getSupportedMimeType();
      const recorderOptions: MediaRecorderOptions = {
        ...(mimeType ? { mimeType } : {}),
      };

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        setState(prev => ({
          ...prev,
          isRecording: false,
          audioBlob: blob,
          audioUrl: url,
          duration: finalDuration,
          analyserNode: null,
        }));

        onComplete?.(blob, finalDuration);

        // Cleanup stream and audio context
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      mediaRecorder.onerror = () => {
        const errorMsg = 'Lỗi trong quá trình ghi âm. Vui lòng thử lại.';
        setState(prev => ({ ...prev, isRecording: false, error: errorMsg, analyserNode: null }));
        onError?.(new Error(errorMsg));
        cleanup();
      };

      // Start recording
      mediaRecorder.start(250); // Collect data every 250ms
      startTimeRef.current = Date.now();

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        hasPermission: true,
        error: null,
        audioBlob: null,
        audioUrl: null,
        analyserNode: analyser,
      }));

      // Timer for duration tracking
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration: elapsed }));

        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }, 200);

    } catch (err) {
      const errorMsg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Quyền truy cập microphone bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.'
        : 'Không thể bắt đầu ghi âm. Vui lòng kiểm tra microphone.';
      setState(prev => ({ ...prev, hasPermission: false, error: errorMsg }));
      onError?.(new Error(errorMsg));
    }
  }, [state.audioUrl, maxDuration, onComplete, onError, getSupportedMimeType, cleanup]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (minDuration > 0 && elapsed < minDuration) {
      setState(prev => ({
        ...prev,
        error: `Vui lòng ghi âm ít nhất ${Math.floor(minDuration / 60)} phút ${minDuration % 60} giây.`,
      }));
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [minDuration]);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
      analyserNode: null,
    }));
  }, [cleanup]);

  const resetRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState(prev => ({
      ...prev,
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null,
    }));
  }, [state.audioUrl]);

  return {
    ...state,
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  };
}
