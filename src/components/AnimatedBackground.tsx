import { useEffect, useRef } from 'react';

/**
 * Animated canvas background with floating organic shapes.
 * Renders a warm gradient with gently drifting translucent blobs.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationId = 0;

    const colors = [
      'rgba(34, 197, 94, 0.18)',
      'rgba(16, 185, 129, 0.15)',
      'rgba(251, 191, 36, 0.12)',
      'rgba(245, 158, 11, 0.10)',
      'rgba(132, 204, 22, 0.14)',
    ];

    type Blob = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
    };

    const blobs: Blob[] = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 180 + Math.random() * 200,
      color: colors[i % colors.length],
    }));

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const draw = () => {
      // Base gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(0.5, '#f1f5f9');
      grad.addColorStop(1, '#ecfdf5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Blobs
      for (const b of blobs) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;

        const radial = ctx.createRadialGradient(
          b.x,
          b.y,
          0,
          b.x,
          b.y,
          b.r
        );
        radial.addColorStop(0, b.color);
        radial.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
