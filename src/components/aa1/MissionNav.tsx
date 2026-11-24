import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SocialButtons } from "./BrandIcons";

const STAGES = [
  { no: "00", label: "Liftoff", href: "#home" },
  { no: "01", label: "Payload", href: "#tools" },
  { no: "02", label: "Trajectory", href: "#experience" },
  { no: "03", label: "Side quests", href: "#projects" },
  { no: "04", label: "Proof", href: "#achievements" },
  { no: "05", label: "Log", href: "#blog" },
  { no: "06", label: "Potshot", href: "#potshot" },
  { no: "07", label: "Earthrise", href: "#earthrise" },
];

const MOON_KM = 384400;

export const AVATAR = "https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg";

// Site icon: the pixel avatar in an orange-ringed tile.
export const Patch = ({ className = "" }: { className?: string }) => (
  <span className={`relative block h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-orange/70 ring-offset-2 ring-offset-ink shadow-[0_0_24px_-6px_rgba(244,108,56,.7)] ${className}`}>
    <img src={AVATAR} alt="" className="h-full w-full scale-110 object-cover" />
  </span>
);

const MissionNav = () => {
  const [active, setActive] = useState("#home");
  const [menu, setMenu] = useState(false);
  const alt = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    STAGES.forEach((s) => {
      const el = document.querySelector(s.href);
      if (el) io.observe(el);
    });
    // Altitude readout: the whole page is the 384,400 km trip to the Moon
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const km = Math.round((max > 0 ? window.scrollY / max : 0) * MOON_KM);
      if (alt.current) alt.current.textContent = km.toLocaleString("en-US").padStart(7, "0");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-6 bg-gradient-to-b from-ink via-ink/75 to-transparent px-5 pb-8 pt-5 md:px-14">
        <a href="#home" className="flex items-center gap-3.5" data-cursor="Top">
          <Patch />
          <span className="hidden font-medium tracking-tight sm:inline">Abhinil Agarwal</span>
        </a>
        <nav aria-label="Stages" className="hidden items-center gap-1 rounded-full border border-white/10 bg-ink/50 p-1 backdrop-blur-md xl:flex">
          {STAGES.slice(1).map((s) => (
            <a
              key={s.href}
              href={s.href}
              className={`relative rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                active === s.href ? "text-ink" : "text-dim hover:text-starlight"
              }`}
            >
              {active === s.href && (
                <motion.span layoutId="stage-pill" className="absolute inset-0 rounded-full bg-starlight" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative">{s.label}</span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim md:inline">
            Alt <span ref={alt} className="text-aurora tabular-nums">0000000</span> km
          </span>
          <a href="#contact" className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-105" data-cursor="Talk">
            Contact
          </a>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 xl:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-label={menu ? "Close menu" : "Open menu"}
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 h-px w-4 bg-starlight transition-all ${menu ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-4 bg-starlight transition-all ${menu ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.nav
            aria-label="Stages"
            className="fixed inset-0 z-40 flex flex-col justify-center gap-1 bg-ink/95 px-6 backdrop-blur-xl md:px-14"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            {STAGES.map((s, i) => (
              <motion.a
                key={s.href}
                href={s.href}
                onClick={() => setMenu(false)}
                className="flex items-baseline gap-4 font-display text-[clamp(40px,9vw,88px)] leading-[1.02]"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <span className="font-mono text-xs text-aurora">{s.no}</span>
                <span className={active === s.href ? "italic text-orange" : ""}>{s.label}</span>
              </motion.a>
            ))}
            <SocialButtons className="mt-8" />
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default MissionNav;
