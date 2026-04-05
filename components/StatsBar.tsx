"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Monitor, LayoutGrid, Activity } from "lucide-react";

const STATS = [
  { icon: Zap, value: "Free", label: "& Open Source", isText: true },
  { icon: Monitor, value: "2", label: "Platforms", suffix: "", isText: false },
  { icon: LayoutGrid, value: "5", label: "Layout Presets", suffix: "+", isText: false },
  { icon: Activity, value: "4", label: "AI Tools Detected", suffix: "", isText: false },
];

function AnimatedNumber({ value, suffix = "", isText = false }: { value: string; suffix?: string; isText?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(isText ? "" : "0");

  useEffect(() => {
    if (!inView) return;
    if (isText) {
      setDisplay(value);
      return;
    }

    const target = parseInt(value);
    const duration = 1200;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target).toString());
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [inView, value, isText]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}{!isText && suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="relative py-10 px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-4xl rounded-2xl py-6 px-8"
        style={{
          background: "rgba(22,22,42,0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid #2a2a44",
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <div
                className="shrink-0 p-2 rounded-lg"
                style={{ background: "#4a9eff10", border: "1px solid #4a9eff20" }}
              >
                <stat.icon size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-text-primary leading-none mb-0.5">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} isText={stat.isText} />
                </p>
                <p className="text-xs font-mono text-text-secondary">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
