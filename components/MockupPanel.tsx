"use client";

import { motion, type Variants } from "framer-motion";

interface MockupPanelProps {
  title: string;
  indicatorColor?: string;
  lines: { text: string; color?: string; indent?: number }[];
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  delay?: number;
  borderColor?: string;
  className?: string;
}

export function MockupPanel({
  title,
  indicatorColor = "#3a3a55",
  lines,
  width = 240,
  height = 140,
  x = 0,
  y = 0,
  delay = 0,
  borderColor = "#2a2a44",
  className = "",
}: MockupPanelProps) {
  const variants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        delay,
      },
    },
  };

  return (
    <motion.div
      className={`absolute rounded-lg overflow-hidden ${className}`}
      style={{
        width,
        height,
        left: x,
        top: y,
        background: "#1a1a2e",
        border: `1px solid ${borderColor}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: "#0f0f1a", borderBottom: "1px solid #2a2a44" }}
      >
        <div
          className="rounded-full"
          style={{
            width: 7,
            height: 7,
            backgroundColor: indicatorColor,
            boxShadow:
              indicatorColor !== "#3a3a55"
                ? `0 0 6px ${indicatorColor}88`
                : "none",
          }}
        />
        <span
          className="text-xs font-mono truncate"
          style={{ color: "#8888aa" }}
        >
          {title}
        </span>
      </div>

      {/* Terminal content */}
      <div className="p-2.5 font-mono text-[10px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} style={{ paddingLeft: (line.indent ?? 0) * 8 }}>
            <span style={{ color: line.color ?? "#8888aa" }}>{line.text}</span>
          </div>
        ))}
        {/* Blinking cursor */}
        <motion.span
          className="inline-block w-[6px] h-[10px] mt-0.5"
          style={{ backgroundColor: "#4a9eff" }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
