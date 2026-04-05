import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Handles [data-fade] and [data-fade="up"] elements.
 *
 * Variants:
 *   - "in"  (default) : fades from opacity 0 to 1
 *   - "up"            : fades in + translates from y: 30 to y: 0
 */
export function initFade(el: HTMLElement): void {
  const variant = el.getAttribute('data-fade') || 'in';

  // Set initial hidden state
  const fromVars: gsap.TweenVars = { autoAlpha: 0 };
  if (variant === 'up') {
    fromVars.y = 30;
  }
  gsap.set(el, fromVars);

  // Animate to visible
  const toVars: gsap.TweenVars = {
    autoAlpha: 1,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: '0% 100%',
      toggleActions: 'play none none none',
    },
  };

  if (variant === 'up') {
    toVars.y = 0;
  }

  gsap.to(el, toVars);
}
