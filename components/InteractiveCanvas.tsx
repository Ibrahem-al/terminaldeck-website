"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useAnimationControls } from "framer-motion";

interface PanelData {
  id: string;
  title: string;
  indicatorColor: string;
  lines: { text: string; color: string }[];
  defaultX: number;
  defaultY: number;
  width: number;
  height: number;
}

const SNAP_GRID = 16;
const GUIDE_THRESHOLD = 12;

const PANELS: PanelData[] = [
  {
    id: "api",
    title: "api-server",
    indicatorColor: "#22c55e",
    lines: [
      { text: "$ npm run dev", color: "#4a9eff" },
      { text: "Server on :3001", color: "#22c55e" },
      { text: "GET /api/users 200", color: "#8888aa" },
    ],
    defaultX: 20, defaultY: 24,
    width: 200, height: 110,
  },
  {
    id: "claude",
    title: "claude",
    indicatorColor: "#eab308",
    lines: [
      { text: "Analyzing codebase...", color: "#4a9eff" },
      { text: "Found 23 files", color: "#8888aa" },
      { text: "? Apply changes?", color: "#eab308" },
    ],
    defaultX: 240, defaultY: 24,
    width: 210, height: 110,
  },
  {
    id: "dev",
    title: "dev-server",
    indicatorColor: "#4a9eff",
    lines: [
      { text: "$ next dev --turbo", color: "#4a9eff" },
      { text: "ready in 1.2s", color: "#22c55e" },
      { text: "Compiled /dashboard", color: "#eab308" },
    ],
    defaultX: 60, defaultY: 154,
    width: 190, height: 110,
  },
  {
    id: "tests",
    title: "vitest",
    indicatorColor: "#22c55e",
    lines: [
      { text: "$ vitest run", color: "#4a9eff" },
      { text: "✓ 16 passed", color: "#22c55e" },
      { text: "0 failed", color: "#22c55e" },
    ],
    defaultX: 270, defaultY: 154,
    width: 180, height: 110,
  },
];

