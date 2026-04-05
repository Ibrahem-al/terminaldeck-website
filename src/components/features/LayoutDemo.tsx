import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const PANEL_COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#22c55e', '#f97316'];

// Positions for each layout mode
const LAYOUTS = {
  scattered: [
    { x: 20, y: 30 },
    { x: 220, y: 10 },
    { x: 120, y: 140 },
    { x: 310, y: 100 },
    { x: 40, y: 190 },
  ],
  grid: [
    { x: 50, y: 30 },
    { x: 160, y: 30 },
    { x: 270, y: 30 },
    { x: 100, y: 115 },
    { x: 210, y: 115 },
  ],
  columns: [
    { x: 20, y: 20 },
    { x: 20, y: 85 },
    { x: 20, y: 150 },
    { x: 230, y: 20 },
    { x: 230, y: 85 },
  ],
  rows: [
    { x: 15, y: 25 },
    { x: 90, y: 25 },
    { x: 165, y: 25 },
    { x: 240, y: 25 },
    { x: 315, y: 25 },
  ],
};

const LAYOUT_NAMES = ['Scattered', 'Grid', 'Columns', 'Rows'];

export const LayoutDemo: React.FC = () => {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [layoutLabel, setLayoutLabel] = useState('Scattered');

  useEffect(() => {
    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    if (panels.length < 5) return;

    // Set initial scattered positions
    panels.forEach((panel, i) => {
      gsap.set(panel, {
        x: LAYOUTS.scattered[i].x,
        y: LAYOUTS.scattered[i].y,
      });
    });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    // 1. Hold at scattered
    tl.call(() => setLayoutLabel('Scattered'));
    tl.to({}, { duration: 1.5 });

    // 2. Transition to grid
    tl.call(() => setLayoutLabel('Grid'));
    panels.forEach((panel, i) => {
      tl.to(
        panel,
        {
          x: LAYOUTS.grid[i].x,
          y: LAYOUTS.grid[i].y,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '<'
      );
    });

    // Hold grid
    tl.to({}, { duration: 1.5 });

    // 3. Transition to columns
    tl.call(() => setLayoutLabel('Columns'));
    panels.forEach((panel, i) => {
      tl.to(
        panel,
        {
          x: LAYOUTS.columns[i].x,
          y: LAYOUTS.columns[i].y,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '<'
      );
    });

    // Hold columns
    tl.to({}, { duration: 1.5 });

    // 4. Transition to rows
    tl.call(() => setLayoutLabel('Rows'));
    panels.forEach((panel, i) => {
      tl.to(
        panel,
        {
          x: LAYOUTS.rows[i].x,
          y: LAYOUTS.rows[i].y,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '<'
      );
    });

    // Hold rows
    tl.to({}, { duration: 1.5 });

    // 5. Back to scattered
    tl.call(() => setLayoutLabel('Scattered'));
    panels.forEach((panel, i) => {
      tl.to(
        panel,
        {
          x: LAYOUTS.scattered[i].x,
          y: LAYOUTS.scattered[i].y,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '<'
      );
    });

    // Hold before repeat
    tl.to({}, { duration: 0.8 });

    tlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      style={{
        background: '#0f0f1a',
        borderRadius: 12,
        padding: 24,
        height: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Canvas area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          height: 280,
          border: '1px dashed #2a2a44',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {PANEL_COLORS.map((color, i) => (
          <div
            key={i}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            style={{
              position: 'absolute',
              width: 60,
              height: 45,
              background: '#1a1a2e',
              borderRadius: 4,
              border: `1px solid ${color}40`,
              boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Colored top bar */}
            <div
              style={{
                height: 3,
                background: color,
                borderRadius: '4px 4px 0 0',
              }}
            />
            {/* Content lines */}
            <div style={{ padding: '4px 5px' }}>
              <div
                style={{
                  height: 2,
                  width: '80%',
                  background: '#2a2a44',
                  borderRadius: 1,
                  marginBottom: 3,
                }}
              />
              <div
                style={{
                  height: 2,
                  width: '55%',
                  background: '#2a2a44',
                  borderRadius: 1,
                  marginBottom: 3,
                }}
              />
              <div
                style={{
                  height: 2,
                  width: '70%',
                  background: '#2a2a44',
                  borderRadius: 1,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Layout label */}
      <div
        ref={labelRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: '#8888aa',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Layout:
        </span>
        <span
          style={{
            fontSize: 13,
            color: '#4a9eff',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
          }}
        >
          {layoutLabel}
        </span>
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginLeft: 'auto',
          }}
        >
          {LAYOUT_NAMES.map((name) => (
            <div
              key={name}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background:
                  name === layoutLabel ? '#4a9eff' : '#2a2a44',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
