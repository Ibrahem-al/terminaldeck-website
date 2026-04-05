import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizes = { sm: 28, md: 36, lg: 48 };

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const s = sizes[size];
  const fontSize = s * 0.5;

  return (
    <a href="#" className="logo" style={{ display: 'flex', alignItems: 'center', gap: s * 0.35, textDecoration: 'none' }}>
      <svg viewBox="0 0 40 40" width={s} height={s} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#1a1a2e" />
        <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="#2a2a44" strokeWidth="1" />
        <text x="7" y="28" fill="#4a9eff" fontFamily="monospace" fontSize="20" fontWeight="bold">&gt;_</text>
      </svg>
      {showText && (
        <span style={{ fontSize, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 300, letterSpacing: '-0.02em' }}>
          Terminal<span style={{ fontWeight: 700 }}>Deck</span>
        </span>
      )}
    </a>
  );
};
