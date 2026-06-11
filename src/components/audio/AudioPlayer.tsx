import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  src: string | null; // blob URL or remote URL
  label?: string;
  compact?: boolean;
  onPlaybackEnd?: () => void;
}

export function AudioPlayer({ src, label, compact = false, onPlaybackEnd }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset when src changes
    setIsPlaying(false);
    setCurrentTime(0);
    setTotalDuration(0);
    setIsLoaded(false);
  }, [src]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration);
      setIsLoaded(true);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    onPlaybackEnd?.();
  }, [onPlaybackEnd]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !src) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, src]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  if (!src) return null;

  return (
    <div className={`audio-player ${compact ? 'audio-player-compact' : ''}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--md-sys-space-sm, 8px)',
      padding: compact ? '8px 12px' : '12px 16px',
      background: 'var(--md-sys-color-surface-container, #F3F3F3)',
      borderRadius: 'var(--md-sys-shape-corner-medium, 14px)',
      border: '2px solid var(--md-sys-color-outline, #E0E1E6)',
    }}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />

      <button
        onClick={togglePlay}
        disabled={!isLoaded}
        style={{
          width: compact ? 32 : 40,
          height: compact ? 32 : 40,
          borderRadius: '50%',
          border: '2px solid var(--md-sys-color-on-surface, #191A23)',
          background: isPlaying ? 'var(--md-sys-color-on-surface, #191A23)' : 'var(--md-sys-color-primary, var(--md-sys-color-primary))',
          color: isPlaying ? 'var(--md-sys-color-primary, var(--md-sys-color-primary))' : 'var(--md-sys-color-on-surface, #191A23)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
        aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
      >
        {isPlaying ? <Pause size={compact ? 14 : 18} /> : <Play size={compact ? 14 : 18} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        {label && !compact && (
          <div style={{
            fontSize: 'var(--md-sys-typescale-label-small-size, 12px)',
            color: 'var(--md-sys-color-on-surface-muted, #6B6C7A)',
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {label}
          </div>
        )}
        <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'var(--md-sys-color-outline, #E0E1E6)', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'var(--md-sys-color-on-surface, #191A23)',
            borderRadius: 2,
            transition: 'width 0.1s linear',
          }} />
          <input
            type="range"
            min={0}
            max={totalDuration || 0}
            value={currentTime}
            onChange={handleSeek}
            step={0.1}
            style={{
              position: 'absolute',
              top: -6,
              left: 0,
              width: '100%',
              height: 16,
              opacity: 0,
              cursor: 'pointer',
              margin: 0,
            }}
            aria-label="Tua audio"
          />
        </div>
      </div>

      <span style={{
        fontSize: 'var(--md-sys-typescale-label-small-size, 12px)',
        color: 'var(--md-sys-color-on-surface-muted, #6B6C7A)',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
        minWidth: compact ? 70 : 80,
        textAlign: 'right',
      }}>
        {formatTime(currentTime)} / {formatTime(totalDuration)}
      </span>
    </div>
  );
}
