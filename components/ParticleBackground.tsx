"use client";

import { useEffect, useRef } from "react";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // State
    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    let blobs = [
      { x: 0, y: 0, r: 0, color: "rgba(74,158,255,0.13)", vx: 0.2, vy: 0.12, phase: 0 },
      { x: 0, y: 0, r: 0, color: "rgba(34,197,94,0.09)", vx: -0.15, vy: 0.18, phase: 2 },
      { x: 0, y: 0, r: 0, color: "rgba(74,158,255,0.11)", vx: 0.1, vy: -0.2, phase: 4 },
    ];
    let visible = true;
    let time = 0;

    function initParticles(w: number, h: number) {
      const count = Math.min(80, Math.floor((w * h) / 12000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 1,
      }));
      blobs[0].x = w * 0.25; blobs[0].y = h * 0.3; blobs[0].r = w * 0.4;
      blobs[1].x = w * 0.75; blobs[1].y = h * 0.6; blobs[1].r = w * 0.35;
      blobs[2].x = w * 0.5;  blobs[2].y = h * 0.8; blobs[2].r = w * 0.3;
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      initParticles(w, h);
    }

    // Use ResizeObserver for robust sizing
    const parent = canvas.parentElement;
    const ro = new ResizeObserver(() => resize());
    if (parent) ro.observe(parent);
    resize();

    // Visibility
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    // Mouse — listen on parent
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };
    parent?.addEventListener("mousemove", onMove);
    parent?.addEventListener("mouseleave", onLeave);

    // Static fallback for reduced motion
    if (prefersReduced) {
      requestAnimationFrame(() => {
        const { w, h } = sizeRef.current;
        if (w === 0) return;
        ctx.clearRect(0, 0, w, h);
        for (const b of blobs) {
          const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          g.addColorStop(0, b.color);
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
      });
      return () => { ro.disconnect(); io.disconnect(); parent?.removeEventListener("mousemove", onMove); parent?.removeEventListener("mouseleave", onLeave); };
    }

    // Animation loop
    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (!visible) return;
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) return;
      time += 0.005;
      ctx.clearRect(0, 0, w, h);

      // Blobs
      for (const b of blobs) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r * 0.3 || b.x > w + b.r * 0.3) b.vx *= -1;
        if (b.y < -b.r * 0.3 || b.y > h + b.r * 0.3) b.vy *= -1;
        const pulse = Math.sin(time + b.phase) * 0.15 + 1;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
        g.addColorStop(0, b.color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Particles
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const dm = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dm < 160) {
          const f = (160 - dm) / 160;
          p.vx += (dmx / dm) * f;
          p.vy += (dmy / dm) * f;
        }
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(136,136,170,0.5)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(74,158,255,${0.2 * (1 - d / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ zIndex: 1, pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
