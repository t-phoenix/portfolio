import { useEffect } from 'react';
import Lenis from 'lenis';

// Global Lenis instance for access from other components
let lenisInstance: Lenis | null = null;

export const getLenis = () => lenisInstance;

export const useSmoothScroll = () => {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Store globally for access from other components
    lenisInstance = lenis;

    // Handle anchor link clicks for smooth scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const targetElement = document.querySelector<HTMLElement>(href);
          if (targetElement) {
            lenis.scrollTo(targetElement, {
              offset: 0,
              duration: 1.2,
            });
          }
        } else if (href === '#') {
          e.preventDefault();
          lenis.scrollTo(0, { duration: 1.2 });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Request animation frame
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      lenisInstance = null;
      lenis.destroy();
    };
  }, []);
};

