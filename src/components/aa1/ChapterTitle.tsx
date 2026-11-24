import { motion } from "framer-motion";

interface ChapterTitleProps {
  no: string;
  stage: string;
  before: string;
  em: string;
  after?: string;
  className?: string;
}

// "01 · Trajectory" eyebrow + serif headline whose words rise out of a mask, one italic orange word.
const ChapterTitle = ({ no, stage, before, em, after = "", className = "" }: ChapterTitleProps) => {
  const words = [
    ...before.split(" ").filter(Boolean).map((w) => ({ w, em: false })),
    { w: em, em: true },
    ...after.split(" ").filter(Boolean).map((w) => ({ w, em: false })),
  ];
  return (
    <div className={className}>
      <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-aurora">
        <span className="h-px w-7 bg-aurora" />
        {no} · {stage}
      </p>
      <motion.h2
        className="mt-5 font-display text-[clamp(44px,7vw,112px)] font-normal leading-[0.9] tracking-[-0.02em] text-starlight"
        initial="out"
        whileInView="in"
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ staggerChildren: 0.06 }}
      >
        {words.map(({ w, em: isEm }, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className={`inline-block ${isEm ? "italic text-orange" : ""}`}
              variants={{ out: { y: "105%" }, in: { y: 0 } }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </motion.h2>
    </div>
  );
};

export default ChapterTitle;
