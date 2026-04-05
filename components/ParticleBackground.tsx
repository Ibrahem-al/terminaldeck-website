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
    const count = Math.min(80, Math.floor((width * height) / 12000));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 1,
    }));

    blobsRef.current = [
      { x: width * 0.25, y: height * 0.3, radius: width * 0.4, color: "rgba(74,158,255,0.12)", vx: 0.2, vy: 0.12, phase: 0 },
      { x: width * 0.75, y: height * 0.6, radius: width * 0.35, color: "rgba(34,197,94,0.08)", vx: -0.15, vy: 0.18, phase: 2 },
      { x: width * 0.5, y: height * 0.8, radius: width * 0.3, color: "rgba(74,158,255,0.10)", vx: 0.1, vy: -0.2, phase: 4 },
    ];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init(rect.width, rect.height);
    };

    // Defer first resize to ensure layout is done
    requestAnimationFrame(() => {
      resize();

      // Draw static blobs once for reduced-motion users
      if (prefersReduced) {
        const w = canvas.width / Math.min(window.devicePixelRatio, 2);
        const h = canvas.height / Math.min(window.devicePixelRatio, 2);
        ctx.clearRect(0, 0, w, h);
        for (const blob of blobsRef.current) {
          const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
          grad.addColorStop(0, blob.color);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
        return;
      }

      // Start animation loop
      draw();
    });

    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Mouse tracking on parent (canvas has pointer-events: none)
    const parent = canvas.parentElement;
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
    parent?.addEventListener("mousemove", onMouse);
    parent?.addEventListener("mouseleave", onLeave);

    let time = 0;

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      if (!visibleRef.current) return;

      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = canvas!.width / dpr;
      const h = canvas!.height / dpr;
      if (w === 0 || h === 0) return;
      time += 0.005;

      ctx!.clearRect(0, 0, w, h);

      // Gradient blobs
      for (const blob of blobsRef.current) {
        blob.x += blob.vx;
        blob.y += blob.vy;
        if (blob.x < -blob.radius * 0.3 || blob.x > w + blob.radius * 0.3) blob.vx *= -1;
        if (blob.y < -blob.radius * 0.3 || blob.y > h + blob.radius * 0.3) blob.vy *= -1;

        const pulse = Math.sin(time + blob.phase) * 0.15 + 1;
        const grad = ctx!.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius * pulse);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, "transparent");
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, w, h);
      }

      // Particles
      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const connectDist = 130;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const distMouse = Math.sqrt(dmx * dmx + dmy * dmy);
        if (distMouse < 160) {
          const force = (160 - distMouse) / 160 * 1.0;
          p.vx += (dmx / distMouse) * force;
          p.vy += (dmy / distMouse) * force;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw particle
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(136,136,170,0.5)";
        ctx!.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDist) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(p2.x, p2.y);
            ctx!.strokeStyle = `rgba(74,158,255,${0.2 * (1 - dist / connectDist)})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
          }
        }
      }
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      parent?.removeEventListener("mousemove", onMouse);
      parent?.removeEventListener("mouseleave", onLeave);
      observer.disconnect();
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1, pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
