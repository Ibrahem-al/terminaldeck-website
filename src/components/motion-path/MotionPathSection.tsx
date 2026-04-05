import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Section } from '../layout/Section';
import { CursorIcon } from './CursorIcon';
import './MotionPathSection.css';

// SVG path: starts upper-center, curves left, sweeps right, settles bottom-center
const CURSOR_PATH = 'M700 10 C550 200, 100 350, 50 400 C0 430, 30 460, 100 470 C300 520, 600 540, 800 560 C1050 580, 1250 640, 1380 710 C1420 730, 1400 760, 1350 790 C1200 880, 900 960, 700 970';

export const MotionPathSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !wrapperRef.current || !pathRef.current) return;
    if (window.innerWidth < 769) return;

    const ctx = gsap.context(() => {
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'clamp(0% 90%)',
          end: 'clamp(100% 80%)',
          scrub: true,
          refreshPriority: -1,
        },
      })
        .to(wrapperRef.current, {
          motionPath: {
            path: pathRef.current!,
            align: pathRef.current!,
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
          },
          duration: 0.95,
        }, 0)
        // Glow pulse along the journey
        .to(wrapperRef.current, { filter: 'drop-shadow(0 0 24px #4a9eff)', duration: 0.3 }, 0.1)
        .to(wrapperRef.current, { filter: 'drop-shadow(0 0 8px #4a9eff)', duration: 0.2 }, 0.4)
        .to(wrapperRef.current, { filter: 'drop-shadow(0 0 20px #4a9eff)', duration: 0.25 }, 0.6)
        .to(wrapperRef.current, { filter: 'drop-shadow(0 0 6px #4a9eff)', duration: 0.15 }, 0.85);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Section id="motion-path" theme="dark" style={{ minHeight: '200vh', position: 'relative' }}>
      <div ref={sectionRef} className="motion-path-section">
        {/* Invisible SVG path */}
        <div className="motion-path-svg">
          <svg viewBox="0 0 1411 970" fill="none" preserveAspectRatio="none">
            <path ref={pathRef} id="cursorPath" d={CURSOR_PATH} stroke="transparent" />
            {/* Visible faint trail */}
            <path d={CURSOR_PATH} stroke="#4a9eff08" strokeWidth="2" strokeDasharray="8 8" fill="none" />
          </svg>
        </div>

        {/* Cursor icon that follows the path */}
        <div ref={wrapperRef} className="motion-path-cursor">
          <CursorIcon />
        </div>

        {/* Callout text along the journey */}
        <div className="motion-path-callouts">
          <div className="motion-path-callout motion-path-callout--1" data-fade="up">
            <h3>Command your workflow</h3>
            <p>Arrange terminals spatially. See everything. Control everything.</p>
          </div>
          <div className="motion-path-callout motion-path-callout--2" data-fade="up">
            <h3>AI-aware, always informed</h3>
            <p>Indicator lights auto-detect Claude, ChatGPT, Copilot, and more.</p>
          </div>
          <div className="motion-path-callout motion-path-callout--3" data-fade="up">
            <h3>Ship faster, together</h3>
            <p>Embed browsers, editors, and monitoring tools on the same canvas.</p>
          </div>
        </div>
      </div>
    </Section>
  );
};
