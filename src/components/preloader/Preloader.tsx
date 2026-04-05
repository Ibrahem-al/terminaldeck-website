import React, { useEffect, useState } from 'react';
import { Logo } from '../shared/Logo';
import './Preloader.css';

interface Props {
  onComplete: () => void;
}

export const Preloader: React.FC<Props> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Safety timeout: dismiss after 2.5s max
    const timer = setTimeout(() => {
      dismiss();
    }, 2500);

    // Try to dismiss earlier when fonts are loaded
    document.fonts.ready.then(() => {
      setTimeout(dismiss, 400);
    });

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    if (fading) return;
    setFading(true);
    document.documentElement.classList.add('loaded');

    setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 800);
  };

  if (!visible) return null;

  return (
    <div className={`preloader ${fading ? 'preloader--fading' : ''}`}>
      <div className="preloader__inner">
        <div className="preloader__logo">
          <Logo size="lg" showText={false} />
        </div>
        <div className="preloader__text">
          Terminal<span>Deck</span>
        </div>
        <div className="preloader__cursor" />
      </div>
    </div>
  );
};
