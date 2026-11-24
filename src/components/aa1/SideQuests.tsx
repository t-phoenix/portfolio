import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { projectsData } from "../../data";
import ChapterTitle from "./ChapterTitle";
import receipt from "../../assets/projects/ownback/07-receipt.webp";
import read from "../../assets/projects/ownback/08-explode.webp";
import split from "../../assets/projects/ownback/06-turn.webp";
import jar from "../../assets/projects/ownback/09-jars.webp";
import own from "../../assets/projects/ownback/12-vault.webp";
import pie from "../../assets/projects/ownback/pie-3d.webp";

const [LATEST, ...REST] = projectsData;
const EASE = [0.22, 1, 0.36, 1] as const;
const STEP_MS = 4200;

// Ownback's own story, chapter by chapter, using the stills from its launch film.
const CHAPTERS = [
  { name: "Receipt", img: receipt, line: "₹79,900 for an iPhone at Croma. Paid, bagged, done." },
  { name: "Read", img: read, line: "Private AI on 0G reads the receipt and names who made it: Apple, TSMC, Qualcomm, Corning, gold, silver." },
  { name: "Split", img: split, line: "Your 5% becomes $47.75, split 70 / 20 / 10 across all six." },
  { name: "Jar", img: jar, line: "Dollars wait in your USDC jars on Arc. Nothing moves until you sign." },
  { name: "Own", img: own, line: "Tokenized shares land in your own wallet, with a public proof for every step." },
];

const SPLIT = [
  { who: "Apple", pct: 70, usd: "$33.43", cls: "bg-[#1f8a5b]" },
  { who: "TSMC · Qualcomm · Corning", pct: 20, usd: "$9.55", cls: "bg-[#e9b949] text-ink" },
  { who: "Gold · Silver", pct: 10, usd: "$4.77", cls: "bg-[#8fc4ad] text-ink" },
];

// Auto-advancing film: crossfades opacity only, and only runs while it is on screen.
const Film = () => {
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    if (frame.current) io.observe(frame.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reduce) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % CHAPTERS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, visible, reduce]);

  return (
    <div ref={frame} className="relative">
      <a
        href={LATEST.url}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Open"
        aria-label={`Open ${LATEST.name}`}
        className="relative block aspect-[16/10] overflow-hidden rounded-2xl border border-white/15 bg-[#0b1410] shadow-[0_60px_120px_-40px_rgba(0,0,0,.9),0_0_90px_-30px_rgba(76,195,138,.45)] sm:aspect-[16/9]"
      >
        {CHAPTERS.map((c, i) => (
          <img
            key={c.name}
            src={c.img}
            alt={i === active ? `${LATEST.name}: ${c.name}` : ""}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] ease-out ${i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"}`}
            style={{ transitionDuration: i === active ? "1100ms, 6000ms" : "900ms, 0ms" }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#06100b] via-[#06100b]/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e9b949]">
            Ch. 0{active + 1} · {CHAPTERS[active].name}
          </p>
          <p key={active} className="mt-2 max-w-md animate-[quest-in_.7s_ease-out] text-[14px] leading-snug text-starlight sm:text-[16px]">
            {CHAPTERS[active].line}
          </p>
        </div>
      </a>

      {/* chapter rail: each tab fills while its still is on screen */}
      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2" role="tablist" aria-label="Ownback, step by step">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.name}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className="group text-left"
            data-cursor={c.name}
          >
            <span className="block h-[3px] overflow-hidden rounded-full bg-white/10">
              <span
                key={i === active ? `on-${active}` : "off"}
                className={`block h-full origin-left rounded-full bg-[#e9b949] ${
                  i < active ? "scale-x-100" : i === active ? (reduce ? "scale-x-100" : "animate-[quest-fill_linear_forwards]") : "scale-x-0"
                }`}
                style={i === active && !reduce ? { animationDuration: `${STEP_MS}ms`, animationPlayState: visible ? "running" : "paused" } : undefined}
              />
            </span>
            <span className={`mt-2 block truncate font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors sm:text-[10.5px] ${i === active ? "text-starlight" : "text-dim group-hover:text-starlight/80"}`}>
              <span className="hidden sm:inline">0{i + 1} </span>{c.name}
            </span>
          </button>
        ))}
      </div>

      {/* the brand mark floats off the corner; stickers pin the origin story */}
      <img src={pie} alt="" aria-hidden="true" decoding="async" className="pointer-events-none absolute -right-2 -top-9 w-20 animate-[quest-float_6s_ease-in-out_infinite] drop-shadow-[0_24px_30px_rgba(0,0,0,.6)] sm:-right-5 sm:-top-12 sm:w-28 lg:w-32" />
      <span className="pointer-events-none absolute -left-2 -top-4 rotate-[-7deg] rounded-md bg-orange px-3 py-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink shadow-lg sm:-left-5">
        36h build
      </span>
    </div>
  );
};

