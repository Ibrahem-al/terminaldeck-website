import React from 'react';
import type { TerminalLine } from '../../data/terminalContent';

const lineColors: Record<TerminalLine['type'], string> = {
  prompt: '#22c55e',
  output: '#8888aa',
  command: '#e0e0e0',
  success: '#4aff7a',
  error: '#ef4444',
  ai: '#4a9eff',
};

interface Props {
  lines: TerminalLine[];
  showCursor?: boolean;
  fontSize?: number;
}

export const MockTerminalContent: React.FC<Props> = ({ lines, showCursor = true, fontSize = 11 }) => {
  return (
    <div
      style={{
        background: '#0f0f1a',
        padding: '8px 10px',
        fontFamily: "var(--font-mono)",
        fontSize,
        lineHeight: 1.5,
        overflow: 'hidden',
        height: '100%',
        whiteSpace: 'pre',
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ color: lineColors[line.type], minHeight: fontSize * 1.5 }}>
          {line.text}
        </div>
      ))}
      {showCursor && (
        <span
          style={{
            display: 'inline-block',
            width: fontSize * 0.6,
            height: fontSize,
            background: '#4a9eff',
            animation: 'blink-cursor 1s step-end infinite',
            verticalAlign: 'middle',
          }}
        />
      )}
    </div>
  );
};
