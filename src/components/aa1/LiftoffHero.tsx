import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CountUp, MagneticButton } from "../animations";
import ChainOrbit from "./ChainOrbit";
import { SocialButtons } from "./BrandIcons";

const WORD = "ABHINIL";
const PIVOT = 3; // the "I" at the centre of the word: the camera flies through its stem
const MAX_ZOOM = 90;
const LINES = [
  [{ w: "I" }, { w: "build" }, { w: "the" }, { w: "rails" }],
  [{ w: "money", em: true }, { w: "moves" }, { w: "on." }],
];
const STATS = [
  { end: 2, prefix: "$", suffix: "B", label: "Private credit bridged" },
  { end: 26, prefix: "$", suffix: "K", label: "Hackathon prizes" },
  { end: 4, prefix: "", suffix: "", label: "Years in Web3" },
];
const EASE = [0.22, 1, 0.36, 1] as const;

// Where the "I" stem actually is: draw the glyph on a scratch canvas and scan one pixel row
// at half cap height. The glyph box is wider than the stem, so its centre would miss.
const stemOf = (px: number) => {
  const c = document.createElement("canvas");
  c.width = Math.ceil(px);
  c.height = Math.ceil(px * 1.3);
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return { x: px * 0.15, up: px * 0.33, ascent: px * 0.9 };
  g.font = `${px}px "Instrument Serif"`;
  const m = g.measureText("I");
  const cap = m.actualBoundingBoxAscent;
  g.fillText("I", 0, cap + 2);
  const row = Math.round(2 + cap / 2);
  const data = g.getImageData(0, row, c.width, 1).data;
  let l = -1;
  let r = -1;
  for (let i = 0; i < c.width; i++) if (data[i * 4 + 3] > 128) { if (l < 0) l = i; r = i; }
  return { x: l < 0 ? px * 0.15 : (l + r + 1) / 2, up: cap / 2, ascent: m.fontBoundingBoxAscent };
};
const WORD_STYLE = { fontFamily: "var(--font-display)", fontSize: "clamp(96px, 27vw, 640px)", letterSpacing: "-0.02em" };

