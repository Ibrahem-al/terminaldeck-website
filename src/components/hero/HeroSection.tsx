import React from 'react';
import { Section } from '../layout/Section';
import { Button } from '../shared/Button';
import { HeroMockup } from './HeroMockup';
import { HeroParticles } from './HeroParticles';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  return (
    <Section id="hero" theme="dark" className="hero" fullHeight>
      <HeroParticles scrollProgress={0} />

      <div className="hero__content">
        <div className="hero__text">
          <h1 data-reveal-text>Your terminals, spatially organized</h1>
          <p className="hero__subtitle" data-fade="up">
            An infinite canvas for power users who manage dozens of terminals.
            Arrange, snap, group, and monitor everything at a glance.
          </p>
          <div className="hero__actions" data-fade="up">
            <Button href="#download" variant="primary" size="lg">
              Download for Windows
            </Button>
            <Button href="#download" variant="secondary" size="lg">
              Download for macOS
            </Button>
          </div>
        </div>

        <div className="hero__mockup">
          <HeroMockup />
        </div>
      </div>
    </Section>
  );
};
