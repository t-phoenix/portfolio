import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { blogsData } from "../../data";
import ChapterTitle from "./ChapterTitle";

const stamp = (d: string) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? d : t.toISOString().slice(0, 10);
};
const LOG = [...blogsData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Log rows; on desktop the post image floats after the cursor while you hover a row.
const MissionLog = () => {
  const [hover, setHover] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });

  return (
    <section
      id="blog"
      className="relative px-5 py-20 md:px-14 md:py-28"
      onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}
    >
      <ChapterTitle no="05" stage="Mission log" before="Notes from the" em="cockpit." />
      <ol className="mt-10 border-t md:mt-14 border-white/10">
        {LOG.map((b, i) => (
          <li key={b.url}>
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Read"
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              className="group grid grid-cols-1 gap-3 border-b border-white/10 py-8 md:grid-cols-[150px_minmax(0,1fr)_120px] md:items-center md:gap-8"
            >
              <span className="flex gap-3 font-mono text-[11px] uppercase tracking-[0.14em] md:flex-col md:gap-1.5">
                <span className="text-aurora">Log {stamp(b.date)}</span>
                <span className="text-dim">{b.source ?? "Blog"}</span>
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[clamp(26px,3.4vw,52px)] leading-[1.02] transition-transform duration-500 group-hover:translate-x-3">{b.title}</span>
                <span className="mt-3 line-clamp-2 block max-w-2xl text-starlight/55">{b.description}</span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim md:text-right">{b.readTime} ↗</span>
              <img src={b.image} alt="" className="aspect-video w-full rounded-xl object-cover md:hidden" />
            </a>
          </li>
        ))}
      </ol>
      <a href="https://hackernoon.com/u/tphoenix" target="_blank" rel="noopener noreferrer" data-cursor="Read"
        className="mt-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-aurora hover:text-orange">
        All stories on HackerNoon ↗
      </a>
      <AnimatePresence>
        {hover !== null && (
          <motion.img
            key={hover}
            src={LOG[hover].image}
            alt=""
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-30 hidden w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 object-cover shadow-2xl md:block"
            style={{ x, y }}
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default MissionLog;
