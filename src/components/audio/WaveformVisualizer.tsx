import { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  width?: number;
  height?: number;
  barColor?: string;
  barCount?: number;
}

export function WaveformVisualizer({
  analyserNode,
  isActive,
  width = 200,
  height = 48,
  barColor = '#B9FF66',
  barCount = 24,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!analyserNode || !isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isActive) return;
      animationRef.current = requestAnimationFrame(draw);

      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const gap = 2;
      const effectiveBarWidth = barWidth - gap;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        // Average a range of frequency bins for smoother visualization
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j] || 0;
        }
        const average = sum / step;
        const barHeight = Math.max(3, (average / 255) * canvas.height * 0.9);

        const x = i * barWidth + gap / 2;
        const y = (canvas.height - barHeight) / 2;

        ctx.fillStyle = barColor;
        ctx.beginPath();
        ctx.roundRect(x, y, effectiveBarWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode, isActive, barColor, barCount]);

  if (!isActive) {
    // Show idle bars
    return (
      <div
        className="waveform-idle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          height,
          width,
        }}
      >
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            style={{
              width: Math.max(2, width / barCount - 2),
              height: 3,
              borderRadius: 2,
              background: 'var(--gv-border, #E0E1E6)',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, display: 'block' }}
    />
  );
}