// Act 1: the name is a cut-out window onto the live sky. Act 2: scrolling dives through the "I"
// until the sky fills the screen. Act 3: the hero assembles inside it, around an orbit of chains.
const LiftoffHero = ({ ready }: { ready: boolean }) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const word = useRef<SVGTextElement>(null);
  const holeGroup = useRef<SVGGElement>(null);
  const lineGroup = useRef<SVGGElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const [revealed, setRevealed] = useState(false);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const zoom = useTransform(p, [0, 0.55], [1, MAX_ZOOM], { ease: (t) => t * t * t });
  const maskOpacity = useTransform(p, [0.42, 0.56], [1, 0]);
  const cueOpacity = useTransform(p, [0, 0.1], [1, 0]);
  const contentOpacity = useTransform(p, [0.42, 0.62], [0, 1]);
  const contentScale = useTransform(p, [0.42, 0.72], [1.12, 1]);
  useMotionValueEvent(p, "change", (v) => { if (v > 0.42) setRevealed(true); });
  const show = ready && (revealed || !!reduce);

  // The zoom is applied inside the SVG (a transform attribute) rather than as a CSS scale:
  // a CSS scale(90) asks the GPU for a ~130k px layer, which browsers drop on the way back up.
  const applyZoom = (s: number) => {
    const { x, y } = origin.current;
    const t = `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`;
    holeGroup.current?.setAttribute("transform", t);
    lineGroup.current?.setAttribute("transform", t);
  };
  useMotionValueEvent(zoom, "change", applyZoom);

  useEffect(() => {
    const measure = () => {
      const t = word.current;
      if (!t || !t.getNumberOfChars()) return;
      lineGroup.current?.removeAttribute("transform"); // measure the glyph at scale 1
      // the glyph's em box; with dominant-baseline "central" the baseline is ascent below its top
      const box = t.getExtentOfChar(PIVOT);
      const stem = stemOf(parseFloat(getComputedStyle(t).fontSize));
      origin.current = { x: box.x + stem.x, y: box.y + stem.ascent - stem.up };
      applyZoom(zoom.get());
    };
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure once fonts load, then on resize
  }, []);

  return (
    <section id="home" ref={ref} className={reduce ? "relative" : "relative h-[260vh]"}>
      <div className={reduce ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh] overflow-hidden"}>
        {/* Act 3: the hero itself */}
        <motion.div
          style={reduce ? undefined : { opacity: contentOpacity, scale: contentScale, pointerEvents: revealed ? "auto" : "none" }}
          className="absolute inset-0 flex flex-col px-5 pb-6 pt-24 sm:pb-8 md:px-14 md:pt-28"
        >
          <div className="grid min-h-0 flex-1 items-center [align-content:safe_center] gap-6 md:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6">
            <div className="min-w-0">
              <p className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-aurora sm:text-[11px]">
                <span className="h-px w-7 bg-aurora" /> Mission AA-1 · Web3 engineer
              </p>
              <h1 className="mt-5 font-display text-[clamp(52px,9.4vw,150px)] font-normal leading-[0.88] tracking-[-0.025em] md:mt-6 lg:text-[min(7.6vw,13.5vh)] xl:text-[min(8.4vw,14.5vh)]">
                {LINES.map((line, li) => (
                  <span key={li} className="block">
                    {line.map(({ w, em }, wi) => (
                      <span key={w} className="inline-block overflow-hidden pb-[0.14em] align-bottom">
                        <motion.span
                          className={`inline-block pr-[0.22em] ${em ? "italic text-orange" : ""}`}
                          initial={{ y: "110%", rotate: 6 }}
                          animate={show ? { y: 0, rotate: 0 } : { y: "110%", rotate: 6 }}
                          transition={{ delay: (li * 4 + wi) * 0.06, duration: 1.1, ease: EASE }}
                        >
                          {w}
                        </motion.span>
                      </span>
                    ))}
                  </span>
                ))}
              </h1>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={show ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6, duration: 0.8 }}>
                <p className="mt-4 max-w-[34rem] text-[15.5px] leading-relaxed text-starlight/70 sm:text-[17px] md:mt-6 md:text-lg">
                  Blockchain engineer and full-stack developer. Shipping <b className="font-medium text-starlight">onchain private credit</b> at
                  Pact Labs and CosX, after DEXs, DAO tooling and index funds at Equistart.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
                  <MagneticButton strength={0.25}>
                    <a href="#experience" data-cursor="Launch" className="inline-block rounded-full bg-orange px-5 py-3 font-semibold text-ink sm:px-6 sm:py-3.5">
                      View trajectory ↓
                    </a>
                  </MagneticButton>
                  <MagneticButton strength={0.25}>
                    <a href="#potshot" data-cursor="Play" className="inline-block rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold sm:px-6 sm:py-3.5">
                      Take a potshot
                    </a>
                  </MagneticButton>
                  <SocialButtons className="sm:ml-2" />
                </div>
              </motion.div>
            </div>

            <motion.div
              className="hidden justify-self-center md:block lg:justify-self-end [@media(min-height:780px)]:block"
              initial={{ opacity: 0, scale: 0.85, rotate: -12 }}
              animate={show ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ delay: 0.25, duration: 1.4, ease: EASE }}
            >
              <ChainOrbit className="w-[min(84vw,40vh)] md:w-[min(70vw,52vh)] lg:w-[min(36vw,62vh)] xl:w-[min(38vw,70vh)]" />
            </motion.div>
          </div>

          <motion.div
            className="mt-6 flex flex-wrap items-end justify-between gap-6"
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ delay: 0.9, duration: 1 }}
          >
            <dl className="grid w-full grid-cols-3 gap-4 sm:w-auto sm:gap-10">
              {STATS.map((s, i) => (
                <div key={s.label} className={i ? "border-l border-white/10 pl-4 sm:pl-10" : ""}>
                  <dd className="font-display text-[clamp(30px,4.4vw,64px)] leading-none">
                    {show ? <CountUp end={s.end} prefix={s.prefix} suffix={s.suffix} duration={2} /> : `${s.prefix}0${s.suffix}`}
                    <sup className="ml-0.5 text-[0.45em] text-orange">+</sup>
                  </dd>
                  <dt className="mt-2 font-mono text-[9px] uppercase leading-snug tracking-[0.12em] text-dim sm:text-[10.5px] sm:tracking-[0.14em]">{s.label}</dt>
                </div>
              ))}
            </dl>
            <p className="hidden font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim md:block">
              Based in Jaipur · <span className="text-aurora">26.91° N 75.79° E</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Acts 1 and 2: the name as a window, then the dive */}
        {!reduce && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={ready ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.8, ease: EASE }}
          >
            <motion.svg className="absolute inset-0 h-full w-full" style={{ opacity: maskOpacity }}>
              <defs>
                <mask id="aa1-window" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                  <rect width="100%" height="100%" fill="white" />
                  <g ref={holeGroup}>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="black" style={WORD_STYLE}>{WORD}</text>
                  </g>
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="#07090e" mask="url(#aa1-window)" />
              <g ref={lineGroup}>
                <text ref={word} x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="none"
                  stroke="rgba(94,230,184,.45)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={WORD_STYLE}>
                  {WORD}
                </text>
              </g>
            </motion.svg>

            <motion.div style={{ opacity: cueOpacity }} className="absolute inset-0 flex flex-col justify-between px-5 pb-8 pt-24 md:px-14 md:pt-28">
              <div className="flex justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-dim sm:text-[11px]">
                <span>Mission AA-1<br className="sm:hidden" /><span className="hidden sm:inline"> · </span>Web3 engineer</span>
                <span className="text-right">Est. 2002<br className="sm:hidden" /><span className="hidden sm:inline"> · </span>Jaipur, IN</span>
              </div>
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="max-w-xs font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.16em] text-starlight/70 sm:max-w-none sm:text-[11px]">
                  Abhinil Agarwal · Private credit · DeFi · DAO tooling
                </p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-aurora">Scroll to launch</p>
                <span className="relative h-12 w-px overflow-hidden bg-white/10">
                  <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-aurora" animate={{ y: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }} />
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LiftoffHero;
