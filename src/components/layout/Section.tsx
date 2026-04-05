import React from 'react';

interface Props {
  id: string;
  theme?: 'dark' | 'light';
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  fullHeight?: boolean;
}

export const Section: React.FC<Props> = ({ id, theme = 'dark', className = '', children, style, fullHeight }) => {
  return (
    <section
      id={id}
      data-theme={theme}
      className={className}
      style={{
        position: 'relative',
        padding: `var(--section-padding) 0`,
        overflow: 'hidden',
        background: theme === 'light' ? 'var(--bg-primary)' : undefined,
        ...(fullHeight ? { minHeight: '100vh', display: 'flex', alignItems: 'center' } : {}),
        ...style,
      }}
    >
      {children}
    </section>
  );
};
