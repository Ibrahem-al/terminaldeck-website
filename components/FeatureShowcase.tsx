"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Layers,
  Activity,
  Magnet,
  FolderKanban,
  Maximize2,
  AppWindow,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";

const FEATURE_ICONS = [Layers, Activity, Magnet, FolderKanban, Maximize2, AppWindow];

function CanvasStage({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        aspectRatio: "16/10",
        background: "#0a0a16",
        border: "1px solid #2a2a44",
        boxShadow: "0 20px 50px -12px rgba(0,0,0,0.5)",
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="showcaseDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="#2a2a44" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#showcaseDots)" />
      </svg>

      {/* Panel 1 */}
      <motion.div
        className="absolute rounded-lg overflow-hidden"
        style={{
          width: "28%", height: "35%", left: "5%", top: "12%",
          background: "#1a1a2e",
          border: "1px solid #2a2a44",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        animate={{
          opacity: activeIndex >= 0 ? 1 : 0,
          scale: activeIndex >= 0 ? 1 : 0.8,
          borderColor: activeIndex >= 3 ? "#4a9eff88" : "#2a2a44",
          filter: activeIndex === 4 ? "blur(2px) brightness(0.4)" : "none",
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1" style={{ background: "#0f0f1a", borderBottom: "1px solid #2a2a44" }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            animate={{
              backgroundColor: activeIndex >= 1
                ? ["#3a3a55", "#4a9eff", "#22c55e", "#eab308"][Math.min(activeIndex, 3)]
                : "#3a3a55",
              boxShadow: activeIndex >= 1 ? "0 0 4px rgba(74,158,255,0.5)" : "none",
            }}
            transition={{ duration: 0.5 }}
          />
          <span className="text-[8px] font-mono text-text-secondary/60">api-server</span>
        </div>
        <div className="p-1.5 space-y-0.5">
          <div className="h-1 rounded-full w-3/4" style={{ background: "#4a9eff44" }} />
          <div className="h-1 rounded-full w-1/2" style={{ background: "#22c55e44" }} />
          <div className="h-1 rounded-full w-5/6" style={{ background: "#8888aa33" }} />
        </div>
      </motion.div>

      {/* Panel 2 */}
      <motion.div
        className="absolute rounded-lg overflow-hidden"
        style={{
          width: "30%", height: "35%", left: "36%", top: "12%",
          background: "#1a1a2e",
          border: "1px solid #2a2a44",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        animate={{
          opacity: activeIndex >= 0 ? 1 : 0,
          scale: activeIndex >= 0 ? 1 : 0.8,
          borderColor: activeIndex >= 3 ? "#eab30888" : "#2a2a44",
          filter: activeIndex === 4 ? "blur(2px) brightness(0.4)" : "none",
          ...(activeIndex === 4
            ? { left: "5%", top: "5%", width: "90%", height: "90%", zIndex: 20 }
            : { left: "36%", top: "12%", width: "30%", height: "35%", zIndex: 1 }),
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1" style={{ background: "#0f0f1a", borderBottom: "1px solid #2a2a44" }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            animate={{
              backgroundColor: activeIndex >= 1
                ? ["#3a3a55", "#eab308", "#4a9eff", "#22c55e"][Math.min(activeIndex, 3)]
                : "#3a3a55",
            }}
            transition={{ duration: 0.5 }}
          />
          <span className="text-[8px] font-mono text-text-secondary/60">claude</span>
        </div>
        <div className="p-1.5 space-y-0.5">
          <div className="h-1 rounded-full w-2/3" style={{ background: "#eab30844" }} />
          <div className="h-1 rounded-full w-4/5" style={{ background: "#8888aa33" }} />
          <div className="h-1 rounded-full w-1/2" style={{ background: "#eab30833" }} />
        </div>
      </motion.div>

      {/* Panel 3 */}
      <motion.div
        className="absolute rounded-lg overflow-hidden"
        style={{
          width: "27%", height: "35%", left: "69%", top: "12%",
          background: "#1a1a2e",
          border: "1px solid #2a2a44",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        animate={{
          opacity: activeIndex >= 0 ? 1 : 0,
          scale: activeIndex >= 0 ? 1 : 0.8,
          borderColor: activeIndex >= 3 ? "#4a9eff88" : "#2a2a44",
          filter: activeIndex === 4 ? "blur(2px) brightness(0.4)" : "none",
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1" style={{ background: "#0f0f1a", borderBottom: "1px solid #2a2a44" }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            animate={{ backgroundColor: activeIndex >= 1 ? "#22c55e" : "#3a3a55" }}
            transition={{ duration: 0.5 }}
          />
          <span className="text-[8px] font-mono text-text-secondary/60">tests</span>
        </div>
        <div className="p-1.5 space-y-0.5">
          <div className="h-1 rounded-full w-4/5" style={{ background: "#22c55e44" }} />
          <div className="h-1 rounded-full w-3/5" style={{ background: "#22c55e33" }} />
          <div className="h-1 rounded-full w-full" style={{ background: "#8888aa22" }} />
        </div>
      </motion.div>

      {/* Panel 4 - bottom left */}
      <motion.div
        className="absolute rounded-lg overflow-hidden"
        style={{
          width: "32%", height: "35%", left: "5%", top: "55%",
          background: "#1a1a2e",
          border: "1px solid #2a2a44",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        animate={{
          opacity: activeIndex >= 0 ? 1 : 0,
          scale: activeIndex >= 0 ? 1 : 0.8,
          borderColor: activeIndex >= 3 ? "#22c55e88" : "#2a2a44",
          filter: activeIndex === 4 ? "blur(2px) brightness(0.4)" : "none",
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1" style={{ background: "#0f0f1a", borderBottom: "1px solid #2a2a44" }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            animate={{ backgroundColor: activeIndex >= 1 ? "#4a9eff" : "#3a3a55" }}
            transition={{ duration: 0.5 }}
          />
          <span className="text-[8px] font-mono text-text-secondary/60">dev-server</span>
        </div>
        <div className="p-1.5 space-y-0.5">
          <div className="h-1 rounded-full w-3/4" style={{ background: "#4a9eff44" }} />
          <div className="h-1 rounded-full w-1/2" style={{ background: "#8888aa33" }} />
        </div>
      </motion.div>

      {/* Embedded panel (VS Code) - appears at stage 5 */}
      <motion.div
        className="absolute rounded-lg overflow-hidden"
        style={{
          width: "32%", height: "35%", right: "5%", top: "55%",
          background: "#1e1e2e",
          border: "1px solid #2a2a44",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        animate={{
          opacity: activeIndex >= 5 ? 1 : 0,
          x: activeIndex >= 5 ? 0 : 60,
          scale: activeIndex >= 5 ? 1 : 0.9,
          filter: activeIndex === 4 ? "blur(2px) brightness(0.4)" : "none",
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1" style={{ background: "#16162a", borderBottom: "1px solid #2a2a44" }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="#4a9eff">
            <path d="M14.5 1L11 3.5L6 1L1.5 3.5V14.5L6 12L11 14.5L14.5 12V1Z" strokeWidth="0" />
          </svg>
          <span className="text-[8px] font-mono text-text-secondary/60">VS Code — main.ts</span>
        </div>
        <div className="p-1.5 space-y-0.5">
          <div className="flex gap-1">
            <div className="h-1 w-3 rounded-full" style={{ background: "#c586c044" }} />
            <div className="h-1 w-6 rounded-full" style={{ background: "#4ec9b044" }} />
          </div>
          <div className="h-1 rounded-full w-4/5" style={{ background: "#8888aa22" }} />
          <div className="h-1 rounded-full w-3/5 ml-3" style={{ background: "#dcdcaa44" }} />
          <div className="h-1 rounded-full w-2/3 ml-3" style={{ background: "#8888aa22" }} />
        </div>
      </motion.div>

      {/* Snap guide lines - appear at stage 2 */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ inset: 0 }}
        animate={{ opacity: activeIndex === 2 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="35" y1="5" x2="35" y2="95" stroke="#4a9eff" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="67" y1="5" x2="67" y2="95" stroke="#4a9eff" strokeWidth="0.3" strokeDasharray="1 1" />
          <line x1="3" y1="50" x2="97" y2="50" stroke="#4a9eff" strokeWidth="0.3" strokeDasharray="1 1" />
        </svg>
      </motion.div>

      {/* Focus mode dimming overlay - stage 4 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(10,10,22,0.6)" }}
        animate={{ opacity: activeIndex === 4 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

export function FeatureShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const isInView = useInView(sectionRef, { margin: "-20%" });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const scrolledInSection = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledInSection / (sectionHeight - window.innerHeight)));
      const featureIndex = Math.min(5, Math.floor(progress * 6));
      setActiveFeature(featureIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative"
      style={{ minHeight: "300vh" }}
    >
      <div className="sticky top-0 min-h-screen flex items-center py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
          {/* Section header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="font-bold tracking-tight text-text-primary mb-3"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              Everything you need,{" "}
              <span className="text-accent">nothing you don&apos;t.</span>
            </h2>
            <p className="text-text-secondary text-base max-w-xl mx-auto">
              Built from the ground up for developers managing complex workflows
              across multiple terminals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Feature list — compact */}
            <div className="space-y-1">
              {FEATURES.map((feature, i) => {
                const Icon = FEATURE_ICONS[i];
                const isActive = activeFeature === i;

                return (
                  <motion.div
                    key={feature.id}
                    className="relative rounded-lg px-4 py-3 transition-all duration-300 cursor-default"
                    style={{
                      background: isActive ? "#16162a" : "transparent",
                      border: isActive ? "1px solid #2a2a44" : "1px solid transparent",
                    }}
                    animate={{
                      x: isActive ? 0 : -4,
                      opacity: isActive ? 1 : 0.45,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-accent"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center gap-3">
                      <div
                        className="shrink-0 p-1.5 rounded-md"
                        style={{
                          background: isActive ? "#4a9eff15" : "#16162a",
                          border: `1px solid ${isActive ? "#4a9eff33" : "#2a2a44"}`,
                        }}
                      >
                        <Icon size={15} className={isActive ? "text-accent" : "text-text-secondary"} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-semibold leading-tight ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                          {feature.title}
                        </h3>
                        {isActive && (
                          <motion.p
                            className="text-xs text-text-secondary leading-snug mt-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.2 }}
                          >
                            {feature.detail}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right: Animated canvas */}
            <div className="hidden lg:block">
              <CanvasStage activeIndex={activeFeature} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex items-center gap-1.5">
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{
                    background: i <= activeFeature ? "#4a9eff" : "#2a2a44",
                    boxShadow: i === activeFeature ? "0 0 6px rgba(74,158,255,0.4)" : "none",
                  }}
                />
              ))}
            </div>
            <p className="text-center text-[10px] text-text-secondary/50 mt-2 font-mono">
              Scroll to explore {activeFeature + 1}/{FEATURES.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
