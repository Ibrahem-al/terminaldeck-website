import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initFade } from './dataFade';
import { initRevealText } from './dataRevealText';
import { initStagger } from './dataStagger';
import { initScale } from './dataScale';
import { initHeaderTheme } from './headerTheme';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations(): gsap.Context {
  const ctx = gsap.context(() => {
    // Fade animations
    document.querySelectorAll<HTMLElement>('[data-fade]').forEach(initFade);

    // Text reveal (manual SplitText)
    document.querySelectorAll<HTMLElement>('[data-reveal-text]').forEach(initRevealText);

    // Stagger groups
    document.querySelectorAll<HTMLElement>('[data-stagger]').forEach(initStagger);

    // Scale reveals
    document.querySelectorAll<HTMLElement>('[data-scale]').forEach(initScale);

    // Header theme switching
    initHeaderTheme();

    // Refresh ScrollTrigger after all animations are created
    ScrollTrigger.refresh();
  });

  return ctx;
}
