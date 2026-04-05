import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Handles [data-stagger="fadein"|"fadeup"] parent containers.
 *
 * Queries all direct or nested [data-item] children and staggers
 * their entrance animation.
 *
 * Variants:
 *   - "fadein"  : items fade from autoAlpha 0 to 1
 *   - "fadeup"  : items fade in + translate from y: 30 to y: 0
 */
export function initStagger(parent: HTMLElement): void {
  const variant = parent.getAttribute('data-stagger') || 'fadein';
  const items = parent.querySelectorAll<HTMLElement>('[data-item]');

  if (items.length === 0) return;

  // Set initial hidden state on all items
  const fromVars: gsap.TweenVars = { autoAlpha: 0 };
  if (variant === 'fadeup') {
    fromVars.y = 30;
  }
  gsap.set(items, fromVars);

  // Calculate stagger: distribute 0.8s across all items
  const staggerAmount = 0.8 / items.length;

  // Build the animation target values
  const toVars: gsap.TweenVars = {
    autoAlpha: 1,
    duration: 0.8,
    ease: 'power2.out',
    stagger: staggerAmount,
    scrollTrigger: {
      trigger: parent,
      start: '0% 85%',
      toggleActions: 'play none none none',
    },
  };

  if (variant === 'fadeup') {
    toVars.y = 0;
  }

  gsap.to(items, toVars);
}
