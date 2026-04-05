"use client";

import { motion } from "framer-motion";
import { Download, Apple, ChevronDown } from "lucide-react";
import { InteractiveCanvas } from "./InteractiveCanvas";
import { ParticleBackground } from "./ParticleBackground";
import { useOSDetect } from "@/lib/useOSDetect";

function WindowsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

const FLOATING_TAGS = [
  { label: "AI-Aware", x: "8%", y: "18%", delay: 0 },
  { label: "Snap Guides", x: "82%", y: "22%", delay: 1.5 },
  { label: "Cross-Platform", x: "5%", y: "72%", delay: 3 },
  { label: "Persistence", x: "88%", y: "68%", delay: 4.5 },
  { label: "Infinite Canvas", x: "14%", y: "45%", delay: 2.2 },
  { label: "Focus Mode", x: "80%", y: "45%", delay: 3.8 },
];

export function Hero() {
  const os = useOSDetect();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12 overflow-hidden">
      {/* Interactive particle background with gradient mesh */}
      <ParticleBackground />

      {/* Floating feature tags */}
      {FLOATING_TAGS.map((tag) => (
        <motion.div
          key={tag.label}
          className="absolute hidden lg:block pointer-events-none select-none"
          style={{ left: tag.x, top: tag.y, zIndex: 2 }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.35, 0.35, 0],
            y: [0, -8, -8, 0],
          }}
          transition={{
            duration: 8,
            delay: tag.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span
            className="px-3 py-1 rounded-full text-[10px] font-mono"
            style={{
              background: "rgba(74,158,255,0.06)",
              border: "1px solid rgba(74,158,255,0.12)",
              color: "rgba(74,158,255,0.6)",
            }}
          >
            {tag.label}
          </span>
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mb-12">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-mono font-semibold text-accent tracking-wide">Free for Windows & macOS</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display font-bold tracking-tight text-text-primary mb-6"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.1 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          See all your terminals{" "}
          <span className="bg-gradient-to-r from-accent to-accent-green bg-clip-text text-transparent">
            at once.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          The spatial workspace for developers who think visually. Arrange, organize,
          and manage multiple terminal sessions on an infinite canvas.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a
            href="#download"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_30px_rgba(74,158,255,0.4)] cursor-pointer"
          >
            {os === "mac" ? <Apple size={18} /> : <WindowsIcon size={16} />}
            Download for {os === "mac" ? "macOS" : "Windows"}
            <Download size={16} className="opacity-60 group-hover:translate-y-0.5 transition-transform" />
          </a>

          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/50 px-7 py-3.5 text-base font-medium text-text-secondary transition-all duration-200 hover:text-text-primary hover:border-accent/40 hover:bg-bg-card cursor-pointer"
          >
            See Features
          </a>
        </motion.div>
      </div>

      {/* Interactive draggable canvas demo with glow border */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-4"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        {/* Animated glow behind the demo */}
        <div
          className="absolute -inset-1 rounded-2xl opacity-60 blur-xl pointer-events-none animate-pulse"
          style={{
            background: "linear-gradient(135deg, rgba(74,158,255,0.15), rgba(34,197,94,0.08), rgba(74,158,255,0.1))",
            animationDuration: "4s",
          }}
        />
        <InteractiveCanvas />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={24} className="text-text-secondary/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
