import { motion } from "framer-motion";
import { socialLinksData } from "../../data";
import { getLenis } from "../../hooks/useSmoothScroll";
import { Patch } from "./MissionNav";
import { SocialButtons } from "./BrandIcons";

// the three main networks get brand buttons; the rest stay as text links
const LINKS = socialLinksData.filter((s) => !["Email", "GitHub", "LinkedIn", "Twitter"].includes(s.label));

// Glacier-style statement that opens the contact chapter.
export const EarthriseStatement = () => (
  <section id="earthrise" className="relative flex flex-col items-center justify-center px-5 pb-4 pt-20 text-center md:pt-32">
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-aurora">
      <span className="h-px w-7 bg-aurora" /> 07 · Earthrise <span className="h-px w-7 bg-aurora" />
    </p>
    <motion.h2
      className="mt-8 font-display text-[clamp(64px,13vw,220px)] font-normal leading-[0.85] tracking-[-0.03em]"
      initial={{ opacity: 0, y: 80, filter: "blur(16px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
    >
      Let's launch <em className="text-orange">yours.</em>
    </motion.h2>
    <p className="mt-8 max-w-md text-starlight/60">Product, protocol or a weekend with founders to find what's slowing you down. One message starts it.</p>
  </section>
);

// Closing frame: giant wordmark, links, back to orbit.
export const MissionFooter = () => (
  <footer className="relative overflow-hidden bg-gradient-to-b from-transparent via-ink/70 to-ink/40 px-5 pb-8 pt-10 md:px-14">
    <div className="flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Patch />
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Signal received · © {new Date().getFullYear()} Abhinil Agarwal</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-4 font-mono text-[11px] uppercase tracking-[0.14em]">
        <SocialButtons size="h-10 w-10" />
        {LINKS.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="text-starlight/70 hover:text-orange">
            {s.label}
          </a>
        ))}
        <button onClick={() => getLenis()?.scrollTo(0, { duration: 2.4 }) ?? window.scrollTo({ top: 0 })} className="text-aurora" data-cursor="Orbit">
          Return to orbit ↑
        </button>
      </div>
    </div>
    <p aria-hidden="true" className="mt-8 select-none whitespace-nowrap text-center font-display text-[24vw] leading-[0.75] text-transparent [-webkit-text-stroke:1px_rgba(238,240,244,.24)]">
      Abhinil<em className="text-orange/80 [-webkit-text-stroke:0]">.</em>
    </p>
  </footer>
);
