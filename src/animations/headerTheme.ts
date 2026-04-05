import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Resolves the site header element.
 *
 * Checks the global __headerRef first (useful when the header is
 * rendered by a framework component that stores its ref), then
 * falls back to a standard DOM query.
 */
function getHeader(): HTMLElement | null {
  const globalRef = (window as any).__headerRef as HTMLElement | undefined;
  if (globalRef) return globalRef;
  return document.querySelector<HTMLElement>('header');
}

/**
 * Sets up ScrollTrigger-driven header theme switching.
 *
 * For every section (or element) carrying a [data-theme] attribute,
 * a ScrollTrigger is created that fires when the section's top edge
 * crosses the vertical midpoint of the header. On enter the header's
 * own data-theme is updated to match the section; on leave-back the
 * previous section's theme is restored.
 *
 * Additionally, when the <footer> enters the viewport the header
 * receives a "header--hidden" class so it can be visually dismissed.
 */
export function initHeaderTheme(): void {
  const header = getHeader();
  if (!header) return;

  const headerHeight = header.offsetHeight;
  const headerMidpoint = headerHeight / 2;

  // ------------------------------------------------------------------
  // Section theme switching
  // ------------------------------------------------------------------
  const sections = document.querySelectorAll<HTMLElement>('[data-theme]');

  sections.forEach((section) => {
    const theme = section.getAttribute('data-theme');
    if (!theme) return;

    ScrollTrigger.create({
      trigger: section,
      start: () => `top ${headerMidpoint}px`,
      end: () => `bottom ${headerMidpoint}px`,
      onToggle: (self) => {
        if (self.isActive) {
          header.setAttribute('data-theme', theme);
        }
      },
    });
  });

  // ------------------------------------------------------------------
  // Footer: hide header when the footer is in view
  // ------------------------------------------------------------------
  const footer = document.querySelector<HTMLElement>('footer');
  if (!footer) return;

  ScrollTrigger.create({
    trigger: footer,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => header.classList.add('header--hidden'),
    onLeaveBack: () => header.classList.remove('header--hidden'),
    onEnterBack: () => header.classList.add('header--hidden'),
    onLeave: () => header.classList.remove('header--hidden'),
  });
}
