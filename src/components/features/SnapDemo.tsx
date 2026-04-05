import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const SnapDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelBRef = useRef<HTMLDivElement>(null);
  const guideHRef = useRef<SVGLineElement>(null);
  const guideVRef = useRef<SVGLineElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || !panelBRef.current) return;

    const panelB = panelBRef.current;
    const guideH = guideHRef.current;
    const guideV = guideVRef.current;

    // Initial position: offset
    gsap.set(panelB, { x: 200, y: 40 });
    gsap.set([guideH, guideV], { opacity: 0 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

    // 1. Hold at offset position
    tl.to({}, { duration: 1.2 });

    // 2. Panel B slides left to snap flush with Panel A
    tl.to(panelB, {
      x: 184,
      y: 10,
      duration: 0.7,
      ease: 'power2.out',
    });

    // 3. Snap guides fade in
    tl.to([guideH, guideV], {
      opacity: 1,
      duration: 0.25,
      ease: 'power1.in',
    }, '-=0.15');

    // 4. Hold snapped
    tl.to({}, { duration: 1.8 });

    // 5. Guides fade out
    tl.to([guideH, guideV], {
      opacity: 0,
      duration: 0.2,
      ease: 'power1.out',
    });

    // 6. Panel B slides back to offset
    tl.to(panelB, {
      x: 200,
      y: 40,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    // 7. Hold at offset before loop
    tl.to({}, { duration: 0.6 });

    tlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        background: '#0f0f1a',
        borderRadius: 12,
        padding: 24,
        height: 360,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Panel A (stationary) */}
        <div
          style={{
            position: 'absolute',
            left: 4,
            top: 10,
            width: 180,
            height: 120,
            background: '#1a1a2e',
            borderRadius: 6,
            border: '1px solid #ef444440',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 20,
              background: '#1e1e3a',
              borderRadius: '6px 6px 0 0',
              borderBottom: '1px solid #2a2a44',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              gap: 4,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#ef4444',
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: '#8888aa',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Panel A
            </span>
          </div>
          <div
            style={{
              padding: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#555',
            }}
          >
            <div>
              <span style={{ color: '#22c55e' }}>$</span> node server.js
            </div>
            <div style={{ color: '#8888aa' }}>listening on :3000</div>
          </div>
        </div>

        {/* Panel B (animated) */}
        <div
          ref={panelBRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 180,
            height: 120,
            background: '#1a1a2e',
            borderRadius: 6,
            border: '1px solid #3b82f640',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 20,
              background: '#1e1e3a',
              borderRadius: '6px 6px 0 0',
              borderBottom: '1px solid #2a2a44',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              gap: 4,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#3b82f6',
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: '#8888aa',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Panel B
            </span>
          </div>
          <div
            style={{
              padding: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#555',
            }}
          >
            <div>
              <span style={{ color: '#22c55e' }}>$</span> npm test
            </div>
            <div style={{ color: '#4aff7a' }}>All tests passed</div>
          </div>
        </div>

        {/* SVG snap guides */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Horizontal guide (top edge alignment) */}
          <line
            ref={guideHRef}
            x1="0"
            y1="10"
            x2="100%"
            y2="10"
            stroke="#4a9eff66"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          {/* Vertical guide (right edge of A = left edge of B) */}
          <line
            ref={guideVRef}
            x1="184"
            y1="0"
            x2="184"
            y2="100%"
            stroke="#4a9eff66"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
        </svg>

        {/* Bottom label */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: '#555',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
          }}
        >
          magnetic snap · edge alignment
        </div>
      </div>
    </div>
  );
};
