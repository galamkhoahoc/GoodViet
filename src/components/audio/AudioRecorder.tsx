import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { WaveformVisualizer } from './WaveformVisualizer';
import { AudioPlayer } from './AudioPlayer';
import { Mic, Square, RotateCcw, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
  maxDuration?: number;
  minDuration?: number;
  showPlayback?: boolean;
  compact?: boolean;
}

export function AudioRecorder({
  onRecordingComplete,
  onError,
  maxDuration = 300,
  minDuration = 0,
  showPlayback = true,
  compact = false,
}: AudioRecorderProps) {
  const {
    isRecording,
    duration,
    hasPermission,
    error,
    audioBlob,
    audioUrl,
    analyserNode,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useAudioRecorder({
    maxDuration,
    minDuration,
    onComplete: onRecordingComplete,
    onError,
  });

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className="recorder" style={{ textAlign: 'center' }}>
        <div style={{
          padding: 'var(--md-sys-space-lg)',
          background: 'var(--md-sys-color-error-soft, rgba(231,76,60,0.08))',
          borderRadius: 'var(--md-sys-shape-corner-medium)',
          border: '1px solid var(--md-sys-color-error, var(--md-sys-color-error))',
          marginBottom: 'var(--md-sys-space-md)',
        }}>
          <AlertCircle size={32} style={{ color: 'var(--md-sys-color-error)', marginBottom: 8 }} />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Không thể truy cập microphone</p>
          <p style={{ fontSize: 'var(--md-sys-typescale-body-small-size)', color: 'var(--md-sys-color-on-surface-muted)' }}>
            Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt, sau đó tải lại trang.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
          <RotateCcw size={14} /> Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="recorder" style={{ textAlign: 'center' }}>
      {/* Error display */}
      {error && !isRecording && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--md-sys-color-error-soft, rgba(231,76,60,0.08))',
          borderRadius: 'var(--md-sys-shape-corner-medium)',
          border: '1px solid var(--md-sys-color-error, var(--md-sys-color-error))',
          marginBottom: 'var(--md-sys-space-md)',
          fontSize: 'var(--md-sys-typescale-body-small-size)',
          color: 'var(--md-sys-color-error, var(--md-sys-color-error))',
        }}>
          {error}
        </div>
      )}

      {/* Recording controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--md-sys-space-md)' }}>
        <button
          className={`recorder-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
          style={{
            width: compact ? 56 : 72,
            height: compact ? 56 : 72,
            borderRadius: '50%',
            border: `3px solid ${isRecording ? 'var(--md-sys-color-error, var(--md-sys-color-error))' : 'var(--md-sys-color-on-surface, #191A23)'}`,
            background: isRecording ? 'rgba(231,76,60,0.08)' : 'var(--md-sys-color-primary, var(--md-sys-color-primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isRecording ? '0 0 0 6px rgba(231,76,60,0.15)' : '0 4px 0 0 var(--md-sys-color-on-surface, #191A23)',
            animation: isRecording ? 'pulse-recording 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {isRecording
            ? <Square size={compact ? 22 : 28} color="var(--md-sys-color-error)" />
            : <Mic size={compact ? 22 : 28} color="#191A23" />
          }
        </button>

        {/* Timer */}
        <div style={{
          fontFamily: 'monospace',
          fontSize: compact ? 'var(--md-sys-typescale-title-small-size)' : 'var(--md-sys-typescale-title-medium-size)',
          fontWeight: 700,
          color: isRecording ? 'var(--md-sys-color-error, var(--md-sys-color-error))' : 'var(--md-sys-color-on-surface)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatTime(duration)}
          {maxDuration < Infinity && (
            <span style={{ fontSize: 'var(--md-sys-typescale-body-small-size)', color: 'var(--md-sys-color-on-surface-muted)', fontWeight: 400, marginLeft: 4 }}>
              / {formatTime(maxDuration)}
            </span>
          )}
        </div>

        {/* Waveform */}
        {isRecording && (
          <WaveformVisualizer
            analyserNode={analyserNode}
            isActive={isRecording}
            width={compact ? 160 : 240}
            height={compact ? 36 : 48}
            barColor="var(--md-sys-color-primary, var(--md-sys-color-primary))"
            barCount={compact ? 16 : 24}
          />
        )}

        {/* Status text */}
        <p style={{
          fontSize: 'var(--md-sys-typescale-body-small-size)',
          color: 'var(--md-sys-color-on-surface-muted)',
          margin: 0,
        }}>
          {isRecording
            ? 'Đang ghi âm... Nhấn ■ để dừng'
            : audioBlob
              ? 'Ghi âm hoàn tất! Bạn có thể nghe lại hoặc ghi lại.'
              : 'Nhấn 🎙️ để bắt đầu ghi âm'}
        </p>

        {/* Cancel button during recording */}
        {isRecording && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={cancelRecording}
            style={{ color: 'var(--md-sys-color-on-surface-muted)' }}
          >
            Hủy ghi âm
          </button>
        )}
      </div>

      {/* Playback after recording */}
      {showPlayback && audioUrl && !isRecording && (
        <div style={{ marginTop: 'var(--md-sys-space-lg)' }}>
          <AudioPlayer src={audioUrl} label="Bản ghi âm của bạn" compact={compact} />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              resetRecording();
            }}
            style={{ marginTop: 'var(--md-sys-space-sm)' }}
          >
            <RotateCcw size={14} /> Ghi lại
          </button>
        </div>
      )}
    </div>
  );
}
