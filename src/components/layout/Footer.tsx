import React from 'react';
import { Logo } from '../shared/Logo';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" data-theme="dark">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo size="md" />
            <p className="footer__tagline">Built for developers, by developers.</p>
          </div>

          <div className="footer__links">
            <div className="footer__col">
              <h4 className="footer__heading">Product</h4>
              <a href="#features">Features</a>
              <a href="#demo">Demo</a>
              <a href="#download">Download</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer__col">
              <h4 className="footer__heading">Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Changelog</a>
              <a href="#">Keyboard Shortcuts</a>
            </div>
            <div className="footer__col">
              <h4 className="footer__heading">Connect</h4>
              <a href="https://github.com/Ibrahem-al" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="#">Twitter / X</a>
              <a href="#">Discord</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} TerminalDeck. All rights reserved.</p>
          <p className="footer__legal">
            <a href="#">Privacy Policy</a>
            <span className="footer__dot">·</span>
            <a href="#">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
