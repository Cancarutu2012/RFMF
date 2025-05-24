import { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  audioContext: AudioContext | null;
  audioSource: MediaElementAudioSourceNode | null;
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  audioContext, 
  audioSource, 
  isPlaying 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioContext || !audioSource) return;
    
    // Create analyzer node if it doesn't exist
    if (!analyzerRef.current) {
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      audioSource.connect(analyzer);
      analyzerRef.current = analyzer;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioContext, audioSource]);

  useEffect(() => {
    if (!canvasRef.current || !analyzerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        // Still render a "standby" visualization when not playing
        renderStandbyVisualization(ctx, canvas);
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw circular visualization
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw sound wave circles
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(142, 45, 226, 0.2)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(74, 0, 224, 0.15)';
      ctx.fill();

      // Draw frequency bars in a circular pattern
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 1.5;
        const angle = (i * 2 * Math.PI) / bufferLength;
        
        const innerRadius = 70;
        const outerRadius = innerRadius + barHeight;
        
        const x1 = centerX + innerRadius * Math.cos(angle);
        const y1 = centerY + innerRadius * Math.sin(angle);
        const x2 = centerX + outerRadius * Math.cos(angle);
        const y2 = centerY + outerRadius * Math.sin(angle);
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(0, 224, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(142, 45, 226, 0.5)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw equalizer bars at the bottom
      const barWidth = 4;
      const barSpacing = 2;
      const barCount = 7;
      const startX = centerX - ((barWidth + barSpacing) * barCount) / 2;
      const barBottomY = centerY + 50;
      
      for (let i = 0; i < barCount; i++) {
        const index = Math.floor(bufferLength / (barCount * 2)) * i;
        const barHeight = Math.max(4, dataArray[index] / 2);
        
        ctx.fillStyle = 'rgba(0, 224, 255, 0.8)';
        ctx.fillRect(
          startX + i * (barWidth + barSpacing),
          barBottomY - barHeight,
          barWidth,
          barHeight
        );
      }
    };

    const renderStandbyVisualization = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() / 1000;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw pulsing circles
      const pulseSize = Math.sin(time) * 5 + 60;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(142, 45, 226, 0.2)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize - 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(74, 0, 224, 0.15)';
      ctx.fill();
      
      // Draw static equalizer bars
      const barWidth = 4;
      const barSpacing = 2;
      const barCount = 7;
      const startX = centerX - ((barWidth + barSpacing) * barCount) / 2;
      const barBottomY = centerY + 50;
      
      for (let i = 0; i < barCount; i++) {
        // Sine wave effect for static visualization
        const barHeight = Math.abs(Math.sin(time + i * 0.5)) * 15 + 5;
        
        ctx.fillStyle = 'rgba(0, 224, 255, 0.8)';
        ctx.fillRect(
          startX + i * (barWidth + barSpacing),
          barBottomY - barHeight,
          barWidth,
          barHeight
        );
      }
    };

    // Resize canvas to match display size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation
    draw();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioContext, audioSource]);

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full absolute top-0 left-0"
      />
      
      {/* Fallback visualization for when canvas isn't supported */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 rounded-full bg-white/5 absolute animate-pulse-slow"></div>
        <div className="w-32 h-32 rounded-full bg-white/10 absolute animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-24 h-24 rounded-full bg-white/15 absolute animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default AudioVisualizer;
