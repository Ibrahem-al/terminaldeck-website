"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useAnimationControls, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

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
const MAX_PANELS = 8;

const INDICATOR_COLORS = ["#22c55e", "#4a9eff", "#eab308", "#22c55e", "#4a9eff"];

const PANEL_TEMPLATES = [
  { title: "logs", lines: [{ text: "$ tail -f app.log", color: "#4a9eff" }, { text: "[INFO] Request handled", color: "#22c55e" }, { text: "[WARN] Cache miss", color: "#eab308" }] },
  { title: "docker", lines: [{ text: "$ docker ps", color: "#4a9eff" }, { text: "redis  Up 3 hours", color: "#22c55e" }, { text: "nginx  Up 3 hours", color: "#22c55e" }] },
  { title: "ssh-prod", lines: [{ text: "$ ssh prod-01", color: "#4a9eff" }, { text: "Welcome to Ubuntu", color: "#8888aa" }, { text: "user@prod-01:~$", color: "#22c55e" }] },
  { title: "webpack", lines: [{ text: "$ webpack --watch", color: "#4a9eff" }, { text: "Compiled in 2.1s", color: "#22c55e" }, { text: "12 modules", color: "#8888aa" }] },
  { title: "redis-cli", lines: [{ text: "$ redis-cli monitor", color: "#4a9eff" }, { text: "GET session:abc", color: "#8888aa" }, { text: "SET cache:key val", color: "#8888aa" }] },
  { title: "monitor", lines: [{ text: "$ htop", color: "#4a9eff" }, { text: "CPU: 34%  MEM: 61%", color: "#eab308" }, { text: "Tasks: 142 running", color: "#8888aa" }] },
  { title: "build", lines: [{ text: "$ cargo build", color: "#4a9eff" }, { text: "Compiling app v0.1", color: "#eab308" }, { text: "Finished in 8.3s", color: "#22c55e" }] },
  { title: "deploy", lines: [{ text: "$ fly deploy", color: "#4a9eff" }, { text: "Deploying image...", color: "#eab308" }, { text: "v42 deployed!", color: "#22c55e" }] },
];

const DEFAULT_PANELS: PanelData[] = [
  {
    id: "p-1", title: "api-server", indicatorColor: "#22c55e",
    lines: [{ text: "$ npm run dev", color: "#4a9eff" }, { text: "Server on :3001", color: "#22c55e" }, { text: "GET /api/users 200", color: "#8888aa" }],
    defaultX: 20, defaultY: 28, width: 200, height: 110,
  },
  {
    id: "p-2", title: "claude", indicatorColor: "#eab308",
    lines: [{ text: "Analyzing codebase...", color: "#4a9eff" }, { text: "Found 23 files", color: "#8888aa" }, { text: "? Apply changes?", color: "#eab308" }],
    defaultX: 240, defaultY: 28, width: 210, height: 110,
  },
  {
    id: "p-3", title: "dev-server", indicatorColor: "#4a9eff",
    lines: [{ text: "$ next dev --turbo", color: "#4a9eff" }, { text: "ready in 1.2s", color: "#22c55e" }, { text: "Compiled /dashboard", color: "#eab308" }],
    defaultX: 60, defaultY: 158, width: 190, height: 110,
  },
  {
    id: "p-4", title: "vitest", indicatorColor: "#22c55e",
    lines: [{ text: "$ vitest run", color: "#4a9eff" }, { text: "✓ 16 passed", color: "#22c55e" }, { text: "0 failed", color: "#22c55e" }],
    defaultX: 270, defaultY: 158, width: 180, height: 110,
  },
];

let nextId = 5;

