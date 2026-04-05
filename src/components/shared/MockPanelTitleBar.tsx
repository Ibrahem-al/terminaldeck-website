import React from 'react';
import { MockIndicatorLight, type IndicatorState } from './MockIndicatorLight';

interface Props {
  name: string;
  indicatorState: IndicatorState;
  projectColor?: string;
}

export const MockPanelTitleBar: React.FC<Props> = ({ name, indicatorState, projectColor }) => {
  return (
    <div
      style={{
        height: 30,
        background: '#1e1e3a',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: 8,
        borderBottom: '1px solid #2a2a44',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <MockIndicatorLight state={indicatorState} size={7} />
      <span style={{ fontSize: 11, color: '#e0e0e0', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      {projectColor && (
        <span
          style={{
            fontSize: 9,
            color: projectColor,
            background: `${projectColor}20`,
            padding: '1px 6px',
            borderRadius: 3,
            fontWeight: 500,
          }}
        />
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <span style={{ fontSize: 10, color: '#555', cursor: 'default' }}>─</span>
        <span style={{ fontSize: 10, color: '#555', cursor: 'default' }}>×</span>
      </div>
    </div>
  );
};
