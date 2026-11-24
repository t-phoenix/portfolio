import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { experiencesData } from "../../data";
import ChapterTitle from "./ChapterTitle";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [...experiencesData].reverse(); // oldest first: the flight goes forward in time

// Desktop: section pins and the stages slide sideways while a flight path draws itself.
// Mobile and reduced motion: a plain vertical list.
const Trajectory = () => {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const year = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const dist = () => el.scrollWidth - window.innerWidth;
        gsap.to(el, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (path.current) path.current.style.strokeDashoffset = String(1 - self.progress);
              if (year.current) year.current.textContent = String(Math.round(2021 + self.progress * 5));
            },
          },
        });
      });
    },
    { scope: section },
  );

  return (
    <section id="experience" ref={section} className="relative overflow-hidden lg:h-screen">
      <svg className="pointer-events-none absolute inset-x-0 bottom-[12%] hidden h-24 w-full lg:block" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 9 C 25 9, 45 7, 60 5 S 85 1, 100 0.5" fill="none" stroke="rgba(238,240,244,.14)" strokeWidth="0.1" />
        <path ref={path} d="M0 9 C 25 9, 45 7, 60 5 S 85 1, 100 0.5" fill="none" stroke="#f46c38" strokeWidth="0.22" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      </svg>
      <span className="pointer-events-none absolute bottom-[6%] right-14 hidden font-mono text-[11px] uppercase tracking-[0.16em] text-dim lg:block">
        T+ <span ref={year} className="text-aurora">2021</span>
      </span>

      <div ref={track} className="flex h-full flex-col gap-6 px-5 py-20 md:px-14 lg:w-max lg:flex-row lg:items-center lg:gap-0 lg:py-0">
        <div className="lg:w-[46vw] lg:shrink-0 lg:pr-[6vw]">
          <ChapterTitle no="02" stage="Trajectory" before="Five stages, one" em="orbit." />
          <p className="mt-6 max-w-md text-starlight/65">
            From a hybrid insurance app in 2021 to $2B+ of private credit bridged onchain. Keep scrolling to fly the route.
          </p>
        </div>

        {STAGES.map((e, i) => (
          <article key={e.company} className="group relative rounded-3xl border border-white/10 bg-[#0b0e15]/90 p-7 lg:mr-[4vw] lg:w-[min(38vw,560px)] lg:shrink-0 lg:p-10">
            <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.16em]">
              <span className="text-aurora">Stage {i + 1}/{STAGES.length}</span>
              <span className="text-dim">{e.period}</span>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <img src={e.logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <h3 className="font-display text-[clamp(36px,4vw,60px)] font-normal leading-none transition-colors group-hover:text-orange">{e.company}</h3>
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-starlight/70">{e.description}</p>
            <a href={e.url} target="_blank" rel="noopener noreferrer" data-cursor="Visit" className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-starlight/80 hover:text-orange">
              Mission site ↗
            </a>
            <span className="absolute -top-px left-10 h-px w-24 bg-gradient-to-r from-transparent via-orange to-transparent" />
          </article>
        ))}

        <div className="flex items-center gap-6 lg:w-[30vw] lg:shrink-0">
          <span className="h-20 w-20 shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,#e9e4da,#9c968c_60%,#5b5750)] shadow-[0_0_60px_rgba(233,228,218,.25)]" aria-hidden="true" />
          <p className="font-display text-4xl leading-tight">
            Next stage:<br /><em className="text-orange">yours?</em>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Trajectory;
