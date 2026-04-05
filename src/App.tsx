import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Preloader } from './components/preloader/Preloader';
import { Header } from './components/layout/Header';
import { HeroSection } from './components/hero/HeroSection';
import { FeaturesSection } from './components/features/FeaturesSection';
import { InteractiveSection } from './components/interactive/InteractiveSection';
import { MotionPathSection } from './components/motion-path/MotionPathSection';
import { HowItWorksSection } from './components/how-it-works/HowItWorksSection';
import { DownloadSection } from './components/download/DownloadSection';
import { FAQSection } from './components/faq/FAQSection';
import { Footer } from './components/layout/Footer';
import { initAnimations } from './animations/AnimationController';

const App: React.FC = () => {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (window.innerWidth < 769) return; // No smooth scroll on mobile

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Initialize GSAP animations after preloader
  useEffect(() => {
    if (!preloaderDone) return;

    // Small delay to ensure DOM is painted
    const timer = setTimeout(() => {
      ctxRef.current = initAnimations();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctxRef.current?.revert();
    };
  }, [preloaderDone]);

  return (
    <>
      <Preloader onComplete={() => setPreloaderDone(true)} />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <InteractiveSection />
        <MotionPathSection />
        <HowItWorksSection />
        <DownloadSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
};

export default App;
