import React, { useCallback, useRef, useState } from 'react';
import { useDemoStore } from './demoStore';
import { DemoPanel } from './DemoPanel';
import { DemoFocusOverlay } from './DemoFocusOverlay';

interface SnapGuide {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const SNAP_THRESHOLD = 30;

export const DemoCanvas: React.FC = () => {
  const panels = useDemoStore((s) => s.panels);
  const focusedId = useDemoStore((s) => s.focusedId);
  const isFocusMode = useDemoStore((s) => s.isFocusMode);
  const setPosition = useDemoStore((s) => s.setPosition);
  const setFocused = useDemoStore((s) => s.setFocused);
  const enterFocusMode = useDemoStore((s) => s.enterFocusMode);
  const exitFocusMode = useDemoStore((s) => s.exitFocusMode);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [guides, setGuides] = useState<SnapGuide[]>([]);

  const calcSnapGuides = useCallback(
    (dragId: string, rawX: number, rawY: number): { x: number; y: number; guides: SnapGuide[] } => {
      const dragPanel = panels.find((p) => p.id === dragId);
      if (!dragPanel) return { x: rawX, y: rawY, guides: [] };

      let snappedX = rawX;
      let snappedY = rawY;
      const newGuides: SnapGuide[] = [];

      const canvasH = canvasRef.current?.clientHeight ?? 520;
      const canvasW = canvasRef.current?.clientWidth ?? 680;

      const dragLeft = rawX;
      const dragRight = rawX + dragPanel.width;
      const dragTop = rawY;
      const dragBottom = rawY + dragPanel.height;
      const dragCenterX = rawX + dragPanel.width / 2;
      const dragCenterY = rawY + dragPanel.height / 2;

      for (const other of panels) {
        if (other.id === dragId) continue;

        const otherLeft = other.x;
        const otherRight = other.x + other.width;
        const otherTop = other.y;
        const otherBottom = other.y + other.height;
        const otherCenterX = other.x + other.width / 2;
        const otherCenterY = other.y + other.height / 2;

        // Left edge to left edge
        if (Math.abs(dragLeft - otherLeft) < SNAP_THRESHOLD) {
          snappedX = otherLeft;
          newGuides.push({ x1: otherLeft, y1: 0, x2: otherLeft, y2: canvasH });
        }
        // Right edge to right edge
        if (Math.abs(dragRight - otherRight) < SNAP_THRESHOLD) {
          snappedX = otherRight - dragPanel.width;
          newGuides.push({ x1: otherRight, y1: 0, x2: otherRight, y2: canvasH });
        }
        // Left to right
        if (Math.abs(dragLeft - otherRight) < SNAP_THRESHOLD) {
          snappedX = otherRight;
          newGuides.push({ x1: otherRight, y1: 0, x2: otherRight, y2: canvasH });
        }
        // Right to left
        if (Math.abs(dragRight - otherLeft) < SNAP_THRESHOLD) {
          snappedX = otherLeft - dragPanel.width;
          newGuides.push({ x1: otherLeft, y1: 0, x2: otherLeft, y2: canvasH });
        }
        // Center X alignment
        if (Math.abs(dragCenterX - otherCenterX) < SNAP_THRESHOLD) {
          snappedX = otherCenterX - dragPanel.width / 2;
          newGuides.push({ x1: otherCenterX, y1: 0, x2: otherCenterX, y2: canvasH });
        }

        // Top edge to top edge
        if (Math.abs(dragTop - otherTop) < SNAP_THRESHOLD) {
          snappedY = otherTop;
          newGuides.push({ x1: 0, y1: otherTop, x2: canvasW, y2: otherTop });
        }
        // Bottom edge to bottom edge
        if (Math.abs(dragBottom - otherBottom) < SNAP_THRESHOLD) {
          snappedY = otherBottom - dragPanel.height;
          newGuides.push({ x1: 0, y1: otherBottom, x2: canvasW, y2: otherBottom });
        }
        // Top to bottom
        if (Math.abs(dragTop - otherBottom) < SNAP_THRESHOLD) {
          snappedY = otherBottom;
          newGuides.push({ x1: 0, y1: otherBottom, x2: canvasW, y2: otherBottom });
        }
        // Bottom to top
        if (Math.abs(dragBottom - otherTop) < SNAP_THRESHOLD) {
          snappedY = otherTop - dragPanel.height;
          newGuides.push({ x1: 0, y1: otherTop, x2: canvasW, y2: otherTop });
        }
        // Center Y alignment
        if (Math.abs(dragCenterY - otherCenterY) < SNAP_THRESHOLD) {
          snappedY = otherCenterY - dragPanel.height / 2;
          newGuides.push({ x1: 0, y1: otherCenterY, x2: canvasW, y2: otherCenterY });
        }
      }

      return { x: snappedX, y: snappedY, guides: newGuides };
    },
    [panels],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left - dragRef.current.offsetX;
      const rawY = e.clientY - rect.top - dragRef.current.offsetY;

      const { x, y, guides: newGuides } = calcSnapGuides(dragRef.current.id, rawX, rawY);
      setPosition(dragRef.current.id, x, y);
      setGuides(newGuides);
    },
    [calcSnapGuides, setPosition],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    setGuides([]);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleTitleBarMouseDown = useCallback(
    (panelId: string, e: React.MouseEvent) => {
      if (isFocusMode) return;

      const panel = panels.find((p) => p.id === panelId);
      if (!panel || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      dragRef.current = {
        id: panelId,
        offsetX: e.clientX - rect.left - panel.x,
        offsetY: e.clientY - rect.top - panel.y,
      };

      setFocused(panelId);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [panels, isFocusMode, setFocused, handleMouseMove, handleMouseUp],
  );

  const handlePanelClick = useCallback(
    (panelId: string) => {
      if (isFocusMode) return;
      setFocused(panelId);
    },
    [isFocusMode, setFocused],
  );

  const handlePanelDoubleClick = useCallback(
    (panelId: string) => {
      enterFocusMode(panelId);
    },
    [enterFocusMode],
  );

  return (
    <div
      ref={canvasRef}
      className="demo-canvas"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#0a0a14',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Snap guide SVG overlay */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        {guides.map((g, i) => (
          <line
            key={i}
            x1={g.x1}
            y1={g.y1}
            x2={g.x2}
            y2={g.y2}
            stroke="var(--snap-guide)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      {/* Focus overlay */}
      <DemoFocusOverlay active={isFocusMode} onExit={exitFocusMode} />

      {/* Panels */}
      {panels.map((panel) => (
        <DemoPanel
          key={panel.id}
          panel={panel}
          isFocused={focusedId === panel.id}
          isFocusMode={isFocusMode}
          onTitleBarMouseDown={(e) => handleTitleBarMouseDown(panel.id, e)}
          onClick={() => handlePanelClick(panel.id)}
          onDoubleClick={() => handlePanelDoubleClick(panel.id)}
        />
      ))}
    </div>
  );
};
