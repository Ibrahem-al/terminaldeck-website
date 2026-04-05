import React, { useState } from 'react';
import { Section } from '../layout/Section';
import { faqItems } from '../../data/faq';
import './FAQSection.css';

export const FAQSection: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Section id="faq" theme="dark">
      <div className="container">
        <h2 data-reveal-text>Frequently asked questions</h2>
        <p className="faq-subtitle" data-fade="up">
          Everything you need to know about TerminalDeck.
        </p>

        <div className="faq-list" data-stagger="fadeup">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${expandedIndex === i ? 'faq-item--expanded' : ''}`}
              data-item
            >
              <button className="faq-item__trigger" onClick={() => toggle(i)}>
                <span className="faq-item__question">{item.question}</span>
                <span className="faq-item__icon">
                  {expandedIndex === i ? '−' : '+'}
                </span>
              </button>
              <div className="faq-item__content">
                <div className="faq-item__answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};