function DraggablePanel({
  panel,
  constraintsRef,
  onDragUpdate,
  zIndex,
  onTap,
  onClose,
  allPanels,
}: {
  panel: PanelData;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  onDragUpdate: (id: string, x: number, y: number, isDragging: boolean) => void;
  zIndex: number;
  onTap: () => void;
  onClose: (id: string) => void;
  allPanels: PanelData[];
}) {
  const x = useMotionValue(panel.defaultX);
  const y = useMotionValue(panel.defaultY);
  const controls = useAnimationControls();
  const delayIndex = allPanels.indexOf(panel);

  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: Math.min(delayIndex, 3) * 0.12 },
    });
  }, [controls, delayIndex]);

  return (
    <motion.div
      className="absolute touch-none select-none"
      style={{ x, y, width: panel.width, height: panel.height, zIndex, cursor: "grab" }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={controls}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.08}
      dragMomentum={false}
      whileDrag={{ scale: 1.04, cursor: "grabbing", zIndex: 50 }}
      onDrag={() => onDragUpdate(panel.id, x.get(), y.get(), true)}
      onDragEnd={() => {
        const snappedX = Math.round(x.get() / SNAP_GRID) * SNAP_GRID;
        const snappedY = Math.round(y.get() / SNAP_GRID) * SNAP_GRID;
        x.set(snappedX);
        y.set(snappedY);
        onDragUpdate(panel.id, snappedX, snappedY, false);
      }}
      onTap={onTap}
      layout
    >
      <div
        className="w-full h-full rounded-lg overflow-hidden group/panel"
        style={{ background: "#1a1a2e", border: "1px solid #2a2a44", boxShadow: "0 6px 24px rgba(0,0,0,0.4)" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5"
          style={{ background: "#0f0f1a", borderBottom: "1px solid #2a2a44" }}
        >
          <div
            className="rounded-full shrink-0"
            style={{ width: 6, height: 6, backgroundColor: panel.indicatorColor, boxShadow: `0 0 5px ${panel.indicatorColor}88` }}
          />
          <span className="text-[9px] font-mono text-text-secondary/70 truncate flex-1">{panel.title}</span>
          {/* Close button */}
          <button
            className="opacity-0 group-hover/panel:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10 cursor-pointer shrink-0"
            onClick={(e) => { e.stopPropagation(); onClose(panel.id); }}
            aria-label={`Close ${panel.title}`}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <X size={10} className="text-text-secondary/60 hover:text-red-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 font-mono text-[9px] leading-relaxed space-y-0.5">
          {panel.lines.map((line, i) => (
            <div key={i} style={{ color: line.color }}>{line.text}</div>
          ))}
          <span className="inline-block w-[5px] h-[9px] mt-0.5 animate-pulse" style={{ backgroundColor: "#4a9eff" }} />
        </div>
      </div>
    </motion.div>
  );
}

export function InteractiveCanvas() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [panels, setPanels] = useState<PanelData[]>(DEFAULT_PANELS);
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [topPanel, setTopPanel] = useState("p-1");
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const templateIndex = useRef(0);

  const addPanel = useCallback(() => {
    if (panels.length >= MAX_PANELS) return;
    const template = PANEL_TEMPLATES[templateIndex.current % PANEL_TEMPLATES.length];
    templateIndex.current++;
    const id = `p-${nextId++}`;
    const newPanel: PanelData = {
      id,
      title: template.title,
      indicatorColor: INDICATOR_COLORS[Math.floor(Math.random() * INDICATOR_COLORS.length)],
      lines: template.lines,
      defaultX: 30 + Math.random() * 200,
      defaultY: 30 + Math.random() * 160,
      width: 180 + Math.floor(Math.random() * 40),
      height: 105,
    };
    setPanels((prev) => [...prev, newPanel]);
    setTopPanel(id);
    setHasInteracted(true);
  }, [panels.length]);

  const removePanel = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
    setPositions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setHasInteracted(true);
  }, []);

  const handleDragUpdate = useCallback(
    (id: string, x: number, y: number, isDragging: boolean) => {
      setHasInteracted(true);
      setPositions((prev) => ({ ...prev, [id]: { x, y } }));

      if (!isDragging) {
        setGuides({ x: null, y: null });
        return;
      }

      let gx: number | null = null;
      let gy: number | null = null;
      const current = panels.find((p) => p.id === id);
      if (!current) return;

      for (const panel of panels) {
        if (panel.id === id) continue;
        const pos = positions[panel.id] ?? { x: panel.defaultX, y: panel.defaultY };
        if (Math.abs(x - pos.x) < GUIDE_THRESHOLD) gx = pos.x;
        if (Math.abs(x + current.width - (pos.x + panel.width)) < GUIDE_THRESHOLD) gx = pos.x + panel.width;
        if (Math.abs(y - pos.y) < GUIDE_THRESHOLD) gy = pos.y;
        if (Math.abs(y + current.height - (pos.y + panel.height)) < GUIDE_THRESHOLD) gy = pos.y + panel.height;
      }

      setGuides({ x: gx, y: gy });
    },
    [panels, positions]
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
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="canvasGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.8" fill="#2a2a44" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#canvasGrid)" />
        </svg>

        {/* Title bar with traffic lights + add button */}
        <div
          className="relative z-10 flex items-center px-3 py-1.5 gap-1.5"
          style={{ background: "linear-gradient(to bottom, #0a0a16ee, transparent)" }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          <span className="ml-2 text-[9px] font-mono text-text-secondary/40 flex-1">
            TerminalDeck — Work
          </span>

          {/* Add terminal button */}
          <button
            onClick={addPanel}
            disabled={panels.length >= MAX_PANELS}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/15"
            style={{ color: "#4a9eff", border: "1px solid rgba(74,158,255,0.25)" }}
            aria-label="Add terminal"
          >
            <Plus size={10} />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Panel count */}
          <span className="text-[8px] font-mono text-text-secondary/30">
            {panels.length}/{MAX_PANELS}
          </span>
        </div>

        {/* Snap guide lines */}
        {guides.x !== null && (
          <div className="absolute top-0 bottom-0 w-px pointer-events-none z-40" style={{ left: guides.x, background: "rgba(74,158,255,0.4)" }} />
        )}
        {guides.y !== null && (
          <div className="absolute left-0 right-0 h-px pointer-events-none z-40" style={{ top: guides.y, background: "rgba(74,158,255,0.4)" }} />
        )}

        {/* Draggable panels */}
        <AnimatePresence>
          {panels.map((panel) => (
            <DraggablePanel
              key={panel.id}
              panel={panel}
              constraintsRef={constraintsRef}
              onDragUpdate={handleDragUpdate}
              zIndex={topPanel === panel.id ? 10 : 1}
              onTap={() => setTopPanel(panel.id)}
              onClose={removePanel}
              allPanels={panels}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {panels.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={addPanel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono cursor-pointer transition-all hover:bg-accent/10"
              style={{ color: "#4a9eff", border: "1px solid rgba(74,158,255,0.3)" }}
            >
              <Plus size={14} />
              Add your first terminal
            </button>
          </div>
        )}

        {/* Hint tooltip */}
        {!hasInteracted && panels.length > 0 && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <div
              className="px-3 py-1.5 rounded-full text-[10px] font-mono"
              style={{ background: "rgba(74,158,255,0.12)", border: "1px solid rgba(74,158,255,0.25)", color: "#4a9eff" }}
            >
              Drag panels around, click + to add, hover x to close
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
