import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ThemeColors {
  canvas: string;
  panel: string;
  text: string;
  accent: string;
  titlebar: string;
  sidebar: string;
  border: string;
}

const THEMES: { name: string; colors: ThemeColors }[] = [
  {
    name: 'Dark',
    colors: {
      canvas: '#0f0f1a',
      panel: '#1a1a2e',
      text: '#e0e0e0',
      accent: '#4a9eff',
      titlebar: '#0a0a14',
      sidebar: '#121222',
      border: '#2a2a44',
    },
  },
  {
    name: 'Light',
    colors: {
      canvas: '#f5f5f5',
      panel: '#ffffff',
      text: '#1a1a2e',
      accent: '#2563eb',
      titlebar: '#e5e5e5',
      sidebar: '#f0f0f0',
      border: '#d1d5db',
    },
  },
  {
    name: 'Solarized',
    colors: {
      canvas: '#002b36',
      panel: '#073642',
      text: '#839496',
      accent: '#268bd2',
      titlebar: '#001f27',
      sidebar: '#002430',
      border: '#0a4a5c',
    },
  },
  {
    name: 'Sol. Light',
    colors: {
      canvas: '#fdf6e3',
      panel: '#eee8d5',
      text: '#657b83',
      accent: '#268bd2',
      titlebar: '#f0e9d6',
      sidebar: '#f5eed6',
      border: '#d6cdb7',
    },
  },
];

export const ThemeDemo: React.FC = () => {
  const [themeIndex, setThemeIndex] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoCycling, setAutoCycling] = useState(true);

  const startAutoCycle = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      setThemeIndex((prev) => (prev + 1) % THEMES.length);
    }, 3000);
    setAutoCycling(true);
  }, []);

  // Auto-cycle
  useEffect(() => {
    startAutoCycle();
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [startAutoCycle]);

  const handleThemeClick = (index: number) => {
    setThemeIndex(index);

    // Pause auto-cycle for 8s
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setAutoCycling(false);

    pauseTimerRef.current = setTimeout(() => {
      startAutoCycle();
    }, 8000);
  };

  const c = THEMES[themeIndex].colors;
  const transStyle = 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease';

  return (
    <div
      style={{
        background: '#0f0f1a',
        borderRadius: 12,
        padding: 24,
        height: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Mini app mockup */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          height: 260,
          borderRadius: 8,
          overflow: 'hidden',
          border: `1px solid ${c.border}`,
          background: c.canvas,
          transition: transStyle,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 28,
            background: c.titlebar,
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: 6,
            transition: transStyle,
            flexShrink: 0,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span
            style={{
              marginLeft: 8,
              fontSize: 10,
              color: c.text,
              fontFamily: 'var(--font-mono)',
              opacity: 0.6,
              transition: transStyle,
            }}
          >
            TerminalDeck — {THEMES[themeIndex].name}
          </span>
        </div>

        {/* Body: sidebar + panels */}
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Sidebar strip */}
          <div
            style={{
              width: 36,
              background: c.sidebar,
              borderRight: `1px solid ${c.border}`,
              transition: transStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 0',
              gap: 10,
            }}
          >
            {[c.accent, c.text + '44', c.text + '44'].map((col, i) => (
              <div
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: i === 0 ? col : 'transparent',
                  border: `1px solid ${i === 0 ? col : c.border}`,
                  transition: transStyle,
                }}
              />
            ))}
          </div>

          {/* Canvas area with 2 panels */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              background: c.canvas,
              transition: transStyle,
              padding: 12,
              display: 'flex',
              gap: 10,
            }}
          >
            {/* Panel 1 */}
            <div
              style={{
                flex: 1,
                background: c.panel,
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                overflow: 'hidden',
                transition: transStyle,
              }}
            >
              <div
                style={{
                  height: 22,
                  background: c.titlebar,
                  borderBottom: `1px solid ${c.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  gap: 6,
                  transition: transStyle,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: c.accent,
                    boxShadow: `0 0 4px ${c.accent}`,
                    transition: transStyle,
                  }}
                />
                <span style={{ fontSize: 9, color: c.text, transition: transStyle }}>
                  claude-ai
                </span>
              </div>
              <div
                style={{
                  padding: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: c.text,
                  opacity: 0.6,
                  transition: transStyle,
                }}
              >
                <div>{'> Analyzing code...'}</div>
                <div style={{ marginTop: 4, color: c.accent, transition: transStyle }}>
                  Found 3 improvements
                </div>
              </div>
            </div>

            {/* Panel 2 */}
            <div
              style={{
                flex: 1,
                background: c.panel,
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                overflow: 'hidden',
                transition: transStyle,
              }}
            >
              <div
                style={{
                  height: 22,
                  background: c.titlebar,
                  borderBottom: `1px solid ${c.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  gap: 6,
                  transition: transStyle,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#4aff7a',
                    boxShadow: '0 0 4px #4aff7a',
                  }}
                />
                <span style={{ fontSize: 9, color: c.text, transition: transStyle }}>
                  bash
                </span>
              </div>
              <div
                style={{
                  padding: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: c.text,
                  opacity: 0.6,
                  transition: transStyle,
                }}
              >
                <div>
                  <span style={{ color: '#22c55e' }}>$</span> git status
                </div>
                <div style={{ marginTop: 4 }}>On branch main</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {THEMES.map((theme, i) => (
          <button
            key={theme.name}
            onClick={() => handleThemeClick(i)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              border: `1px solid ${i === themeIndex ? theme.colors.accent : '#2a2a44'}`,
              background: i === themeIndex ? theme.colors.accent + '18' : 'transparent',
              color: i === themeIndex ? theme.colors.accent : '#8888aa',
              transition: 'all 0.3s ease',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: theme.colors.canvas,
                border: `1px solid ${theme.colors.border}`,
                marginRight: 6,
                verticalAlign: 'middle',
              }}
            />
            {theme.name}
            {i === themeIndex && autoCycling && (
              <span style={{ marginLeft: 6, opacity: 0.5 }}>&#x25CF;</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
