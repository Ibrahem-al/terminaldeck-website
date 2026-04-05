import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Manually splits an element's text into individually-animated characters.
 *
 * DOM structure produced per character:
 *   <span class="word">
 *     <span class="char-mask" style="overflow:clip; display:inline-block">
 *       <span class="char" style="display:inline-block; transform:translateY(100%); opacity:0">
 *         A
 *       </span>
 *     </span>
 *     ...
 *   </span>
 *
 * Words are separated by a non-breaking space (&nbsp;) so line breaks
 * only happen between words, never mid-character.
 */
function splitTextIntoChars(el: HTMLElement): HTMLElement[] {
  const text = el.textContent || '';
  const words = text.split(/\s+/).filter(Boolean);
  const allChars: HTMLElement[] = [];

  // Clear existing content
  el.innerHTML = '';

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';

    for (const char of word) {
      const maskSpan = document.createElement('span');
      maskSpan.className = 'char-mask';
      maskSpan.style.overflow = 'clip';
      maskSpan.style.display = 'inline-block';

      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.style.display = 'inline-block';
      charSpan.style.transform = 'translateY(100%)';
      charSpan.style.opacity = '0';
      charSpan.textContent = char;

      maskSpan.appendChild(charSpan);
      wordSpan.appendChild(maskSpan);
      allChars.push(charSpan);
    }

    el.appendChild(wordSpan);

    // Add a non-breaking space between words (not after the last word)
    if (wordIndex < words.length - 1) {
      const spacer = document.createTextNode('\u00A0');
      el.appendChild(spacer);
    }
  });

  return allChars;
}

/**
 * Handles [data-reveal-text] elements.
 *
 * Splits text into characters, then animates each character into view
 * with a staggered reveal driven by ScrollTrigger.
 */
export function initRevealText(el: HTMLElement): void {
  const chars = splitTextIntoChars(el);

  if (chars.length === 0) return;

  gsap.to(chars, {
    y: 0,
    autoAlpha: 1,
    duration: 0.75,
    ease: 'power2.out',
    stagger: {
      amount: 0.75,
    },
    scrollTrigger: {
      trigger: el,
      start: '0% 100%',
      toggleActions: 'play none none none',
    },
  });
}
