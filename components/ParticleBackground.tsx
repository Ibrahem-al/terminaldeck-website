"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface GradientBlob {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  phase: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const blobsRef = useRef<GradientBlob[]>([]);
  const visibleRef = useRef(true);

  const init = useCallback((width: number, height: number) => {
    // Particles
    const count = Math.min(70, Math.floor((width * height) / 15000));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
    }));

    // Gradient blobs
    blobsRef.current = [
      { x: width * 0.3, y: height * 0.3, radius: width * 0.35, color: "rgba(74,158,255,0.07)", vx: 0.15, vy: 0.1, phase: 0 },
      { x: width * 0.7, y: height * 0.6, radius: width * 0.3, color: "rgba(34,197,94,0.04)", vx: -0.1, vy: 0.12, phase: 2 },
      { x: width * 0.5, y: height * 0.8, radius: width * 0.25, color: "rgba(74,158,255,0.05)", vx: 0.08, vy: -0.15, phase: 4 },
    ];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Reduced motion check
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      init(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Mouse tracking
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("mouseleave", onLeave);

    let time = 0;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      if (!visibleRef.current) return;

      const w = canvas.width / (Math.min(window.devicePixelRatio, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio, 2));
      time += 0.005;

      ctx.clearRect(0, 0, w, h);

      // Draw gradient blobs
      for (const blob of blobsRef.current) {
        blob.x += blob.vx;
        blob.y += blob.vy;
        // Bounce off edges softly
        if (blob.x < -blob.radius * 0.5 || blob.x > w + blob.radius * 0.5) blob.vx *= -1;
        if (blob.y < -blob.radius * 0.5 || blob.y > h + blob.radius * 0.5) blob.vy *= -1;

        const pulse = Math.sin(time + blob.phase) * 0.15 + 1;
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius * pulse);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw particles
      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const connectDist = 120;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const distMouse = Math.sqrt(dmx * dmx + dmy * dmy);
        if (distMouse < 150) {
          const force = (150 - distMouse) / 150 * 0.8;
          p.vx += (dmx / distMouse) * force;
          p.vy += (dmy / distMouse) * force;
        }

        // Friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(136,136,170,0.35)";
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(74,158,255,${0.12 * (1 - dist / connectDist)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("mouseleave", onLeave);
      observer.disconnect();
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
