import { useEffect, useRef, useState } from "react";

// Dot + trailing ring. Grows over anything with data-cursor="Label". Fine pointers only.
const Cursor = () => {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [on] = useState(() => window.matchMedia("(pointer: fine)").matches);

  useEffect(() => {
    if (!on) return;
    document.documentElement.classList.add("aa1-cursor");
    const p = { x: -100, y: -100, rx: -100, ry: -100 };
    let raf = 0;
    const pick = (el: Element | null) => {
      const t = el?.closest<HTMLElement>("[data-cursor], a, button");
      setLabel(t ? t.dataset.cursor ?? "·" : "");
    };
    const move = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      pick(e.target as Element | null);
    };
    // content scrolls under a still pointer: re-read what is under it so a stale label doesn't linger
    const onScroll = () => pick(document.elementFromPoint(p.x, p.y));
    const loop = () => {
      p.rx += (p.x - p.rx) * 0.18;
      p.ry += (p.y - p.ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${p.x}px,${p.y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${p.rx}px,${p.ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("aa1-cursor");
    };
  }, [on]);

  if (!on) return null;
  const big = label !== "" && label !== "·";
  const mid = label === "·";
  return (
    <>
      <div ref={dot} className={`pointer-events-none fixed left-0 top-0 z-[200] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-orange mix-blend-difference transition-opacity ${big ? "opacity-0" : ""}`} />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[199]">
        <div
          className={`-translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full border transition-all duration-300 ${
            big ? "h-20 w-20 border-orange bg-orange/90 text-ink" : mid ? "h-12 w-12 border-orange" : "h-9 w-9 border-starlight/40"
          }`}
        >
          {big && <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{label}</span>}
        </div>
      </div>
    </>
  );
};

export default Cursor;
