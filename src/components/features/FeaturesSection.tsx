import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Section } from '../layout/Section';
import { features } from '../../data/features';
import { SnapDemo } from './SnapDemo';
import { IndicatorDemo } from './IndicatorDemo';
import { ThemeDemo } from './ThemeDemo';
import { LayoutDemo } from './LayoutDemo';
import './FeaturesSection.css';

gsap.registerPlugin(ScrollTrigger);

export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;
    if (window.innerWidth < 1025) return; // No pinning on mobile/tablet

    const section = sectionRef.current;
    const grid = gridRef.current;
    const headerHeight = 72;

    const trigger = ScrollTrigger.create({
      trigger: grid,
      endTrigger: section,
      pin: grid,
      start: () => `top ${headerHeight}px`,
      end: () => 'bottom bottom',
      onUpdate: (self) => {
        const idx = Math.min(
          features.length - 1,
          Math.floor(self.progress * features.length)
        );
        setActiveIndex(idx);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const demoComponents: Record<string, React.ReactNode> = {
    canvas: <CanvasDemo />,
    snap: <SnapDemo />,
    indicators: <IndicatorDemo />,
    embedding: <EmbeddingDemo />,
    focus: <FocusDemo />,
    themes: <ThemeDemo />,
  };

  return (
    <Section id="features" theme="dark" style={{ minHeight: '300vh' }}>
      <div ref={sectionRef} className="features-section">
        <div className="container">
          <h2 data-reveal-text>
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
          <p className="features-subtitle" data-fade="up">
            Six core capabilities. Zero bloat. Built for power users who value
            speed and clarity.
          </p>
        </div>

        <div ref={gridRef} className="features-grid container">
          {/* Left: Feature tabs */}
          <div className="features-tabs">
            {features.map((feature, i) => (
              <button
                key={feature.id}
                className={`features-tab ${
                  i === activeIndex ? 'features-tab--active' : ''
                }`}
                onClick={() => setActiveIndex(i)}
              >
                <span className="features-tab__icon">{feature.icon}</span>
                <div>
                  <div className="features-tab__title">{feature.title}</div>
                  <div className="features-tab__subtitle">
                    {feature.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Visual demo */}
          <div className="features-demo">
            <div className="features-demo__content">
              {demoComponents[features[activeIndex].id] || <CanvasDemo />}
            </div>
            <p className="features-demo__description">
              {features[activeIndex].description}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

/* ========================================
   Inline placeholder demos
   ======================================== */

const CanvasDemo: React.FC = () => (
  <div
    className="demo-placeholder"
    style={{
      background: '#0f0f1a',
      borderRadius: 12,
      padding: 24,
      height: 360,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        border: '1px dashed #2a2a44',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Miniature panels */}
      {[
        { x: 10, y: 10, w: 45, h: 40, color: '#ef4444' },
        { x: 52, y: 10, w: 38, h: 40, color: '#3b82f6' },
        { x: 20, y: 55, w: 50, h: 40, color: '#8b5cf6' },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.w}%`,
            height: `${p.h}%`,
            background: '#1a1a2e',
            borderRadius: 6,
            border: `1px solid ${p.color}40`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              height: 20,
              background: '#1e1e3a',
              borderRadius: '6px 6px 0 0',
              borderBottom: '1px solid #2a2a44',
            }}
          />
        </div>
      ))}
      {/* Pan indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          fontSize: 10,
          color: '#555',
          fontFamily: 'var(--font-mono)',
        }}
      >
        zoom: 100% · scroll to pan
      </div>
    </div>
  </div>
);

const EmbeddingDemo: React.FC = () => (
  <div
    className="demo-placeholder"
    style={{
      background: '#0f0f1a',
      borderRadius: 12,
      padding: 24,
      height: 360,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        gap: 12,
      }}
    >
      {/* Terminal panel */}
      <div
        style={{
          flex: 1,
          background: '#1a1a2e',
          borderRadius: 8,
          border: '1px solid #2a2a44',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 24,
            background: '#1e1e3a',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            gap: 6,
            borderBottom: '1px solid #2a2a44',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4a9eff',
              animation: 'indicator-pulse 1.5s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: 10, color: '#e0e0e0' }}>Terminal</span>
        </div>
        <div
          style={{
            padding: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#8888aa',
          }}
        >
          <div>
            <span style={{ color: '#22c55e' }}>$</span> npm run dev
          </div>
          <div>Server running...</div>
        </div>
      </div>
      {/* Embedded browser */}
      <div
        style={{
          flex: 1,
          background: '#1a1a2e',
          borderRadius: 8,
          border: '1px solid #f9731640',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 24,
            background: '#1e1e3a',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            gap: 6,
            borderBottom: '1px solid #2a2a44',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#f97316',
              boxShadow: '0 0 4px #f97316',
            }}
          />
          <span style={{ fontSize: 10, color: '#e0e0e0' }}>
            Chrome — localhost
          </span>
        </div>
        <div
          style={{
            padding: 8,
            background: '#fff',
            height: 'calc(100% - 24px)',
            borderRadius: '0 0 8px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center', color: '#666', fontSize: 11 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: 'inline' }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            Live Preview
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FocusDemo: React.FC = () => (
  <div
    className="demo-placeholder"
    style={{
      background: '#0f0f1a',
      borderRadius: 12,
      padding: 24,
      height: 360,
      position: 'relative',
    }}
  >
    {/* Dimmed panels */}
    {[
      { x: '5%', y: '5%', w: '42%', h: '42%' },
      { x: '52%', y: '5%', w: '42%', h: '42%' },
      { x: '5%', y: '52%', w: '42%', h: '42%' },
    ].map((p, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: p.x,
          top: p.y,
          width: p.w,
          height: p.h,
          background: '#1a1a2e',
          borderRadius: 6,
          opacity: 0.3,
          border: '1px solid #2a2a44',
        }}
      >
        <div
          style={{
            height: 20,
            background: '#1e1e3a',
            borderRadius: '6px 6px 0 0',
          }}
        />
      </div>
    ))}
    {/* Focus overlay */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
      }}
    />
    {/* Focused panel */}
    <div
      style={{
        position: 'absolute',
        left: '15%',
        top: '10%',
        width: '70%',
        height: '80%',
        background: '#1a1a2e',
        borderRadius: 8,
        zIndex: 2,
        boxShadow:
          '0 0 0 2px rgba(99,102,241,0.7), 0 4px 24px rgba(0,0,0,0.5)',
        border: '1px solid #2a2a44',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 28,
          background: '#1e1e3a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: 8,
          borderBottom: '1px solid #2a2a44',
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#ffda4a',
            boxShadow: '0 0 5px #ffda4a',
          }}
        />
        <span style={{ fontSize: 11, color: '#e0e0e0', fontWeight: 500 }}>
          Claude AI
        </span>
      </div>
      <div
        style={{
          padding: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#4a9eff',
        }}
      >
        <div style={{ color: '#8888aa' }}>$ claude</div>
        <div style={{ marginTop: 8 }}>
          {'> What would you like to work on?'}
        </div>
        <div style={{ marginTop: 4, color: '#e0e0e0' }}>
          Refactor the auth middleware...
        </div>
        <div style={{ marginTop: 12 }}>
          I'll help you refactor the auth middleware. Let me start by analyzing
          the current implementation...
        </div>
      </div>
    </div>
    {/* Label */}
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        fontSize: 11,
        color: '#8888aa',
        background: '#0f0f1a',
        padding: '4px 12px',
        borderRadius: 4,
        border: '1px solid #2a2a44',
      }}
    >
      Press F11 to focus · Esc to exit
    </div>
  </div>
);
