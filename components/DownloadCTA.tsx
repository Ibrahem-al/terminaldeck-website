"use client";

import { motion } from "framer-motion";
import { Download, Apple, Monitor, Cpu } from "lucide-react";
import { useOSDetect } from "@/lib/useOSDetect";
import { ScrollReveal } from "./ScrollReveal";

function WindowsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

export function DownloadCTA() {
  const os = useOSDetect();

  return (
    <section id="download" className="relative py-28 px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(74,158,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-8"
            style={{
              borderColor: "rgba(34,197,94,0.3)",
              background: "rgba(34,197,94,0.05)",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs font-mono font-medium text-accent-green">
              Free — No account required
            </span>
          </div>

          <h2
            className="font-display font-bold tracking-tight text-text-primary mb-6"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Ready to see all your terminals?
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Download TerminalDeck and transform how you work with multiple
            terminals. Available for Windows and macOS.
          </p>
        </ScrollReveal>

        {/* Download buttons */}
        <ScrollReveal delay={0.15}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <motion.a
              href="#"
              className="group inline-flex items-center gap-3 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
              style={{
                background: os !== "mac" ? "#4a9eff" : "#16162a",
                border: os !== "mac" ? "none" : "1px solid #2a2a44",
                boxShadow: os !== "mac" ? "0 0 30px rgba(74,158,255,0.2)" : "none",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <WindowsIcon size={18} />
              <span>Download for Windows</span>
              <Download size={16} className="opacity-60 group-hover:translate-y-0.5 transition-transform" />
            </motion.a>

            <motion.a
              href="#"
              className="group inline-flex items-center gap-3 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
              style={{
                background: os === "mac" ? "#4a9eff" : "#16162a",
                border: os === "mac" ? "none" : "1px solid #2a2a44",
                boxShadow: os === "mac" ? "0 0 30px rgba(74,158,255,0.2)" : "none",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Apple size={18} />
              <span>Download for macOS</span>
              <Download size={16} className="opacity-60 group-hover:translate-y-0.5 transition-transform" />
            </motion.a>
          </div>
        </ScrollReveal>

        {/* System requirements */}
        <ScrollReveal delay={0.25}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div
              className="flex items-center gap-3 rounded-lg p-3"
              style={{ background: "#16162a", border: "1px solid #2a2a44" }}
            >
              <Monitor size={16} className="text-text-secondary" />
              <div className="text-left">
                <p className="text-xs font-medium text-text-primary">Windows</p>
                <p className="text-[11px] text-text-secondary">Windows 10 or later</p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 rounded-lg p-3"
              style={{ background: "#16162a", border: "1px solid #2a2a44" }}
            >
              <Apple size={16} className="text-text-secondary" />
              <div className="text-left">
                <p className="text-xs font-medium text-text-primary">macOS</p>
                <p className="text-[11px] text-text-secondary">macOS 12+ (Apple Silicon & Intel)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Cpu size={12} />
              v0.1.0
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>~100 MB</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>No account needed</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
