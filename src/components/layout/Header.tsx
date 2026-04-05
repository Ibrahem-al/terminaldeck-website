import React, { useState, useEffect, useRef } from 'react';
import { Logo } from '../shared/Logo';
import { Button } from '../shared/Button';
import './Header.css';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Demo', href: '#demo' },
  { label: 'Download', href: '#download' },
  { label: 'FAQ', href: '#faq' },
];

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Header theme switching is handled by AnimationController.headerTheme
    // Store ref on window for the animation system to find
    if (headerRef.current) {
      (window as any).__headerRef = headerRef.current;
    }
  }, []);

  return (
    <header ref={headerRef} className={`header ${hidden ? 'header--hidden' : ''}`} data-theme="dark">
      <div className="header__inner">
        <Logo size="sm" />

        <nav className="header__nav">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="header__link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <Button href="#download" variant="primary" size="md">
            Download
          </Button>
        </div>

        <button
          className={`header__burger ${mobileOpen ? 'header__burger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="header__mobile-menu">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="header__mobile-link" onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <Button href="#download" variant="primary" size="lg">
            Download Free
          </Button>
        </div>
      )}
    </header>
  );
};
