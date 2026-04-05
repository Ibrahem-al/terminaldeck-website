import React from 'react';
import './Button.css';

interface Props {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  onClick?: () => void;
}

export const Button: React.FC<Props> = ({ children, href, variant = 'primary', size = 'md', onClick }) => {
  const className = `btn btn--${variant} btn--${size}`;

  if (href) {
    return (
      <a href={href} className={className}>
        <span className="btn__text">{children}</span>
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      <span className="btn__text">{children}</span>
    </button>
  );
};