function DraggablePanel({
  panel,
  constraintsRef,
  onDragUpdate,
  guides,
  zIndex,
  onTap,
}: {
  panel: PanelData;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  onDragUpdate: (id: string, x: number, y: number, isDragging: boolean) => void;
  guides: { x: number | null; y: number | null };
  zIndex: number;
  onTap: () => void;
}) {
  const x = useMotionValue(panel.defaultX);
  const y = useMotionValue(panel.defaultY);
  const controls = useAnimationControls();

  // Animate to default position on mount
  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: PANELS.indexOf(panel) * 0.15 },
    });
  }, [controls, panel]);

  return (
    <motion.div
      className="absolute touch-none select-none"
      style={{
        x,
        y,
        width: panel.width,
        height: panel.height,
        zIndex,
        cursor: "grab",
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={controls}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.08}
      dragMomentum={false}
      whileDrag={{ scale: 1.04, cursor: "grabbing", zIndex: 50 }}
      onDrag={() => {
        onDragUpdate(panel.id, x.get(), y.get(), true);
      }}
      onDragEnd={() => {
        // Snap to grid
        const snappedX = Math.round(x.get() / SNAP_GRID) * SNAP_GRID;
        const snappedY = Math.round(y.get() / SNAP_GRID) * SNAP_GRID;
        x.set(snappedX);
        y.set(snappedY);
        onDragUpdate(panel.id, snappedX, snappedY, false);
      }}
      onTap={onTap}
    >
      <div
        className="w-full h-full rounded-lg overflow-hidden"
        style={{
          background: "#1a1a2e",
          border: "1px solid #2a2a44",
          boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5"
          style={{ background: "#0f0f1a", borderBottom: "1px solid #2a2a44" }}
        >
          <div
            className="rounded-full"
            style={{
              width: 6,
              height: 6,
              backgroundColor: panel.indicatorColor,
              boxShadow: `0 0 5px ${panel.indicatorColor}88`,
            }}
          />
          <span className="text-[9px] font-mono text-text-secondary/70 truncate">
            {panel.title}
          </span>
        </div>

        {/* Content */}
        <div className="p-2 font-mono text-[9px] leading-relaxed space-y-0.5">
          {panel.lines.map((line, i) => (
            <div key={i} style={{ color: line.color }}>{line.text}</div>
          ))}
          <span
            className="inline-block w-[5px] h-[9px] mt-0.5 animate-pulse"
            style={{ backgroundColor: "#4a9eff" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function InteractiveCanvas() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [topPanel, setTopPanel] = useState("api");
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleDragUpdate = useCallback(
    (id: string, x: number, y: number, isDragging: boolean) => {
      setHasInteracted(true);
      setPositions((prev) => ({ ...prev, [id]: { x, y } }));

      if (!isDragging) {
        setGuides({ x: null, y: null });
        return;
      }

      // Check alignment with other panels for snap guides
      let gx: number | null = null;
      let gy: number | null = null;
      const current = PANELS.find((p) => p.id === id);
      if (!current) return;

      for (const panel of PANELS) {
        if (panel.id === id) continue;
        const pos = positions[panel.id] ?? { x: panel.defaultX, y: panel.defaultY };

        // Vertical alignment (left edges)
        if (Math.abs(x - pos.x) < GUIDE_THRESHOLD) gx = pos.x;
        // Vertical alignment (right edges)
        if (Math.abs(x + current.width - (pos.x + panel.width)) < GUIDE_THRESHOLD) gx = pos.x + panel.width;
        // Horizontal alignment (top edges)
        if (Math.abs(y - pos.y) < GUIDE_THRESHOLD) gy = pos.y;
        // Horizontal alignment (bottom edges)
        if (Math.abs(y + current.height - (pos.y + panel.height)) < GUIDE_THRESHOLD) gy = pos.y + panel.height;
      }

      setGuides({ x: gx, y: gy });
    },
    [positions]
  );

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div
        ref={constraintsRef}
        className="relative rounded-2xl overflow-hidden"
        style={{
          height: 380,
          background: "#0a0a16",
          border: "1px solid #2a2a44",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.6), 0 0 40px rgba(74,158,255,0.05)",
        }}
      >
        {/* Dot grid background */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="canvasGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.8" fill="#2a2a44" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#canvasGrid)" />
        </svg>

        {/* Title bar */}
        <div
          className="relative z-10 flex items-center px-3 py-1.5 gap-1.5 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, #0a0a16ee, transparent)" }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          <span className="ml-2 text-[9px] font-mono text-text-secondary/40">
            TerminalDeck — Work
          </span>
        </div>

        {/* Snap guide lines */}
        {guides.x !== null && (
          <div
            className="absolute top-0 bottom-0 w-px pointer-events-none z-40"
            style={{ left: guides.x, background: "rgba(74,158,255,0.4)" }}
          />
        )}
        {guides.y !== null && (
          <div
            className="absolute left-0 right-0 h-px pointer-events-none z-40"
            style={{ top: guides.y, background: "rgba(74,158,255,0.4)" }}
          />
        )}

        {/* Draggable panels */}
        {PANELS.map((panel) => (
          <DraggablePanel
            key={panel.id}
            panel={panel}
            constraintsRef={constraintsRef}
            onDragUpdate={handleDragUpdate}
            guides={guides}
            zIndex={topPanel === panel.id ? 10 : 1}
            onTap={() => setTopPanel(panel.id)}
          />
        ))}

        {/* Hint tooltip */}
        {!hasInteracted && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <div
              className="px-3 py-1.5 rounded-full text-[10px] font-mono"
              style={{
                background: "rgba(74,158,255,0.12)",
                border: "1px solid rgba(74,158,255,0.25)",
                color: "#4a9eff",
              }}
            >
              Try dragging the panels around
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
