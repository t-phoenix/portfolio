import { useEffect, useRef, useState } from "react";
import { toolsData } from "../../data";

// The rails: chains on the outer orbit, protocols on the inner one, around a glowing core.
// Plain 2D maths, not CSS 3D: logos stay upright, both ellipses share the core's centre exactly,
// and depth is faked with scale, opacity and stacking (behind the core on the far side).
const OUTER = toolsData.filter((t) => /Blockchain|Scaling/.test(t.category)).slice(0, 6);
const INNER = toolsData.filter((t) => /DEX|DeFi|Contract Library|Wallet$/.test(t.category)).slice(0, 4);
const ITEMS = [
  ...OUTER.map((t, i) => ({ ...t, ring: 0, phase: (Math.PI * 2 * i) / OUTER.length })),
  ...INNER.map((t, i) => ({ ...t, ring: 1, phase: (Math.PI * 2 * i) / INNER.length + Math.PI / 4 })),
];
const R = [0.42, 0.27]; // ring radius as a fraction of the box width
const SPEED = [0.11, -0.17]; // rad/s; the inner ring runs the other way
const DISC = [0.1, 0.085]; // logo size as a fraction of the box width
const TILT = 0.36; // ellipse height / width
const ASPECT = 0.52; // box height / width: just tall enough for the ellipse at full pointer tilt plus a disc

const ChainOrbit = ({ className = "" }: { className?: string }) => {
  const box = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLDivElement | null)[]>([]);
  const rings = useRef<(SVGEllipseElement | null)[]>([]);
  const [front, setFront] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let w = el.clientWidth;
    const ro = new ResizeObserver(() => { w = el.clientWidth; });
    ro.observe(el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tilt = { cur: TILT, to: TILT, x: 0, tx: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tilt.to = TILT + ((e.clientY - r.top) / r.height - 0.5) * 0.16;
      tilt.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.04;
    };
    const onLeave = () => { tilt.to = TILT; tilt.tx = 0; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    let lastFront = -1;
    const place = (time: number) => {
      tilt.cur += (tilt.to - tilt.cur) * 0.06;
      tilt.x += (tilt.tx - tilt.x) * 0.06;
      const t = reduce ? 0 : time / 1000;
      let best = -2;
      let bestI = 0;
      ITEMS.forEach((it, i) => {
        const a = it.phase + t * SPEED[it.ring];
        const depth = Math.sin(a); // -1 far side, +1 nearest the viewer
        const x = (Math.cos(a) * R[it.ring] + tilt.x) * w;
        const y = depth * R[it.ring] * tilt.cur * w;
        const s = 0.72 + 0.28 * ((depth + 1) / 2);
        const node = chips.current[i];
        if (node) {
          node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${s.toFixed(3)})`;
          node.style.zIndex = depth > 0 ? "30" : "10";
          node.style.opacity = (0.45 + 0.55 * ((depth + 1) / 2)).toFixed(3);
        }
        if (it.ring === 0 && depth > best) { best = depth; bestI = i; }
      });
      rings.current.forEach((e, k) => {
        e?.setAttribute("cx", String(tilt.x * 100));
        e?.setAttribute("ry", String(R[k] * tilt.cur * 100));
      });
      if (bestI !== lastFront) { lastFront = bestI; setFront(bestI); }
    };

    let raf = 0;
    let visible = true;
    const loop = (time: number) => {
      place(time);
      raf = visible && !document.hidden && !reduce ? requestAnimationFrame(loop) : 0;
    };
    // only animate while on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    const onVis = () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const now = ITEMS[front];
  return (
    <div className={`relative ${className}`}>
      <div
        ref={box}
        className="relative [container-type:inline-size]"
        style={{ aspectRatio: `1 / ${ASPECT}` }}
        role="img"
        aria-label={`Chains and protocols I build on: ${ITEMS.map((t) => t.name).join(", ")}`}
      >
        <svg viewBox={`-50 ${-ASPECT * 50} 100 ${ASPECT * 100}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {R.map((r, k) => (
            <ellipse
              key={k}
              ref={(e) => { rings.current[k] = e; }}
              cx="0" cy="0" rx={r * 100} ry={r * TILT * 100}
              fill="none" stroke="rgba(94,230,184,.28)" strokeWidth="0.25" strokeDasharray="1 1.4"
            />
          ))}
        </svg>
        {/* core: sits between the far (z 10) and near (z 30) halves of each orbit */}
        <div className="absolute left-1/2 top-1/2 z-20 grid aspect-square w-[26%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#1d3d52,#070b12_72%)] shadow-[0_0_0_1px_rgba(89,184,255,.55),0_0_36px_rgba(94,230,184,.35),0_0_110px_rgba(94,230,184,.18)]">
          <span className="text-center font-mono text-[clamp(8px,2.6cqw,11px)] uppercase leading-relaxed tracking-[0.14em] text-starlight/85">
            $2B+<br /><span className="text-aurora">bridged</span>
          </span>
        </div>
        {ITEMS.map((t, i) => (
          <div
            key={t.name}
            ref={(e) => { chips.current[i] = e; }}
            title={t.name}
            className="absolute left-1/2 top-1/2 grid place-items-center rounded-full border border-white/20 bg-white shadow-[0_8px_24px_-6px_rgba(0,0,0,.8)] will-change-transform"
            style={{ width: `${DISC[t.ring] * 100}cqw`, height: `${DISC[t.ring] * 100}cqw` }}
          >
            <img src={t.icon} alt="" className="h-[72%] w-[72%] rounded-full object-contain" />
          </div>
        ))}
      </div>
      {/* caption follows whichever chain is nearest the viewer */}
      <p className="mt-2 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim" aria-hidden="true">
        Now passing · <span className="text-aurora">{now.name}</span> <span className="hidden text-starlight/40 sm:inline">/ {now.category}</span>
      </p>
    </div>
  );
};

export default ChainOrbit;
