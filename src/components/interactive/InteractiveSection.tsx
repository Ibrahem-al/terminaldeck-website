import React from 'react';
import { Section } from '../layout/Section';
import { DemoCanvas } from './DemoCanvas';
import { useDemoStore } from './demoStore';
import './InteractiveSection.css';

export const InteractiveSection: React.FC = () => {
  const resetLayout = useDemoStore((s) => s.resetLayout);

  return (
    <Section id="demo" theme="dark" className="interactive">
      <div className="interactive__content">
        <h2 className="interactive__heading" data-reveal-text>
          Try it yourself
        </h2>
        <p className="interactive__subtitle" data-fade="up">
          Drag panels to rearrange. Click a panel to focus. Double-click for focus mode.
        </p>

        {/* Desktop: interactive canvas */}
        <div className="interactive__canvas-wrapper" data-fade="up">
          <DemoCanvas />
        </div>

        {/* Mobile: static mockup fallback */}
        <div className="interactive__mobile-fallback" data-fade="up">
          <div className="interactive__mobile-img-wrapper">
            <svg
              className="interactive__mobile-img"
              viewBox="0 0 680 520"
              xmlns="http://www.w3.org/2000/svg"
              style={{ background: '#0a0a14' }}
            >
              {/* Backend API panel */}
              <rect x="20" y="20" width="280" height="200" rx="8" fill="#1a1a2e" stroke="#22c55e40" strokeWidth="2" />
              <rect x="20" y="20" width="280" height="30" rx="8" fill="#1e1e3a" />
              <rect x="20" y="48" width="280" height="2" rx="0" fill="#2a2a44" />
              <circle cx="34" cy="35" r="3.5" fill="#4aff7a" />
              <text x="46" y="39" fill="#e0e0e0" fontSize="11" fontFamily="monospace">Backend API</text>
              <text x="30" y="70" fill="#c0c0d0" fontSize="10" fontFamily="monospace">$ npm run dev</text>
              <text x="30" y="88" fill="#c0c0d0" fontSize="10" fontFamily="monospace">&gt; server@1.0 dev</text>
              <text x="30" y="106" fill="#c0c0d0" fontSize="10" fontFamily="monospace">Listening on :3000</text>
              <text x="30" y="124" fill="#c0c0d0" fontSize="10" fontFamily="monospace">[200] GET /api/users</text>

              {/* Frontend panel */}
              <rect x="320" y="30" width="280" height="200" rx="8" fill="#1a1a2e" stroke="#3b82f640" strokeWidth="2" />
              <rect x="320" y="30" width="280" height="30" rx="8" fill="#1e1e3a" />
              <rect x="320" y="58" width="280" height="2" rx="0" fill="#2a2a44" />
              <circle cx="334" cy="45" r="3.5" fill="#4a9eff" />
              <text x="346" y="49" fill="#e0e0e0" fontSize="11" fontFamily="monospace">Frontend</text>
              <text x="330" y="80" fill="#c0c0d0" fontSize="10" fontFamily="monospace">$ vite dev</text>
              <text x="330" y="98" fill="#c0c0d0" fontSize="10" fontFamily="monospace">VITE v6.0 ready</text>
              <text x="330" y="116" fill="#c0c0d0" fontSize="10" fontFamily="monospace">localhost:5173</text>
              <text x="330" y="134" fill="#c0c0d0" fontSize="10" fontFamily="monospace">hmr update App.tsx</text>

              {/* Claude AI panel */}
              <rect x="40" y="250" width="280" height="200" rx="8" fill="#1a1a2e" stroke="#8b5cf640" strokeWidth="2" />
              <rect x="40" y="250" width="280" height="30" rx="8" fill="#1e1e3a" />
              <rect x="40" y="278" width="280" height="2" rx="0" fill="#2a2a44" />
              <circle cx="54" cy="265" r="3.5" fill="#ffda4a" />
              <text x="66" y="269" fill="#e0e0e0" fontSize="11" fontFamily="monospace">Claude AI</text>
              <text x="50" y="300" fill="#c0c0d0" fontSize="10" fontFamily="monospace">$ claude</text>
              <text x="50" y="318" fill="#c0c0d0" fontSize="10" fontFamily="monospace">&gt; What to work on?</text>

              {/* Tests panel */}
              <rect x="350" y="270" width="260" height="180" rx="8" fill="#1a1a2e" stroke="#f59e0b40" strokeWidth="2" />
              <rect x="350" y="270" width="260" height="30" rx="8" fill="#1e1e3a" />
              <rect x="350" y="298" width="260" height="2" rx="0" fill="#2a2a44" />
              <circle cx="364" cy="285" r="3.5" fill="#555" />
              <text x="376" y="289" fill="#e0e0e0" fontSize="11" fontFamily="monospace">Tests</text>
              <text x="360" y="320" fill="#c0c0d0" fontSize="10" fontFamily="monospace">$ npm test</text>
              <text x="360" y="338" fill="#c0c0d0" fontSize="10" fontFamily="monospace">PASS utils.test.ts</text>
              <text x="360" y="356" fill="#c0c0d0" fontSize="10" fontFamily="monospace">PASS api.test.ts</text>
              <text x="360" y="374" fill="#c0c0d0" fontSize="10" fontFamily="monospace">22 passed</text>
            </svg>
          </div>
          <p className="interactive__mobile-note">
            Interactive demo available on desktop
          </p>
        </div>

        <button className="interactive__reset" onClick={resetLayout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Reset layout
        </button>
      </div>
    </Section>
  );
};