// One purchase, split: the core idea as a live bar instead of a slide.
const SplitBar = () => (
  <div className="rounded-2xl border border-white/10 bg-[#0b0f16] p-5 sm:p-6">
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">One ₹79,900 iPhone → your 5%</p>
      <p className="font-display text-4xl leading-none text-[#e9b949] sm:text-5xl">$47.75</p>
    </div>
    <motion.div
      className="mt-4 flex h-10 overflow-hidden rounded-lg"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay: 0.15, duration: 1.4, ease: EASE }}
    >
      {SPLIT.map((s) => (
        <div key={s.who} className={`flex items-center px-2 font-mono text-[11px] font-semibold sm:px-3 sm:text-xs ${s.cls}`} style={{ width: `${s.pct}%` }}>
          {s.pct >= 20 && <span className="truncate">{s.usd}</span>}
        </div>
      ))}
    </motion.div>
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-starlight/60">
      {SPLIT.map((s) => (
        <li key={s.who} className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${s.cls}`} /> <span className="font-mono text-starlight/85">{s.usd}</span> {s.pct}% {s.who}
        </li>
      ))}
    </ul>
  </div>
);

const Featured = () => (
  <div className="mt-10 grid gap-x-14 gap-y-10 lg:mt-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
    <div className="min-w-0 lg:col-start-1 lg:row-start-1">
      <p className="flex flex-wrap items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.16em]">
        {LATEST.live && (
          <span className="flex items-center gap-1.5 rounded-full border border-aurora/40 bg-aurora/10 px-2.5 py-1 text-aurora">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aurora" /> Live on mainnet
          </span>
        )}
        <span className="text-dim">Latest launch · {LATEST.year}</span>
      </p>
      <h3 className="mt-6 font-display text-[clamp(60px,8.5vw,128px)] font-normal leading-[0.85] tracking-[-0.02em]">{LATEST.name}</h3>
      <p className="mt-3 font-display text-[clamp(26px,3vw,40px)] italic leading-none text-[#e9b949]">Own what you buy.</p>
      <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-starlight/70 md:text-[17px]">{LATEST.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {[LATEST.origin, ...LATEST.techStack].filter(Boolean).map((t, i) => (
          <span key={t} className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] ${i === 0 ? "border-orange/50 text-orange" : "border-white/10 text-starlight/75"}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
    <motion.div
      className="min-w-0 self-start pt-6 sm:pt-8 lg:sticky lg:top-36 lg:col-start-2 lg:row-span-2 lg:row-start-1"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 1, ease: EASE }}
    >
      <Film />
    </motion.div>
    <div className="min-w-0 lg:col-start-1 lg:row-start-2">
      <SplitBar />
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a href={LATEST.url} target="_blank" rel="noopener noreferrer" data-cursor="Open"
          className="rounded-full bg-orange px-6 py-3.5 font-semibold text-ink transition-transform hover:scale-105">
          Open {LATEST.name} ↗
        </a>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">Free for the first 1,000</span>
      </div>
    </div>
  </div>
);

// Everything else as a quest log: logo-sized marks, no stretched art, no sideways scrolling.
const QuestLog = () => (
  <div className="mt-20 md:mt-28">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
      <p className="font-display text-[clamp(32px,4vw,56px)] leading-none">
        Quest <em className="text-orange">log</em>
      </p>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{REST.length} more builds · hackathons &amp; sprints</p>
    </div>
    <ol>
      {REST.map((p, i) => (
        <motion.li
          key={p.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ delay: i * 0.06, duration: 0.6, ease: EASE }}
          className="border-b border-white/10"
        >
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Visit"
            style={{ "--accent": p.accent ?? "#5ee6b8" } as CSSProperties}
            className="group relative grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 py-6 lg:grid-cols-[2.5rem_88px_minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-x-8 lg:py-8"
          >
            {/* hover wash in the project's own colour */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-5 right-[-1.25rem] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:-left-14 md:right-[-3.5rem]" />
            <span className="relative hidden font-mono text-[11px] text-dim lg:col-start-1 lg:row-start-1 lg:block">0{i + 2}</span>
            <span
              className="relative col-start-1 row-start-1 grid aspect-square w-14 place-items-center overflow-hidden rounded-2xl bg-[#0d1119] ring-1 ring-white/10 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105 lg:col-start-2 lg:w-[88px]"
              style={{ boxShadow: "0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent), 0 18px 40px -18px var(--accent)" }}
            >
              <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,color-mix(in_srgb,var(--accent)_35%,transparent),transparent_70%)]" />
              <img src={p.image} alt="" loading="lazy" decoding="async" draggable={false} className="relative h-[74%] w-[74%] object-contain" />
            </span>
            <span className="relative col-start-2 row-start-1 min-w-0 lg:col-start-3">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-aurora lg:text-[10px]">{p.tags.join(" · ")}</span>
                {p.origin && (
                  <span className="rounded bg-orange px-1.5 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.08em] text-ink">
                    {p.year} · Winner
                  </span>
                )}
              </span>
              <span className="mt-1.5 block font-display text-[clamp(30px,4vw,52px)] leading-none transition-colors duration-300 group-hover:text-[var(--accent)]">{p.name}</span>
            </span>
            <span className="relative col-span-full row-start-2 min-w-0 lg:col-span-1 lg:col-start-4 lg:row-start-1">
              <span className="line-clamp-3 block text-[14px] leading-relaxed text-starlight/60 lg:line-clamp-2">{p.description}</span>
              <span className="mt-2 block font-mono text-[11px] text-orange">{p.impact}</span>
            </span>
            <span className="relative col-start-3 row-start-1 grid h-11 w-11 place-items-center rounded-full border border-white/15 text-starlight/80 transition-all duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-[var(--accent)] group-hover:text-ink lg:col-start-5 lg:h-14 lg:w-14">
              ↑
            </span>
          </a>
        </motion.li>
      ))}
    </ol>
    <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-white/15 p-6 sm:flex-row sm:items-center md:p-8">
      <p className="font-display text-[clamp(28px,3.4vw,44px)] leading-tight">
        Next hackathon? <em className="text-orange">Team of one short.</em>
      </p>
      <a href="#contact" className="shrink-0 rounded-full border border-aurora/40 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-aurora transition-colors hover:bg-aurora hover:text-ink">
        Build with me →
      </a>
    </div>
  </div>
);

const SideQuests = () => (
  <section id="projects" className="relative px-5 py-20 md:px-14 md:py-28">
    <ChapterTitle no="03" stage="Side quests" before="Weekend builds," em="shipped." />
    <p className="mt-6 max-w-xl text-starlight/65">Hackathon sprints and side projects, from 36-hour builds to prize winners. The newest one is live on mainnet.</p>
    <Featured />
    <QuestLog />
  </section>
);

export default SideQuests;
