import React from 'react';
import { MockIndicatorLight } from '../shared/MockIndicatorLight';
import type { DemoPanelData } from './demoStore';

interface Props {
  panel: DemoPanelData;
  isFocused: boolean;
  isFocusMode: boolean;
  onTitleBarMouseDown: (e: React.MouseEvent) => void;
  onClick: () => void;
  onDoubleClick: () => void;
}

export const DemoPanel: React.FC<Props> = ({
  panel,
  isFocused,
  isFocusMode,
  onTitleBarMouseDown,
  onClick,
  onDoubleClick,
}) => {
  const dimmed = isFocusMode && !isFocused;

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{
        position: 'absolute',
        left: panel.x,
        top: panel.y,
        width: panel.width,
        height: panel.height,
        borderRadius: 8,
        background: '#1a1a2e',
        border: `2px solid ${panel.projectColor}40`,
        overflow: 'hidden',
        cursor: 'default',
        opacity: dimmed ? 0.3 : 1,
        transition: 'opacity 0.35s ease, box-shadow 0.3s ease',
        boxShadow: isFocused
          ? `0 0 24px ${panel.projectColor}30, 0 4px 20px rgba(0,0,0,0.5)`
          : '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: isFocused ? 10 : 1,
        pointerEvents: dimmed ? 'none' : 'auto',
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onTitleBarMouseDown}
        style={{
          height: 30,
          background: '#1e1e3a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: 8,
          borderBottom: '1px solid #2a2a44',
          userSelect: 'none',
          cursor: 'grab',
          flexShrink: 0,
        }}
      >
        <MockIndicatorLight state={panel.indicatorState} size={7} />
        <span
          style={{
            fontSize: 11,
            color: '#e0e0e0',
            fontWeight: 500,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {panel.name}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#555', cursor: 'default' }}>{'\u2500'}</span>
          <span style={{ fontSize: 10, color: '#555', cursor: 'default' }}>{'\u00d7'}</span>
        </div>
      </div>

      {/* Terminal content */}
      <div
        style={{
          padding: '8px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          lineHeight: 1.6,
          color: '#c0c0d0',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {panel.content.map((line, i) => {
          const isLast = i === panel.content.length - 1;
          const isCursor = line === '\u258c';
          return (
            <div key={i} style={{ whiteSpace: 'nowrap', minHeight: '1.6em' }}>
              {isCursor ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: 14,
                    background: panel.projectColor,
                    animation: 'blink-cursor 1s step-end infinite',
                    verticalAlign: 'middle',
                  }}
                />
              ) : (
                <>
                  {line}
                  {isLast && !isCursor && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 7,
                        height: 14,
                        background: panel.projectColor,
                        animation: 'blink-cursor 1s step-end infinite',
                        verticalAlign: 'middle',
                        marginLeft: 2,
                      }}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
