import React from 'react';

export const CursorIcon: React.FC = () => {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, #1a1a2e 60%, transparent 100%)',
        borderRadius: '50%',
        position: 'relative',
      }}
    >
      {/* Glow ring */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '1px solid #4a9eff44',
          background: 'radial-gradient(circle, #4a9eff15, transparent 70%)',
        }}
      />
      {/* Terminal cursor */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 22,
          fontWeight: 'bold',
          color: '#4a9eff',
          textShadow: '0 0 12px #4a9eff',
          position: 'relative',
          zIndex: 1,
        }}
      >
        &gt;<span style={{ animation: 'blink-cursor 1s step-end infinite' }}>_</span>
      </span>
    </div>
  );
};
