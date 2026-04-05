import React from 'react';

interface Props {
  active: boolean;
  onExit: () => void;
}

export const DemoFocusOverlay: React.FC<Props> = ({ active, onExit }) => {
  return (
    <div
      onClick={onExit}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        opacity: active ? 1 : 0,
        pointerEvents: active ? 'auto' : 'none',
        transition: 'opacity 0.4s ease',
        zIndex: 5,
        cursor: 'pointer',
      }}
    />
  );
};
