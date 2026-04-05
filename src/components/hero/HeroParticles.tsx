import React, { useRef, useEffect, useCallback } from 'react';

interface Props {
  scrollProgress: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  speedX: number;
  speedY: number;
  shimmerOffset: number;
  shimmerSpeed: number;
}

const PARTICLE_COUNT = 6000;
const FLOW_SPEED = 0.08;
const COLORS = ['#4a9eff', '#00d4ff'];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const HeroParticles: React.FC<Props> = ({ scrollProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animIdRef = useRef<number>(0);
  const scrollRef = useRef(scrollProgress);

  // Keep scroll progress in a ref so the animation loop sees the latest value
  // without needing to be recreated.
  scrollRef.current = scrollProgress;

  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 2,
        baseAlpha: 0.1 + Math.random() * 0.7,
        alpha: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speedX: (Math.random() - 0.5) * FLOW_SPEED,
        speedY: (Math.random() - 0.5) * FLOW_SPEED,
        shimmerOffset: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.005 + Math.random() * 0.015,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    // Only render on desktop/tablet
    if (window.innerWidth < 769) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Recreate particles to fill the new dimensions
      particlesRef.current = createParticles(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const animate = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) {
        animIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const w = rect.width;
      const h = rect.height;
      const progress = scrollRef.current;

      // Fade out based on scroll
      const globalAlpha = 1 - progress;

      // Expanding scale factor
      const scale = 1 + progress * 0.5;

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, globalAlpha);

      time += 1;

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.speedX * scale;
        p.y += p.speedY * scale;

        // Wrap around edges
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;

        // Shimmer: subtle alpha oscillation
        p.alpha = p.baseAlpha + Math.sin(time * p.shimmerSpeed + p.shimmerOffset) * 0.15;
        p.alpha = Math.max(0.05, Math.min(1, p.alpha));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, lerp(p.alpha, 0, progress));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animIdRef.current = requestAnimationFrame(animate);
    };

    animIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
};
