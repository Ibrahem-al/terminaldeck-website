"use client";

import { motion } from "framer-motion";

type LightColor = "gray" | "blue" | "green" | "yellow";

const colorMap: Record<LightColor, { bg: string; glow: string }> = {
  gray: { bg: "#3a3a55", glow: "transparent" },
  blue: { bg: "#4a9eff", glow: "rgba(74,158,255,0.5)" },
  green: { bg: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  yellow: { bg: "#eab308", glow: "rgba(234,179,8,0.5)" },
};

export function IndicatorLight({
  color = "gray",
  size = 8,
  animate = false,
}: {
  color?: LightColor;
  size?: number;
  animate?: boolean;
}) {
  const { bg, glow } = colorMap[color];

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bg,
        boxShadow: color !== "gray" ? `0 0 ${size}px ${glow}` : "none",
      }}
      animate={
        animate && color !== "gray"
          ? { scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }
          : undefined
      }
      transition={
        animate
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    />
  );
}
