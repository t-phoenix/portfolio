import { useCallback, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Contact from './components/Contact';
import Potshot from './components/Potshot';
import SkyCanvas from './components/aa1/SkyCanvas';
import BootIntro from './components/aa1/BootIntro';
import Cursor from './components/aa1/Cursor';
import MissionNav from './components/aa1/MissionNav';
import LiftoffHero from './components/aa1/LiftoffHero';
import PayloadMarquee from './components/aa1/PayloadMarquee';
import Trajectory from './components/aa1/Trajectory';
import SideQuests from './components/aa1/SideQuests';
import ProofWall from './components/aa1/ProofWall';
import MissionLog from './components/aa1/MissionLog';
import ChapterTitle from './components/aa1/ChapterTitle';
import { EarthriseStatement, MissionFooter } from './components/aa1/Earthrise';
import { useSmoothScroll } from './hooks';
import { useScrollDepthTracking } from './hooks/useAnalytics';
import { trackPageView } from './lib/analytics';

// Mission AA-1: the page is one flight, Earth (hero) to Earthrise (contact).
function App() {
  useSmoothScroll();
  useScrollDepthTracking();
  const [ready, setReady] = useState(false);
  const onBoot = useCallback(() => setReady(true), []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    trackPageView(window.location.pathname, document.title);
  }, []);

  return (
    <div className="relative min-h-screen">
      <SkyCanvas />
      <Cursor />
      <BootIntro onDone={onBoot} />
      <MissionNav />
      <main className="relative z-10 overflow-x-clip">
        <LiftoffHero ready={ready} />
        <PayloadMarquee />
        <Trajectory />
        <SideQuests />
        <ProofWall />
        <MissionLog />
        <div className="mx-auto max-w-7xl px-4 pt-20 md:px-8 md:pt-28">
          <ChapterTitle no="06" stage="Potshot" before="Take a" em="shot" after="at the pot." />
        </div>
        <Potshot />
        <EarthriseStatement />
        <Contact />
        <MissionFooter />
      </main>
      <Analytics />
    </div>
  );
}

export default App;
