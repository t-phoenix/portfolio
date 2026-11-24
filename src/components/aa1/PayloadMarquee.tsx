import { toolsData } from "../../data";
import ChapterTitle from "./ChapterTitle";

const half = Math.ceil(toolsData.length / 2);
const ROWS = [toolsData.slice(0, half), toolsData.slice(half)];

// Two counter-scrolling belts of every tool, plus a giant outlined word belt behind.
const PayloadMarquee = () => (
  <section id="tools" className="relative overflow-hidden py-20 md:py-28">
    <div className="flex flex-wrap items-end justify-between gap-6 px-5 md:px-14">
      <ChapterTitle no="01" stage="Payload" before="What's" em="on board." />
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
        Manifest · <span className="text-aurora">{toolsData.length} modules</span>
      </p>
    </div>

    <div aria-hidden="true" className="pointer-events-none mt-10 flex w-max animate-marquee whitespace-nowrap font-display text-[clamp(80px,14vw,220px)] italic leading-none text-transparent [--marquee-duration:60s] [-webkit-text-stroke:1px_rgba(238,240,244,.14)]">
      {[0, 1].map((k) => (
        <span key={k} className="pr-16">Solidity · Private credit · DeFi · DAO tooling · Mobile dApps ·&nbsp;</span>
      ))}
    </div>

    <div className="-mt-[clamp(60px,9vw,150px)] space-y-4 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      {ROWS.map((row, r) => (
        <div key={r} className="group flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]"
          style={{ animationDirection: r ? "reverse" : "normal", ["--marquee-duration" as string]: r ? "46s" : "38s" }}>
          {[...row, ...row].map((t, i) => (
            <div key={i} aria-hidden={i >= row.length}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1119] py-2.5 pl-2.5 pr-5 transition-colors hover:border-aurora"
              style={{ transform: `rotate(${((i * 7) % 5) - 2}deg)` }}>
              <img src={t.icon} alt={i < row.length ? t.name : ""} className="h-10 w-10 rounded-lg bg-white object-contain p-1 outline outline-2 outline-offset-2 outline-starlight/80" />
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">{t.category}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </section>
);

export default PayloadMarquee;
