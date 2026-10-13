'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Achievements from '@/components/Achievements';
import Experience from '@/components/Experience';
import Tools from '@/components/Tools';
import Projects from '@/components/Projects';
import Blog from '@/components/Blog';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollToTop from '@/components/ScrollToTop';
import Potshot from '@/components/Potshot';
import { ScrollProgress } from '@/components/animations';
import { useSmoothScroll } from '@/hooks';
import { useScrollDepthTracking } from '@/hooks/useAnalytics';
import { trackPageView } from '@/lib/analytics';

export function PortfolioClient() {
  useSmoothScroll();
  useScrollDepthTracking();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  }, []);

  useEffect(() => {
    trackPageView(window.location.pathname, document.title);
  }, []);

  return (
    <div className="min-h-screen relative">
      <ScrollProgress />
      <ParticleBackground />
      <ScrollToTop />
      <Navigation />
      <Hero />
      <Experience />
      <Tools />
      <Projects />
      <Blog />
      <Achievements />
      <Potshot />
      <Contact />
      <Footer />
      <Analytics />
    </div>
  );
}
