import React from 'react';
import { MockWindowControls } from '../shared/MockWindowControls';
import { MockPanelTitleBar } from '../shared/MockPanelTitleBar';
import { MockTerminalContent } from '../shared/MockTerminalContent';
import { apiServerContent, devServerContent, claudeContent } from '../../data/terminalContent';
import './HeroMockup.css';

/* ========================================
   Sidebar Group Item
   ======================================== */

interface SidebarItemProps {
  name: string;
  dotColor: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ name, dotColor }) => (
  <div className="mock-sidebar__item">
    <span
      className="mock-sidebar__dot"
      style={{ background: dotColor, boxShadow: dotColor !== '#555' ? `0 0 4px ${dotColor}` : undefined }}
    />
    <span className="mock-sidebar__label">{name}</span>
  </div>
);

/* ========================================
   Sidebar Group
   ======================================== */

interface SidebarGroupProps {
  name: string;
  color: string;
  children: React.ReactNode;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({ name, color, children }) => (
  <div className="mock-sidebar__group">
    <div className="mock-sidebar__group-header">
      <span className="mock-sidebar__group-dot" style={{ background: color }} />
      <span className="mock-sidebar__group-name">{name}</span>
    </div>
    <div className="mock-sidebar__group-items">{children}</div>
  </div>
);

/* ========================================
   Snap Guide Lines (SVG)
   ======================================== */

const SnapGuides: React.FC = () => (
  <svg className="mock-canvas__guides" viewBox="0 0 360 270" preserveAspectRatio="none">
    {/* Horizontal center guide */}
    <line x1="0" y1="135" x2="360" y2="135" stroke="var(--snap-guide)" strokeWidth="1" strokeDasharray="4 3" />
    {/* Vertical center guide */}
    <line x1="180" y1="0" x2="180" y2="270" stroke="var(--snap-guide)" strokeWidth="1" strokeDasharray="4 3" />
    {/* Alignment guide between top panels */}
    <line x1="168" y1="8" x2="168" y2="125" stroke="var(--snap-guide)" strokeWidth="1" strokeDasharray="4 3" />
  </svg>
);

/* ========================================
   Terminal Panel
   ======================================== */

interface PanelProps {
  name: string;
  indicatorState: 'off' | 'blue' | 'green' | 'yellow' | 'orange';
  projectColor?: string;
  lines: typeof apiServerContent;
  className?: string;
  focused?: boolean;
}

const TerminalPanel: React.FC<PanelProps> = ({ name, indicatorState, projectColor, lines, className = '', focused = false }) => (
  <div
    className={`mock-panel ${className}`}
    style={{
      borderColor: projectColor ? `${projectColor}40` : 'var(--border)',
      boxShadow: focused
        ? '0 0 0 2px rgba(99,102,241,0.7), 0 4px 24px rgba(0,0,0,0.5)'
        : '0 2px 12px rgba(0,0,0,0.4)',
    }}
  >
    <MockPanelTitleBar name={name} indicatorState={indicatorState} projectColor={projectColor} />
    <MockTerminalContent lines={lines} showCursor={focused} fontSize={9} />
  </div>
);

/* ========================================
   HeroMockup — Main Component
   ======================================== */

export const HeroMockup: React.FC = () => {
  return (
    <div className="hero-mockup">
      <div className="hero-mockup__inner">
        {/* App Title Bar */}
        <div className="mock-titlebar">
          <MockWindowControls />
          <span className="mock-titlebar__text">TerminalDeck</span>
          <div className="mock-titlebar__spacer" />
        </div>

        {/* App Body */}
        <div className="mock-body">
          {/* Sidebar */}
          <div className="mock-sidebar">
            <SidebarGroup name="Backend API" color="#ef4444">
              <SidebarItem name="API Server" dotColor="#4aff7a" />
              <SidebarItem name="Database" dotColor="#555" />
            </SidebarGroup>

            <SidebarGroup name="Frontend" color="#3b82f6">
              <SidebarItem name="Dev Server" dotColor="#4a9eff" />
              <SidebarItem name="Tests" dotColor="#4aff7a" />
            </SidebarGroup>

            <div className="mock-sidebar__group">
              <div className="mock-sidebar__group-header">
                <span className="mock-sidebar__group-name" style={{ color: '#8888aa' }}>Ungrouped</span>
              </div>
              <div className="mock-sidebar__group-items">
                <SidebarItem name="Claude AI" dotColor="#ffda4a" />
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="mock-canvas">
            <SnapGuides />

            {/* API Server — top-left */}
            <TerminalPanel
              name="API Server"
              indicatorState="green"
              projectColor="#ef4444"
              lines={apiServerContent}
              className="mock-panel--api"
              focused
            />

            {/* Dev Server — top-right */}
            <TerminalPanel
              name="Dev Server"
              indicatorState="blue"
              projectColor="#3b82f6"
              lines={devServerContent}
              className="mock-panel--dev"
            />

            {/* Claude AI — bottom-center */}
            <TerminalPanel
              name="Claude AI"
              indicatorState="yellow"
              lines={claudeContent}
              className="mock-panel--claude"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
