"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// A decorative element that floats alongside scrolling — like a leaf drifting through the page
export function ScrollFloat() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Element drifts across the page as user scrolls
  const y = useTransform(scrollYProgress, [0, 1], [0, -800]);
  const x = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [20, 60, -30, 50, 10]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0, 0.25, 0.25, 0]);

  return (
    <div ref={ref} className="fixed top-[90vh] right-[8%] z-[5] pointer-events-none hidden lg:block">
      <motion.div style={{ y, x, rotate, opacity }}>
        {/* Abstract geometric shape — terminal bracket morphing */}
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="32" height="32" rx="8" stroke="#4a9eff" strokeWidth="1" fill="none" opacity="0.4" />
          <rect x="10" y="10" width="20" height="20" rx="4" stroke="#22c55e" strokeWidth="0.8" fill="none" opacity="0.3" />
          <circle cx="20" cy="20" r="3" fill="#4a9eff" opacity="0.2" />
        </svg>
      </motion.div>

      {/* Second element — offset, different timing */}
      <motion.div
        style={{
          y: useTransform(scrollYProgress, [0, 1], [100, -600]),
          x: useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [-40, 20, -20, 30]),
          rotate: useTransform(scrollYProgress, [0, 1], [45, -180]),
          opacity: useTransform(scrollYProgress, [0, 0.1, 0.85, 1], [0, 0.2, 0.2, 0]),
        }}
        className="absolute top-20 -left-16"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8L12 4L20 8V16L12 20L4 16V8Z" stroke="#4a9eff" strokeWidth="0.8" fill="none" opacity="0.3" />
        </svg>
      </motion.div>
    </div>
  );
}
