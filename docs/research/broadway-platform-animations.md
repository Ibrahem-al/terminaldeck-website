# Broadway Platform - Complete Animation Reference

> **Purpose**: This document catalogs every animation on [broadwayplatform.com](https://broadwayplatform.com) with implementation details for reproducing them. This is a reference for building the production website.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Smooth Scroll System](#2-smooth-scroll-system)
3. [Preloader](#3-preloader)
4. [Global Animation System (Data Attributes)](#4-global-animation-system-data-attributes)
5. [Header / Navigation](#5-header--navigation)
6. [Mobile Menu (Super Menu)](#6-mobile-menu-super-menu)
7. [Hero / Intro Section](#7-hero--intro-section)
8. [Platform Solutions Carousel](#8-platform-solutions-carousel)
9. [Advantages Section (Pinned Accordion)](#9-advantages-section-pinned-accordion)
10. [Feather / Request-Hand Section](#10-feather--request-hand-section)
11. [FAQ Accordion](#11-faq-accordion)
12. [CTA Section](#12-cta-section)
13. [Blog, Partnership, Footer](#13-blog-partnership-footer)
14. [Button Animations](#14-button-animations)
15. [WebGL Systems](#15-webgl-systems)
16. [CSS Custom Properties & Timing](#16-css-custom-properties--timing)
17. [Responsive Behavior](#17-responsive-behavior)
18. [What They Don't Have](#18-what-they-dont-have)
19. [Implementation Priority](#19-implementation-priority)

---

## 1. Technology Stack

### Libraries (All Bundled, No CDN)

| Library | Version | Purpose |
|---------|---------|---------|
| **GSAP Core** | 3.14.2 | Animation engine |
| **ScrollTrigger** | 3.14.2 | Scroll-driven animations |
| **ScrollSmoother** | 3.14.2 | Smooth scroll (GSAP premium) |
| **ScrollToPlugin** | 3.14.2 | Programmatic scroll |
| **Observer** | 3.14.2 | Input event normalization |
| **Draggable** | 3.14.2 | Drag interaction |
| **InertiaPlugin** | 3.14.2 | Physics-based deceleration |
| **SplitText** | 3.14.2 | Text character/word splitting (GSAP premium) |
| **MotionPathPlugin** | 3.14.2 | SVG path following |

### Lazy-Loaded Chunks

| Chunk | Size | Purpose |
|-------|------|---------|
| `webgl-vendor.js` | 238KB | Custom `WebglSequencer` + `Particles` classes |
| `carousel-vendor.js` | 29KB | Custom `InfiniteSlider` (3D carousel) |
| `swiper-vendor.js` | 68KB | Swiper (mobile fallback carousel) |

### Build System
- **rspack** (Rust-based webpack alternative)
- Asset versioning via query string: `?ver=YYYYMMDDHHMMSS`

### Registration
```js
gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin, Draggable, InertiaPlugin);
// SplitText and ScrollSmoother are also registered in index.js
// MotionPathPlugin is registered in page-home.js
```

---

## 2. Smooth Scroll System

Broadway uses **GSAP ScrollSmoother** (premium plugin) for buttery smooth scrolling on desktop.

### HTML Structure Required
```html
<div id="smooth-wrapper">
  <div id="smooth-content">
    <!-- All page content goes here -->
  </div>
</div>
```

### Configuration
```js
ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.5,    // smoothing intensity (higher = more lag)
  speed: 0.6      // scroll speed multiplier
});
```

### Behavior
- **Desktop only** (above 768px breakpoint) -- killed entirely on mobile
- Supports `data-speed` and `data-lag` attributes on child elements (built into ScrollSmoother)
- `stopScroll()` / `startScroll()` methods pause/unpause the smoother (used during preloader, modals)
- On mobile, scroll locking uses `no-scroll` class + `overflow: clip` on `html, body`

### Implementation Notes
- ScrollSmoother is a **GSAP premium plugin** (requires Club GSAP license or use the free trial for non-commercial)
- Alternative: Lenis smooth scroll (free, similar API) or just use native scroll with `scroll-behavior: smooth`
- The smooth scroll affects ScrollTrigger calculations -- if you use it, all ScrollTrigger instances automatically account for it

---

## 3. Preloader

### Visual
A full-screen overlay with the Broadway logo that "breathes" (pulses in and out) while assets load.

### CSS
```css
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-100);
  transition: opacity 0.8s ease-in-out;
  contain: layout style paint;
}

.preloader-logo {
  animation: preloader-logo-breathe 2s ease-in-out infinite;
  backface-visibility: hidden;
  transform: translateZ(0);        /* GPU acceleration */
  will-change: transform;
  transform-style: preserve-3d;
}

@keyframes preloader-logo-breathe {
  0%, 100% { transform: scale3d(1, 1, 1) translateZ(0); }
  50%      { transform: scale3d(1.06, 1.06, 1) translateZ(0); }
}
```

### JavaScript Logic
```js
class AnimationsController {
  constructor({ preloaderMode: "manual", preloaderTimeout: 300 }) { ... }

  showPreloader() {
    document.documentElement.classList.remove("loaded");
    scrollManager.stopScroll();  // freeze ScrollSmoother
  }

  hidePreloader() {
    scrollManager.startScroll();  // unfreeze ScrollSmoother
    document.documentElement.classList.add("loaded");
    this.initAnimations();  // trigger ALL data-attribute animations
  }
}
```

### Dismiss Flow
1. Page loads, preloader shows with breathing logo
2. Home page: WebGL sequences + Swiper/InfiniteSlider load asynchronously
3. Once all assets loaded, `hidePreloader()` is called
4. CSS transition fades preloader out over 0.8s
5. `loaded` class on `<html>` triggers CSS fallback animations AND JavaScript `initAnimations()`
6. Safety timeout: if `hidePreloader` isn't called within 300ms, it auto-fires

### CSS Fallbacks (when JS animations haven't initialized yet)
```css
.loaded [data-reveal-text],
.loaded [data-fade] {
  animation: 0.6s ease-out 0.3s forwards reveal-fallback;
}

.loaded h1[data-reveal-text] {
  animation: 0.4s ease-out 0.1s forwards reveal-fallback;
}

@keyframes reveal-fallback {
  to { opacity: 1 !important; transform: none !important; }
}
```

---

## 4. Global Animation System (Data Attributes)

Broadway uses a **data-attribute-driven animation registry**. The `AnimationsController` scans the DOM for these attributes and creates GSAP animations for each. This is the backbone of all page animations.

### 4a. `[data-fade]` -- Fade In / Fade Up

**Usage**: Applied to any element that should fade in on scroll.

**Variants**:
- `data-fade` or `data-fade="in"` -- simple opacity fade
- `data-fade="up"` -- fade + slide up

**Initial CSS State**:
```css
[data-fade],
[data-fade="in"] {
  opacity: 0;
}

[data-fade="up"] {
  opacity: 0;
  transform: translateY(clamp(24px, 2.083vw, 40px));
}
```

**GSAP Animation**:
```js
gsap.to(element, {
  autoAlpha: 1,
  y: 0,  // only for "up" variant
  duration: 1,
  ease: "power2.out",  // default
  scrollTrigger: {
    trigger: element,
    start: "0% 100%",    // top of element hits bottom of viewport
    end: "100% 100%",
    toggleActions: "play none none none",
    // OR if scrub is enabled:
    scrub: true
  }
});
```

**Options** (via `data-options` JSON attribute):
- `repeat` -- boolean, allows re-triggering
- `scrub` -- boolean, ties to scroll position
- `start` / `end` -- custom ScrollTrigger positions
- `duration` -- animation duration

**Custom triggers**: `data-fade-start-trigger` and `data-fade-end-trigger` can point to different elements.

---

### 4b. `[data-reveal-text]` -- Character-by-Character Text Reveal

**Usage**: Applied to headings and important text for a dramatic character reveal effect.

**How it works**:
1. GSAP SplitText splits the text into individual characters and words
2. Each character starts translated 100% down (hidden below its line)
3. On scroll trigger, characters animate up with stagger

**Initial CSS State**:
```css
[data-reveal-text] .char {
  overflow: clip;
  transform: translateY(100%);
}

[data-reveal-text] .line {
  transform: translateY(100%);
}

[data-reveal-text] .char-mask {
  line-height: 1.15;
}
```

**JavaScript**:
```js
// Step 1: Split text
SplitText.create(element, {
  autoSplit: true,
  type: "words, chars",      // configurable: "lines", "words, chars", etc.
  mask: "chars",              // creates overflow-clip wrappers
  charsClass: "char",
  wordsClass: "word",
  linesClass: "line"
});

// Step 2: Animate
gsap.to(element.querySelectorAll(".char, .line"), {
  y: 0,
  x: 0,
  autoAlpha: 1,
  stagger: { amount: 0.75 },    // total stagger time spread across all chars
  duration: 0.75,
  ease: "power2.out",
  scrollTrigger: {
    trigger: element,
    start: "top bottom",
    end: "50% 50%",
    toggleActions: "play none none none"
    // OR scrub: true
  }
});
```

**Default config**:
```js
{
  type: "words, chars",
  duration: 0.75,
  scrub: false,
  start: "top bottom",
  end: "50% 50%"
}
```

**Performance note**: Elements already above the viewport on page load get `immediateRender: true` for instant reveal (no scroll needed).

---

### 4c. `[data-stagger]` -- Staggered Group Animation

**Usage**: Applied to a parent element. Its children with `[data-item]` attributes animate in sequence.

**Variants**:
- `data-stagger="fadein"` -- staggered opacity
- `data-stagger="fadeup"` -- staggered fade + slide up

**Initial CSS State**:
```css
[data-stagger="fadein"] [data-item] {
  opacity: 0;
}

[data-stagger="fadeup"] [data-item] {
  opacity: 0;
  transform: translateY(clamp(24px, 2.083vw, 40px));
}
```

**JavaScript**:
```js
let items = parent.querySelectorAll("[data-item]");
let staggerAmount = duration / items.length;

gsap.to(items, {
  autoAlpha: 1,
  y: 0,  // only for "fadeup"
  stagger: staggerAmount,
  scrollTrigger: {
    trigger: parent,
    start: "0% 100%",
    toggleActions: "play none none none"
  }
});
```

---

### 4d. `[data-scale]` -- Scale Reveal

**Usage**: Decorative lines and dividers that scale from 0 to full size.

**Variants**:
- `data-scale` or `data-scale="y"` -- vertical scale (scaleY: 0 to 1)
- `data-scale="x"` -- horizontal scale (scaleX: 0 to 1)

**Initial CSS State**:
```css
[data-scale],
[data-scale="y"] {
  transform: scaleY(0);
}

[data-scale="x"] {
  transform: scaleX(0);
}
```

---

### 4e. `[data-move]` -- Position Shift

**Usage**: Elements that slide to their final position on scroll.

**Variants**:
- `data-move="y"` -- vertical movement (y to 0)
- `data-move="x"` -- horizontal movement (x to 0)

---

### 4f. `[data-pin]` -- ScrollTrigger Pin

**Usage**: Pins an element in place while the user scrolls past.

**Configuration** (via JSON in data attribute):
```js
{
  pinSpacing: true,   // default
  start: "0% 0%",     // default
  end: "100% 0%"      // default
}
```

**Supports**:
- `data-pin-start-trigger` -- external start trigger element
- `data-pin-end-trigger` -- external end trigger element
- `data-pin-name` -- debug name

---

### 4g. `[data-unclip]` -- Clip-Path Reveal

**Usage**: Elements that reveal by expanding a clip-path from inset to full.

**Animation**:
```js
gsap.timeline({
  scrollTrigger: {
    trigger: element,
    scrub: 1,
    start: "clamp(0% 75%)",
    end: "+=50%"
  }
}).fromTo(element,
  { clipPath: "inset(25% 25% 25% 25%)" },
  { clipPath: "inset(0% 0% 0% 0%)" }
);
```

---

### 4h. `[data-reveal-numbers]` -- Counting Number Animation

**Usage**: Numbers that count up from 0 to their target value.

**How it works**:
1. Uses a `TreeWalker` to find all text nodes containing numbers
2. Regex: `/\b(\d+(\.\d+)?)\b/g`
3. Animates from 0 to target over 2 seconds on scroll trigger
4. Supports decimals

---

### 4i. `[data-parallax-pointer]` -- Mouse-Following Parallax

**Usage**: Container element. Children with `[data-parallax-item]` move in response to mouse position.

**HTML**:
```html
<div data-parallax-pointer>
  <div data-parallax-item='{"x": 20, "y": 15}'>Moves a lot</div>
  <div data-parallax-item='{"x": 5, "y": 5}'>Moves a little</div>
</div>
```

**JavaScript**:
```js
// On mouseenter: start RAF loop
// On mousemove: calculate offset from container center
container.addEventListener("mousemove", (e) => {
  let rect = container.getBoundingClientRect();
  let offsetX = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
  let offsetY = (e.clientY - rect.top) / rect.height - 0.5;

  items.forEach(item => {
    let config = JSON.parse(item.dataset.parallaxItem);
    gsap.to(item, {
      x: offsetX * config.x,
      y: offsetY * config.y,
      duration: 0.6,
      ease: "power2.out"
    });
  });
});

// On mouseleave: return to center
container.addEventListener("mouseleave", () => {
  items.forEach(item => {
    gsap.to(item, { x: 0, y: 0, duration: 0.6, ease: "power2.out" });
  });
});
```

---

### 4j. `[data-reveal-collapse]` -- Three-Phase Scroll (Reveal, Hold, Collapse)

**Usage**: Full-section scroll animation with clip-path reveal, parallax background, then collapse.

**Three phases**:
1. **Reveal** (top enters bottom of viewport -> top reaches top of viewport):
   `clip-path: inset(50%)` -> `inset(0%)`
2. **Background parallax** (full section scroll): `y: 0` -> `y: "-50%"` on `[data-section-bg]`
3. **Collapse** (bottom of section at 80% viewport -> end): `clip-path: inset(0%)` -> `inset(50%)`

**Config**:
```js
{
  scrub: 0.5,
  revealStart: "top bottom",
  revealEnd: "top top",
  collapseStart: "bottom 80%"
}
```

---

### 4k. `[data-reveal-img]` -- Image Clip Reveal

**Usage**: Images that reveal from bottom to top via clip-path.

**Initial CSS State**:
```css
[data-reveal-img] img {
  clip-path: inset(100% 0% 0%);
}
```

**Animation**: `clip-path: inset(100% 0% 0%)` -> `inset(0% 0% 0%)`

---

### 4l. `[data-filter="grayscale"]` -- Grayscale to Color

**Usage**: Images that start grayscale and transition to full color on scroll.

**CSS**: `filter: grayscale(100%)` -> `filter: grayscale(0%)`

---

## 5. Header / Navigation

### Theme Switching on Scroll

Each `<section>` has a `data-theme` attribute (`"light"` or `"dark"`). As sections scroll past the header, the header adopts that section's theme.

```js
sections.forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: `0% ${headerHeight / 2}px`,
    end: `bottom ${headerHeight / 2}px`,
    onToggle: ({ isActive }) => {
      if (isActive) {
        header.setAttribute("data-theme", section.dataset.theme);
      }
    }
  });
});
```

### Active Nav Highlighting
The same ScrollTrigger adds an `active` class to the `<a>` in the nav whose `href` matches the section's `id`.

### Header Hide on Footer
```js
ScrollTrigger.create({
  trigger: "footer",
  start: "0% 100%",
  onToggle: ({ isActive }) => {
    header.classList.toggle("hidden", isActive);
  }
});
```

### CSS Transitions
```css
.header {
  transition: 0.9s cubic-bezier(0.25, 1, 0.5, 1);
  transition-property: background-color, transform, opacity;
}

.header.hidden .header-menu {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-100%);
}

.header.at-footer {
  opacity: 0;
  transform: translateY(-100%);
}
```

### Theme CSS Custom Properties
```css
[data-theme="light"] {
  --content-content: var(--dark-100);
  --background-100: var(--light-100);
  /* ... other color tokens */
}

[data-theme="dark"] {
  --content-content: var(--light-100);
  --background-100: var(--dark-100);
  /* ... other color tokens */
}
```

---

## 6. Mobile Menu (Super Menu)

### Hamburger Animation (Pure CSS)

```css
.header-burger {
  --scale: 1;
  --upscale: 0;
  --rotate: 45deg;
}

/* When menu is open */
.header:has(.super-menu-modal[open]) .header-burger {
  --scale: 0;
  --upscale: 1;
}

.header-burger span:first-child,
.header-burger span:nth-child(3) {
  transform: scaleX(var(--scale));
}

.header-burger span:nth-child(2) {
  transform: rotate(var(--rotate)) scale(var(--upscale));
}
```

Three lines collapse: top and bottom lines scale to 0, middle line rotates 45deg and scales up to form an X.

### Menu Open Animation (GSAP Timeline)
```js
let menuTimeline = gsap.timeline({ paused: true })
  .to(wrapper, { x: 0, autoAlpha: 1, duration: 0.6 }, "open")
  .from(listItems, {
    autoAlpha: 0, xPercent: 100,
    stagger: { amount: 0.45 }
  }, "open")
  .from(links, {
    autoAlpha: 0, yPercent: 100,
    stagger: { amount: 0.3 }
  }, "open+=0.45")
  .from(button, { autoAlpha: 0, xPercent: 100 }, "<0.3")
  .from(langsWrapper, { autoAlpha: 0, xPercent: 100 }, "<0.15");

// Open: menuTimeline.play()
// Close: menuTimeline.reverse()
```

### Menu Link Hover (CSS)
```css
.super-menu-modal .super-menu a:hover {
  transform: translateY(-100%);
}

/* Pseudo-element with skew effect */
.super-menu-modal .super-menu a::after {
  content: attr(data-title);
  transform: skewY(-10deg);
  transition: var(--transition-button);  /* 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) */
}

.super-menu-modal .super-menu a:hover::after {
  opacity: 1;
  transform: skewY(0);
}
```

Menu items have a dual-line underline wipe: `:before` wipes out right-to-left, `:after` wipes in left-to-right.

---

## 7. Hero / Intro Section

**Desktop only** (min-width: 1025px). Three simultaneous systems running together.

### 7a. WebGL Image Sequence

A 245-frame AVIF image sequence rendered to a `<canvas>` element via the custom `WebglSequencer` class. This creates the hand/feather visual that transforms as the user scrolls.

```js
let sequencer = new WebglSequencer(canvasElement, {
  name: "home-intro-sequencer",
  totalFrames: 245,
  extension: "avif",
  framePrefix: "frame-",
  framePadding: 5,          // frame-00001.avif format
  skipFrames: 4,            // load every 4th frame (performance)
  interpolation: true,      // smooth between frames
  upscaling: { enabled: true },
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  breakpoints: {
    mobile: {
      width: 768,
      skipFrames: 1,
      basePath: "/assets/img/sequences/home-intro/mobile/"
    },
    desktop: {
      width: Infinity,
      basePath: "/assets/img/sequences/home-intro/desktop/"
    }
  }
});
```

**Scroll binding**:
```js
ScrollTrigger.create({
  trigger: introSection,
  start: "clamp(0% 1%)",
  end: () => `+=${0.65 * sectionHeight}`,
  scrub: true,
  onUpdate: (self) => {
    sequencer.setProgress(self.progress);
  }
});
```

### 7b. Gold Particle System (WebGL)

18,000 gold circle particles with shimmer wave effect, rendered via custom WebGL `Particles` class.

```js
let particles = new Particles(container, {
  density: 1,
  space: "2d",
  shape: "circle",
  size: [1, 3],
  globalAlpha: 1,
  maxCount: 18000,
  colors: {
    start: "#F4D03F",     // bright gold
    end: "#D4A015"        // dark gold
  },
  densityGradient: {
    enable: true,
    distance: 0.5,
    centerDensity: 1,
    edgeDensity: 0.005
  },
  flow: {
    speed: 0.12,
    scale: 0.4
  },
  blur: 0.3,
  depthOfField: 0.6,
  volume: 0.8,
  shimmer: {
    enable: true,
    intensity: 4,
    speed: 1.2,
    density: 0.6,
    wave: {
      enable: true,
      direction: "diagonal",
      width: 0.4,
      speed: 0.025,
      frequency: 0.1
    }
  },
  webgl: {
    antialias: true,
    alpha: true,
    premultipliedAlpha: true,
    depth: false,
    stencil: false,
    powerPreference: "high-performance"
  }
});
```

**Scroll fade-out**: As user scrolls, particles dissolve:
```js
onUpdate: (self) => {
  let progress = self.progress;
  particles.setRenderCount(Math.round(totalCount * (1 - progress)));
  particles.options.flow.scale = 0.4 + 3 * progress;    // expands
  particles.options.globalAlpha = 1 - progress;           // fades out
  particles._applyUniforms();
}
```

### 7c. Wrapper Movement & Rotation

The animation wrapper is pinned and rotates as the sequence plays:

```js
// Pin the wrapper
ScrollTrigger.create({
  trigger: animationWrapper,
  pin: true,
  pinSpacing: false,
  start: "clamp(50% 50%)",
  end: () => `+=${2 * sectionHeight}`
});

// Rotation timeline
gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: { /* ... */ }
})
  .to(sequence, { rotate: -10, duration: 0.3 }, "0%")
  .to(sequence, { rotate: 75, duration: 0.7 }, "30%")
  .to(wrapper, { x: 0, duration: 0.7 }, "30%")
  .to(wrapper, { autoAlpha: 0, duration: 0.3 }, "70%");

// Background image parallax
gsap.to(backgroundImage, { rotate: -30, scale: 1.25 });
```

### 7d. Hero Text

Hero headings use the global `[data-reveal-text]` system for character-by-character reveals. Subtext uses `[data-fade="up"]`.

---

## 8. Platform Solutions Carousel

### Desktop (min-width: 769px): 3D InfiniteSlider

A custom 3D carousel with perspective, drag, and wheel interaction.

```js
let slider = new InfiniteSlider(container, {
  perspective: -3000,          // CSS perspective value
  centerSlides: true,
  slideToClicked: false,
  dragSensitivity: 0.05,
  wheelSensitivity: 1.2,
  wheelDeadzone: 0,
  minSlides: 24,               // minimum slides (ghosts if needed)
  ghostSlides: true,           // duplicate slides for infinite loop
  bounce: true,                // elastic edge bounce
  reveal: true,                // initial reveal animation
  revealDuration: 1.5,
  pagination: {
    container: paginationElement,
    bulletClass: "slider-pagination-bullet",
    bulletActiveClass: "active"
  }
});
```

**Scroll reveal**: Hidden initially, revealed when scrolling into view:
```js
ScrollTrigger.create({
  trigger: container,
  once: true,
  start: "clamp(0% 75%)",
  onEnter: () => slider.show()
});
```

**Slide state CSS** (proximity-based opacity):
```css
.solutions .slide {
  --mask-opacity: 0;
  --thumb-opacity: 0.1;
  --title-opacity: 0.1;
}

.solutions .slide.active {
  --mask-opacity: 0.9;
  --thumb-opacity: 1;
  --title-opacity: 1;
}

.solutions .slide.next-1,
.solutions .slide.prev-1 {
  --title-opacity: 0.6;
  --thumb-opacity: 0.6;
}

.solutions .slide.next-2,
.solutions .slide.prev-2 {
  --title-opacity: 0.4;
  --thumb-opacity: 0.4;
}

.solutions .slide.next,
.solutions .slide.prev {
  --title-opacity: 0.3;
  --thumb-opacity: 0.3;
}
```

**Interaction**: Custom drag handler with `mousedown`/`mousemove`/`mouseup` tracking. Cursor changes to `grab`/`grabbing`. Click navigates to slide.

### Mobile (max-width: 768px): Swiper Fallback
```js
new Swiper(container, {
  slidesPerView: "auto",
  spaceBetween: 20,
  centeredSlides: true,
  initialSlide: Math.floor(slides.length / 2)
});
```

---

## 9. Advantages Section (Pinned Accordion)

**Desktop only** (min-width: 1025px). A pinned grid where scrolling cycles through advantages.

### Structure
The section has `min-height: 300vh` to create enough scroll distance. A grid with buttons on the left and thumbnails on the right is pinned in the viewport.

### Scroll-Driven Tab Switching
```js
let pinTrigger = ScrollTrigger.create({
  trigger: grid,
  endTrigger: advantagesSection,
  pin: grid,
  start: () => `top ${headerHeight}px`,
  end: () => "bottom bottom",
  onUpdate: (self) => {
    let index = Math.floor(self.progress * buttons.length);
    if (index !== currentIndex && !animating) {
      buttons[index].click();  // programmatically clicks the tab
    }
  }
});
```

### Click-to-Scroll (Manual Navigation)
When a user clicks a tab button directly, it animates the scroll position:
```js
gsap.to(scrollProxy, {
  value: targetScrollPosition,
  duration: 0.5,
  onUpdate: () => {
    pinTrigger.scroll(scrollProxy.value);
  }
});
```

### CSS
```css
.advantages {
  min-height: 300vh;  /* creates scroll distance */
}

.advantages .container-thumbs .thumb {
  opacity: 0;
  transition: opacity var(--transition);  /* 0.3s ease */
  position: absolute;
}

.advantages .container-thumbs .thumb.expanded {
  opacity: 1;
  position: relative;
}

.advantages .list .item.expanded {
  --color: var(--content-brand);  /* highlight color */
}
```

---

## 10. Feather / Request-Hand Section

**This is the signature animation the user specifically asked about.** A feather follows an SVG bezier path as the user scrolls, with a WebGL hand image sequence and gold particles.

### HTML Structure
```html
<section class="request-hand flex-v" data-theme="dark">
  <!-- Invisible SVG path the feather follows -->
  <div class="motion-path svg-icon">
    <svg viewBox="0 0 1411 970" fill="none" preserveAspectRatio="none">
      <path id="featherPath"
        d="M657 1C588.789 178.463 250.5 379.625 15.1755 379.625
           C-2.78996 382.156 -1.98906 399.7 15.1753 406.103
           C167.4 462.887 542.637 524.663 736.265 524.663
           C967.308 524.663 1130.99 597.974 1400.87 679.343
           C1412.25 682.772 1411.16 697.893 1400.87 710.427
           C1338.59 793.805 1117.19 967.5 781.5 967.5"
        stroke="#838383" />
    </svg>
  </div>

  <!-- Background image (lazy loaded) -->
  <div class="section-bg" data-lazy></div>

  <!-- Animation container -->
  <div class="animation flex-c">
    <div class="animation-wrapper">
      <div class="particles"></div>     <!-- Gold WebGL particles -->
      <div class="feather"></div>        <!-- WebGL hand/feather canvas -->
    </div>
  </div>

  <!-- CTA content below -->
</section>
```

### CSS
```css
.request-hand .motion-path {
  opacity: 0;                /* invisible -- only used as a path reference */
  width: 70%;
  height: 80%;
  position: absolute;
  top: -10%;
}

.request-hand .animation {
  pointer-events: none;
  position: absolute;
  inset: 0;
}

.request-hand .animation-wrapper {
  aspect-ratio: 1;
  width: clamp(200px, 31.25vw, 600px);
  position: absolute;
}

.request-hand .animation .feather {
  aspect-ratio: 1;
  width: clamp(200px, 31.25vw, 600px);
}

.request-hand .animation .particles {
  pointer-events: none;
  position: absolute;
  inset: 0;
}
```

### WebGL Hand Image Sequence
```js
let sequencer = new WebglSequencer(featherEl, {
  name: "hand-sequencer",
  totalFrames: 245,
  extension: "avif",
  startIndex: 0,
  framePrefix: "frame-",
  framePadding: 5,
  frameRanges: "77-245",     // only uses frames 77-245
  skipFrames: 2,
  reversed: true,             // plays backwards
  devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  breakpoints: {
    mobile: {
      width: 768,
      basePath: "img/sequences/home-intro/mobile/",
      skipFrames: 4
    },
    desktop: {
      skipFrames: 3,
      width: Infinity,
      basePath: "img/sequences/home-intro/desktop/"
    }
  },
  reloadOnBreakpointChange: false
});
```

### Main Scroll-Driven Timeline (The Core Feather Animation)

After the sequencer loads:

```js
gsap.timeline({
  defaults: { ease: "none", overwrite: "auto" },
  scrollTrigger: {
    trigger: section,
    start: () => "clamp(0% 90%)",
    end: () => "clamp(100% 80%)",
    scrub: true,
    refreshPriority: -1
  }
})

// 1. MOTION PATH -- wrapper follows SVG curve
.to(wrapper, {
  motionPath: {
    path: featherPath,        // the SVG <path> element
    align: featherPath,
    alignOrigin: [0.5, 0.5]  // center of wrapper aligns to path
  },
  duration: 0.95
}, 0)

// 2. ROTATION -- feather rotates as it moves along the path
.to(featherEl, { rotate: 110, duration: 0.25 }, 0)        // 0% -> 25%
.to(featherEl, { rotate: 90,  duration: 0.25 }, 0.25)     // 25% -> 50%
.to(featherEl, { rotate: 35,  duration: 0.25 }, 0.5)      // 50% -> 75%
.to(featherEl, { rotate: 75,  duration: 0.2  }, 0.75)     // 75% -> 95%

// 3. IMAGE SEQUENCE -- hand frames play in sync with scroll
// Progress oscillates: 1->0, 0->0.5, 0.5->0, 0->1, 1->0
.to({ progress: 1 }, {
  progress: 0, duration: 0.25, ease: "none",
  onUpdate() { sequencer.setProgress(this.targets()[0].progress, true); }
}, 0)
.to({ progress: 0 }, {
  progress: 0.5, duration: 0.15, ease: "none",
  onUpdate() { sequencer.setProgress(this.targets()[0].progress, true); }
}, 0.25)
.to({ progress: 0.5 }, {
  progress: 0, duration: 0.1, ease: "none",
  onUpdate() { sequencer.setProgress(this.targets()[0].progress, true); }
}, 0.4)
.to({ progress: 0 }, {
  progress: 1, duration: 0.25, ease: "none",
  onUpdate() { sequencer.setProgress(this.targets()[0].progress, true); }
}, 0.5)
.to({ progress: 1 }, {
  progress: 0, duration: 0.25, ease: "none",
  onUpdate() { sequencer.setProgress(this.targets()[0].progress, true); }
}, 0.75);
```

### The SVG Path Explained

The bezier curve `M657 1C588.789 178.463...` describes this motion:
1. **Start** at upper center (x:657, y:1)
2. **Curve down and left** to the far left (x:15, y:380)
3. **Reverse direction** and sweep right through center (x:736, y:525)
4. **Continue right** to far right edge (x:1401, y:679)
5. **Curve down and left** to finish at center-bottom (x:782, y:968)

The path is contained within a `viewBox="0 0 1411 970"` and uses `preserveAspectRatio="none"` to stretch to the section dimensions.

### Gold Particles (Desktop Only, min-width: 769px)
```js
let particles = new Particles(particlesEl, {
  density: 1,
  space: "2d",
  shape: "circle",
  size: [1, 3],
  globalAlpha: 0,           // starts invisible (opposite of hero!)
  maxCount: 18000,
  colors: { start: "#F4D03F", end: "#D4A015" },
  densityGradient: {
    enable: true,
    distance: 0.3,
    centerDensity: 1,
    edgeDensity: 0.0005
  },
  flow: { speed: 0.2, scale: 3.4 },
  blur: 0.3,
  depthOfField: 0.6,
  volume: 0.8,
  shimmer: {
    enable: true, intensity: 4, speed: 1.2, density: 0.6,
    wave: {
      enable: true, direction: "diagonal", width: 0.4,
      speed: 0.025, frequency: 0.1
    }
  },
  webgl: {
    antialias: true, alpha: true, premultipliedAlpha: true,
    depth: false, stencil: false, powerPreference: "high-performance"
  }
});
```

**Particles fade IN** as user scrolls (opposite of hero where they fade out):
```js
ScrollTrigger.create({
  trigger: section,
  start: "0% 100%",
  end: "50% 0%",
  scrub: true,
  refreshPriority: -2,
  onUpdate(self) {
    let progress = self.progress;
    particles.setRenderCount(Math.round(totalCount * progress));
    particles.options.flow.scale = 3.4 - 3 * progress;   // shrinks as it appears
    particles.options.globalAlpha = progress;               // fades in
    particles._applyUniforms();
  }
});
```

### Footer Parallax (both the animation and background shift down as footer approaches)
```js
gsap.timeline({
  scrollTrigger: { trigger: footer, scrub: true, refreshPriority: -1 }
})
  .to(animationEl, { y: "+=25vh" }, 0)
  .to(sectionBg, { y: "+=20vh" }, 0);
```

---

## 11. FAQ Accordion

### Implementation
Pure JavaScript class toggling -- no GSAP involved.

```js
document.querySelectorAll("[data-accordion]").forEach(accordion => {
  let thumbs = accordion.closest("section").querySelectorAll("[data-thumb]");
  let items = accordion.querySelectorAll(".item");

  items.forEach((item, index) => {
    let button = item.querySelector("button");
    button.addEventListener("click", () => {
      // Toggle expanded state
      thumbs.forEach((thumb, i) => thumb.classList.toggle("expanded", i === index));
      items.forEach((item, i) => item.classList.toggle("expanded", i === index));
    });
  });
});
```

### CSS Height Animation
Uses the modern CSS `grid-template-rows` transition pattern:
```css
.accordion .item .content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--transition);  /* 0.3s ease */
}

.accordion .item.expanded .content {
  grid-template-rows: 1fr;
}

.accordion .item .content > div {
  overflow: hidden;
}
```

Associated thumbnails cross-fade via opacity transition.

---

## 12. CTA Section

**Desktop only** (min-width: 1025px). Another WebGL image sequence.

```js
let sequencer = new WebglSequencer(canvas, {
  name: "cta-sequencer",
  totalFrames: 77,
  framePrefix: "fc-",
  framePadding: 5,
  extension: "avif",
  skipFrames: 2,
  breakpoints: {
    mobile: { width: 768, basePath: "img/sequences/cta/mobile/" },
    desktop: { width: Infinity, basePath: "img/sequences/cta/desktop/" }
  }
});
```

**Scroll binding**:
```js
ScrollTrigger.create({
  trigger: section,
  start: "0% 50%",
  end: () => `+=${1.5 * sectionHeight}`,
  onUpdate: (self) => {
    sequencer.setProgress(self.progress, true);
  }
});
```

**Parallax movement**:
```js
gsap.timeline({
  scrollTrigger: { trigger: section, scrub: true }
}).to(canvas, { y: "+=70vh", autoAlpha: 1 });
```

---

## 13. Blog, Partnership, Footer

These sections use **only the global data-attribute system**:

- `[data-fade]` / `[data-fade="up"]` on containers and elements
- `[data-reveal-text]` on headings for SplitText character reveals
- `[data-stagger="fadein"]` / `[data-stagger="fadeup"]` on card grids
- `[data-scale]` on decorative dividers/lines
- `[data-reveal-img]` on images (clip-path reveal)

No custom section-specific JavaScript.

**Footer background**: Static `footer-bg.webp` loaded via `[data-lazy]` intersection observer.

**Lazy loading** (custom IntersectionObserver):
```js
new IntersectionObserver((entries) => {
  // For iframes: sets src from data-src
  // For videos: copies source data-src, calls video.load()
  // rootMargin: `${window.innerHeight}px` (loads one viewport ahead)
});
```

---

## 14. Button Animations

### Hover Slide Effect (CSS Only)
```css
.btn-wrapper {
  transition: transform var(--transition-button);
  /* 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) */
}

.btn:hover .btn-wrapper {
  transform: translate(calc(24px + clamp(20px, 1.25vw, 24px)));
}
```

### Underline Wipe Effect (CSS Only)
```css
/* Before pseudo-element: wipes OUT (right to left) */
.btn::before {
  transform-origin: 100%;
  transform: scaleX(1);
}

/* After pseudo-element: wipes IN (left to right) */
.btn::after {
  transform-origin: 0;
  transform: scaleX(0);
}

.btn:hover::before {
  transition-delay: 0s;
  transform: scaleX(0);
}

.btn:hover::after {
  transition-delay: 0.2s;
  transform: scaleX(1);
}
```

This creates a "wipe through" effect: the existing underline disappears right-to-left, then a new one appears left-to-right with a slight delay.

---

## 15. WebGL Systems

### WebglSequencer

Custom class (in `webgl-vendor.js`, 238KB) that renders image sequences to a canvas using WebGL.

**Key features**:
- Loads AVIF image frames from a URL pattern
- Renders them to a WebGL canvas
- `setProgress(0-1)` maps scroll position to frame number
- Frame interpolation for smooth transitions between frames
- Responsive breakpoints (different frame sets for mobile/desktop)
- `skipFrames` for performance (load every Nth frame)
- `frameRanges` to use a subset of available frames
- `reversed` flag to play sequence backwards

**Used in 3 places**:
1. Hero intro (245 frames, full sequence)
2. Feather section (245 frames, frames 77-245, reversed)
3. CTA section (77 frames)

### Particles

Custom WebGL particle system (also in `webgl-vendor.js`).

**Key features**:
- Up to 18,000 2D circle particles
- Gold color gradient (`#F4D03F` -> `#D4A015`)
- Density gradient (more particles in center)
- Flow animation (drift movement)
- Shimmer effect with diagonal wave
- Depth of field blur
- `setRenderCount(n)` to show/hide particles progressively
- `_applyUniforms()` to update WebGL uniform values in real-time

**Used in 2 places**:
1. Hero intro (particles fade OUT as user scrolls down)
2. Feather section (particles fade IN as user scrolls down)

---

## 16. CSS Custom Properties & Timing

### Transition Tokens
```css
:root {
  --transition: 0.3s ease;
  --transition-medium: 0.45s ease-in-out;
  --transition-slow: 0.9s cubic-bezier(0.25, 1, 0.5, 1);
  --transition-button: 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}
```

### All @keyframes in the Site
```css
/* Preloader breathing */
@keyframes preloader-logo-breathe {
  0%, 100% { transform: scale3d(1, 1, 1) translateZ(0); }
  50%      { transform: scale3d(1.06, 1.06, 1) translateZ(0); }
}

/* Fallback reveal (when JS hasn't loaded) */
@keyframes reveal-fallback {
  to { opacity: 1 !important; transform: none !important; }
}

@keyframes reveal-char-fallback {
  to { opacity: 1 !important; transform: none !important; }
}

/* Loading spinner */
@keyframes rotate360 {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Swiper preloader */
@keyframes swiper-preloader-spin {
  0%  { transform: rotate(0); }
  to  { transform: rotate(360deg); }
}
```

---

## 17. Responsive Behavior

### Desktop (min-width: 1025px)
- Full experience: ScrollSmoother, WebGL sequences, particles, pinned sections, motion paths
- All data-attribute animations active
- InfiniteSlider (3D carousel) for solutions
- Pinned advantages accordion

### Tablet (769px - 1024px)
- ScrollSmoother killed
- WebGL sequences still active
- Particles still active (min-width: 769px)
- InfiniteSlider for solutions
- Some pinned sections may be simplified

### Mobile (max-width: 768px)
- **All complex animations disabled**:
  ```css
  @media (width <= 767px) {
    [data-reveal-text],
    [data-fade] {
      opacity: 1 !important;
      transform: none !important;
    }
    [data-reveal-text] .char,
    [data-reveal-text] .line {
      transform: none !important;
    }
  }
  ```
- No ScrollSmoother
- No WebGL sequences (static images instead)
- No particles
- No pinned sections
- Swiper replaces InfiniteSlider
- Motion path SVG hidden
- CSS-only transitions for accordions and menus

---

## 18. What They Don't Have

- **No page transitions** (no Barba.js, Swup, Turbo, PJAX)
- **No custom cursor** (only cursor state changes on drag elements)
- **No CSS gradient animations** or moving backgrounds
- **No Lottie animations**
- **No Three.js / 3D scenes** (WebGL is used only for 2D image sequences and particles)
- **No parallax scrolling on text** (only on backgrounds and animation wrappers)
- **No scroll-triggered video playback**
- **No intersection observer animations** (everything is ScrollTrigger-based)

---

## 19. Implementation Priority

### Tier 1 -- Core (must have)
1. **Smooth scroll** (ScrollSmoother or Lenis)
2. **`[data-fade]` system** -- fade in / fade up on scroll
3. **`[data-reveal-text]`** -- SplitText character reveals
4. **`[data-stagger]`** -- staggered group animations
5. **Header theme switching** -- light/dark based on section scroll
6. **Preloader** with breathing animation

### Tier 2 -- Signature (high impact)
7. **Feather motion path** -- MotionPathPlugin + SVG bezier curve + scroll scrub
8. **WebGL image sequences** -- canvas-rendered frame sequences tied to scroll
9. **Gold particle system** -- WebGL particles with shimmer
10. **3D carousel** -- InfiniteSlider with perspective and drag

### Tier 3 -- Polish
11. **Pinned advantages accordion** -- scroll-driven tab switching
12. **Clip-path reveals** (`[data-unclip]`, `[data-reveal-collapse]`)
13. **Mouse parallax** (`[data-parallax-pointer]`)
14. **Number counting** (`[data-reveal-numbers]`)
15. **Button wipe effects**
16. **Mobile menu timeline**
17. **Lazy loading system**

---

## Quick Reference: Data Attribute Cheat Sheet

| Attribute | Effect | Initial State |
|-----------|--------|---------------|
| `data-fade` / `data-fade="in"` | Fade in | `opacity: 0` |
| `data-fade="up"` | Fade in + slide up | `opacity: 0; translateY(24-40px)` |
| `data-reveal-text` | Character-by-character reveal | `.char { translateY(100%) }` |
| `data-stagger="fadein"` | Staggered children fade | Children `opacity: 0` |
| `data-stagger="fadeup"` | Staggered children fade+slide | Children `opacity: 0; translateY()` |
| `data-scale` / `data-scale="y"` | Vertical scale reveal | `scaleY(0)` |
| `data-scale="x"` | Horizontal scale reveal | `scaleX(0)` |
| `data-move="y"` | Slide to position (vertical) | Custom start position |
| `data-move="x"` | Slide to position (horizontal) | Custom start position |
| `data-pin` | Pin element on scroll | Normal flow |
| `data-unclip` | Clip-path inset reveal | `inset(25%)` |
| `data-reveal-numbers` | Count up numbers | Shows `0` |
| `data-parallax-pointer` | Mouse-following children | Center position |
| `data-reveal-collapse` | Reveal + parallax + collapse | `inset(50%)` |
| `data-reveal-img` | Image clip reveal | `inset(100% 0% 0%)` |
| `data-filter="grayscale"` | Grayscale to color | `grayscale(100%)` |
| `data-theme="light/dark"` | Section theme (header reads it) | Set per section |
