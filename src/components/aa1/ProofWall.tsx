import { motion } from "framer-motion";
import { achievementsData, platformLogos } from "../../data";
import { CountUp } from "../animations";
import ChapterTitle from "./ChapterTitle";

// Receipts as a ledger: each row fills with thruster orange on hover.
const ProofWall = () => (
  <section id="achievements" className="relative px-5 py-20 md:px-14 md:py-28">
    <div className="flex flex-wrap items-end justify-between gap-10">
      <ChapterTitle no="04" stage="Proof" before="Receipts," em="stacked." />
      <div className="text-right">
        <p className="font-display text-[clamp(72px,11vw,170px)] leading-[0.8] text-orange">
          <CountUp end={26} prefix="$" suffix="K+" duration={2.2} />
        </p>
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">Won across {achievementsData.length} hackathons</p>
      </div>
    </div>

    <ul className="mt-10 border-t md:mt-14 border-white/10">
      {achievementsData.map((a, i) => (
        <motion.li
          key={a.name}
          initial={{ opacity: 0.2, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ delay: i * 0.08, duration: 0.7 }}
          className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden border-b border-white/10 py-6 md:grid-cols-[60px_minmax(0,1.3fr)_minmax(0,1fr)_140px_120px] md:gap-8 md:py-8"
        >
          <span className="absolute inset-0 origin-left scale-x-0 bg-orange transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-x-100" />
          <img src={platformLogos[a.platform]} alt={a.platform} className="relative h-11 w-11 rounded-xl bg-white object-contain p-1" />
          <div className="relative min-w-0">
            <p className="font-display text-[clamp(26px,3vw,44px)] leading-none transition-colors group-hover:text-ink">{a.name}</p>
            <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim transition-colors group-hover:text-ink/70 md:hidden">
              {a.position} · {a.project}
            </p>
          </div>
          <p className="relative hidden text-starlight/70 transition-colors group-hover:text-ink md:block">{a.project}</p>
          <p className="relative hidden font-mono text-xs uppercase tracking-[0.12em] text-aurora transition-colors group-hover:text-ink md:block">{a.position}</p>
          <p className="relative text-right font-display text-3xl transition-colors group-hover:text-ink">
            {a.prize}
            <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-dim group-hover:text-ink/70">{a.date}</span>
          </p>
        </motion.li>
      ))}
    </ul>
  </section>
);

export default ProofWall;
