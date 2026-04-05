import React, { useState, useEffect } from 'react';

interface IndicatorState {
  color: string;
  glow: string;
  label: string;
}

const STATES: Record<string, IndicatorState> = {
  off: { color: '#555', glow: 'none', label: 'Off' },
  active: { color: '#4a9eff', glow: '0 0 6px #4a9eff', label: 'Active' },
  completed: { color: '#4aff7a', glow: '0 0 6px #4aff7a', label: 'Completed' },
  waiting: { color: '#ffda4a', glow: '0 0 6px #ffda4a', label: 'Waiting' },
  embedded: { color: '#f97316', glow: '0 0 6px #f97316', label: 'Embedded' },
};

const CYCLE_SEQUENCE: { state: string; duration: number }[] = [
  { state: 'off', duration: 1000 },
  { state: 'active', duration: 3000 },
  { state: 'completed', duration: 2000 },
  { state: 'off', duration: 1000 },
  { state: 'active', duration: 1500 },
  { state: 'waiting', duration: 2000 },
  { state: 'off', duration: 1000 },
];

const MockIndicatorLight: React.FC<{
  color: string;
  glow: string;
  size?: number;
}> = ({ color, glow, size = 20 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      boxShadow: glow,
      transition: 'background 0.4s ease, box-shadow 0.4s ease',
      flexShrink: 0,
    }}
  />
);

export const IndicatorDemo: React.FC = () => {
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    const current = CYCLE_SEQUENCE[cycleIndex];
    const timer = setTimeout(() => {
      setCycleIndex((prev) => (prev + 1) % CYCLE_SEQUENCE.length);
    }, current.duration);

    return () => clearTimeout(timer);
  }, [cycleIndex]);

  const currentState = STATES[CYCLE_SEQUENCE[cycleIndex].state];
  const allStates = Object.entries(STATES);

  return (
    <div
      style={{
        background: '#0f0f1a',
        borderRadius: 12,
        padding: 24,
        height: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      {/* Top row: all 5 indicator states with labels */}
      <div>
        <div
          style={{
            fontSize: 11,
            color: '#8888aa',
            fontFamily: 'var(--font-mono)',
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Indicator States
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          {allStates.map(([key, state]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <MockIndicatorLight color={state.color} glow={state.glow} />
              <span
                style={{
                  fontSize: 13,
                  color: '#e0e0e0',
                  fontWeight: 500,
                }}
              >
                {state.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: mock title bar with cycling indicator */}
      <div>
        <div
          style={{
            fontSize: 11,
            color: '#8888aa',
            fontFamily: 'var(--font-mono)',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Live Detection
        </div>
        <div
          style={{
            width: 300,
            height: 38,
            background: '#1e1e3a',
            borderRadius: 8,
            border: '1px solid #2a2a44',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 10,
          }}
        >
          <MockIndicatorLight
            color={currentState.color}
            glow={currentState.glow}
            size={10}
          />
          <span
            style={{
              fontSize: 12,
              color: '#e0e0e0',
              fontFamily: 'var(--font-mono)',
              flex: 1,
            }}
          >
            claude-ai
          </span>
          <span
            style={{
              fontSize: 10,
              color: currentState.color,
              fontFamily: 'var(--font-mono)',
              transition: 'color 0.4s ease',
            }}
          >
            {currentState.label}
          </span>
        </div>

        {/* Second mock bar */}
        <div
          style={{
            width: 300,
            height: 38,
            background: '#1e1e3a',
            borderRadius: 8,
            border: '1px solid #2a2a44',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 10,
            marginTop: 8,
          }}
        >
          <MockIndicatorLight
            color={STATES.completed.color}
            glow={STATES.completed.glow}
            size={10}
          />
          <span
            style={{
              fontSize: 12,
              color: '#e0e0e0',
              fontFamily: 'var(--font-mono)',
              flex: 1,
            }}
          >
            npm-build
          </span>
          <span
            style={{
              fontSize: 10,
              color: STATES.completed.color,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Completed
          </span>
        </div>

        {/* Third mock bar */}
        <div
          style={{
            width: 300,
            height: 38,
            background: '#1e1e3a',
            borderRadius: 8,
            border: '1px solid #2a2a44',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 10,
            marginTop: 8,
          }}
        >
          <MockIndicatorLight
            color={STATES.off.color}
            glow={STATES.off.glow}
            size={10}
          />
          <span
            style={{
              fontSize: 12,
              color: '#e0e0e0',
              fontFamily: 'var(--font-mono)',
              flex: 1,
            }}
          >
            bash
          </span>
          <span
            style={{
              fontSize: 10,
              color: STATES.off.color,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Off
          </span>
        </div>
      </div>
    </div>
  );
};
