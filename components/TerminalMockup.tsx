"use client";

import { motion } from "framer-motion";
import { MockupPanel } from "./MockupPanel";

export function TerminalMockup() {
  return (
    <div className="relative w-full max-w-4xl mx-auto" style={{ height: 420 }}>
      {/* Canvas background with dot grid */}
      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: "#0a0a16",
          border: "1px solid #2a2a44",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.6), 0 0 40px rgba(74,158,255,0.05)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Dot grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="#2a2a44" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>

        {/* Sidebar mockup */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-48 border-r"
          style={{
            background: "#0f0f1a",
            borderColor: "#2a2a44",
          }}
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          {/* Workspace switcher */}
          <div className="px-3 py-3 border-b" style={{ borderColor: "#2a2a44" }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center">
                <span className="text-[8px] font-mono text-accent">W</span>
              </div>
              <span className="text-xs font-mono text-text-secondary">Work</span>
            </div>
          </div>

          {/* Project: Backend (blue) */}
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4a9eff" }} />
              <span className="text-[10px] font-mono font-medium text-text-primary">Backend</span>
            </div>
            <div className="ml-3.5 space-y-1.5">
              {["API Server", "Database"].map((name) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                  <span className="text-[9px] font-mono text-text-secondary">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project: Frontend (green) */}
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22c55e" }} />
              <span className="text-[10px] font-mono font-medium text-text-primary">Frontend</span>
            </div>
            <div className="ml-3.5 space-y-1.5">
              {["Dev Server", "Tests"].map((name) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4a9eff" }} />
                  <span className="text-[9px] font-mono text-text-secondary">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project: AI Agents (yellow) */}
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#eab308" }} />
              <span className="text-[10px] font-mono font-medium text-text-primary">AI Agents</span>
            </div>
            <div className="ml-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  animate={{
                    backgroundColor: ["#eab308", "#4a9eff", "#22c55e", "#eab308"],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <span className="text-[9px] font-mono text-text-secondary">Claude</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                <span className="text-[9px] font-mono text-text-secondary">Copilot</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Snap guide line (vertical) */}
        <motion.div
          className="absolute top-0 bottom-0 w-px"
          style={{ left: "50%", background: "rgba(74,158,255,0.2)" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        />

        {/* Terminal panels on the canvas */}
        <div className="absolute" style={{ left: 200, top: 0, right: 0, bottom: 0 }}>
          <MockupPanel
            title="api-server ~/projects/backend"
            indicatorColor="#22c55e"
            x={20}
            y={20}
            width={250}
            height={130}
            delay={0.5}
            borderColor="#4a9eff55"
            lines={[
              { text: "$ npm run dev", color: "#4a9eff" },
              { text: "Server running on port 3001", color: "#22c55e" },
              { text: "GET /api/users 200 12ms", color: "#8888aa" },
              { text: "POST /api/auth 200 45ms", color: "#8888aa" },
              { text: "GET /api/deck 200 8ms", color: "#8888aa" },
            ]}
          />

          <MockupPanel
            title="claude  ~/projects"
            indicatorColor="#eab308"
            x={290}
            y={20}
            width={260}
            height={130}
            delay={0.7}
            borderColor="#eab30855"
            lines={[
              { text: "claude > Analyzing codebase...", color: "#4a9eff" },
              { text: "Found 23 files matching pattern", color: "#8888aa" },
              { text: "Generating refactoring plan...", color: "#eab308" },
              { text: "", color: "#8888aa" },
              { text: "? Apply changes? (y/n)", color: "#eab308" },
            ]}
          />

          <MockupPanel
            title="dev-server ~/frontend"
            indicatorColor="#4a9eff"
            x={80}
            y={170}
            width={220}
            height={120}
            delay={0.9}
            borderColor="#22c55e55"
            lines={[
              { text: "$ next dev --turbo", color: "#4a9eff" },
              { text: "ready in 1.2s", color: "#22c55e" },
              { text: "○ Compiling /dashboard...", color: "#eab308" },
              { text: "✓ Compiled in 340ms", color: "#22c55e" },
            ]}
          />

          <MockupPanel
            title="tests ~/frontend"
            indicatorColor="#22c55e"
            x={320}
            y={170}
            width={220}
            height={120}
            delay={1.1}
            borderColor="#22c55e55"
            lines={[
              { text: "$ vitest run", color: "#4a9eff" },
              { text: "✓ auth.test.ts (4 tests)", color: "#22c55e" },
              { text: "✓ api.test.ts (12 tests)", color: "#22c55e" },
              { text: "Tests: 16 passed, 0 failed", color: "#22c55e" },
            ]}
          />
        </div>

        {/* Title bar overlay */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-8 flex items-center px-3 gap-1.5"
          style={{
            background: "linear-gradient(to bottom, #0a0a16, transparent)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
          <span className="ml-2 text-[10px] font-mono text-text-secondary/50">TerminalDeck — Work</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
