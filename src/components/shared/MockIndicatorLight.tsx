import React, { useMemo } from 'react';

export type IndicatorState = 'off' | 'blue' | 'green' | 'yellow' | 'orange';

const STATE_COLORS: Record<IndicatorState, string> = {
  off: '#555',
  blue: '#4a9eff',
  green: '#4aff7a',
  yellow: '#ffda4a',
  orange: '#f97316',
};

interface Props {
  state: IndicatorState;
  size?: number;
}

export const MockIndicatorLight: React.FC<Props> = ({ state, size = 8 }) => {
  const color = STATE_COLORS[state];

  const style = useMemo<React.CSSProperties>(
    () => ({
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      transition: 'background-color 0.3s ease',
      flexShrink: 0,
      ...(state === 'blue' ? { animation: 'indicator-pulse 1.5s ease-in-out infinite' } : {}),
      ...(state !== 'off' ? { boxShadow: `0 0 ${size * 0.75}px ${color}` } : {}),
    }),
    [color, size, state],
  );

  return <div style={style} />;
};
