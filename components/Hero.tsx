"use client";

import { motion } from "framer-motion";
import { Download, Apple, ChevronDown } from "lucide-react";
import { TerminalMockup } from "./TerminalMockup";
import { useOSDetect } from "@/lib/useOSDetect";

function WindowsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

export function Hero() {
  const os = useOSDetect();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12 overflow-hidden">
      {/* Background gradient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: "#4a9eff" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ background: "#22c55e" }}
      />

      {/* Dot grid background */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroDots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1" fill="#8888aa" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroDots)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mb-12">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-medium text-accent">Free for Windows & macOS</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-bold tracking-tight text-text-primary mb-6"
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
            className="group inline-flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_30px_rgba(74,158,255,0.3)] cursor-pointer"
          >
            {os === "mac" ? <Apple size={18} /> : <WindowsIcon size={16} />}
            Download for {os === "mac" ? "macOS" : "Windows"}
            <Download size={16} className="opacity-60 group-hover:translate-y-0.5 transition-transform" />
          </a>

          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card/50 px-7 py-3.5 text-base font-medium text-text-secondary transition-all duration-200 hover:text-text-primary hover:border-accent/40 cursor-pointer"
          >
            See Features
          </a>
        </motion.div>
      </div>

      {/* Animated terminal mockup */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-4"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        <TerminalMockup />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
