import React from 'react';
import { Section } from '../layout/Section';
import './HowItWorksSection.css';

const steps = [
  {
    number: '01',
    title: 'Download TerminalDeck',
    description: 'Grab the free installer for Windows or macOS. No account needed, no strings attached.',
    icon: '↓',
  },
  {
    number: '02',
    title: 'Create a project workspace',
    description: 'Organize your terminals by project with color-coded groups. Backend, frontend, DevOps — each gets its own space.',
    icon: '◩',
  },
  {
    number: '03',
    title: 'Spawn terminals and arrange them',
    description: 'Add terminals to the canvas and drag them into position. The magnetic snap engine keeps everything aligned.',
    icon: '⊞',
  },
  {
    number: '04',
    title: 'Run your tools — we handle the rest',
    description: 'Indicator lights track process status automatically. Get notified when tasks complete. Focus when you need to.',
    icon: '◉',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <Section id="how-it-works" theme="light">
      <div className="container">
        <h2 data-reveal-text>How it works</h2>
        <p className="how-subtitle" data-fade="up">
          From download to productivity in under five minutes.
        </p>

        <div className="how-steps" data-stagger="fadeup">
          {steps.map((step) => (
            <div key={step.number} className="how-step" data-item data-unclip>
              <div className="how-step__number">{step.number}</div>
              <div className="how-step__icon">{step.icon}</div>
              <h3 className="how-step__title">{step.title}</h3>
              <p className="how-step__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};
