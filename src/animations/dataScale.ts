import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Handles [data-scale], [data-scale="y"], and [data-scale="x"] elements.
 *
 * Variants:
 *   - default / "y" : scales from scaleY(0) to scaleY(1)
 *   - "x"           : scales from scaleX(0) to scaleX(1)
 *
 * The element should have transform-origin set via CSS to control
 * which edge the scale reveals from.
 */
export function initScale(el: HTMLElement): void {
  const variant = el.getAttribute('data-scale') || 'y';

  // Set initial collapsed state
  if (variant === 'x') {
    gsap.set(el, { scaleX: 0 });
  } else {
    gsap.set(el, { scaleY: 0 });
  }

  // Build the animation target values
  const toVars: gsap.TweenVars = {
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: '0% 90%',
      toggleActions: 'play none none none',
    },
  };

  if (variant === 'x') {
    toVars.scaleX = 1;
  } else {
    toVars.scaleY = 1;
  }

  gsap.to(el, toVars);
}
