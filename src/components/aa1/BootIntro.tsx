import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLenis } from "../../hooks/useSmoothScroll";

const LINES = [
  "establishing uplink ........ ok",
  "loading payload ............ 22 modules",
  "private credit bridged ..... $2,000,000,000+",
  "hackathon prizes ........... $26,000+",
  "ignition sequence .......... armed",
];

const seen = () => {
  try { return sessionStorage.getItem("aa1-boot") === "1"; } catch { return false; }
};

// Launch countdown shown once per session. Click or any key skips it.
const BootIntro = ({ onDone }: { onDone: () => void }) => {
  const skip = seen() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [step, setStep] = useState(skip ? LINES.length + 4 : 0);
  const open = step < LINES.length + 4;

  useEffect(() => {
    if (!open) {
      try { sessionStorage.setItem("aa1-boot", "1"); } catch { /* storage blocked: intro replays next visit */ }
      getLenis()?.start();
      onDone();
      return;
    }
    getLenis()?.stop();
    const id = window.setTimeout(() => setStep((s) => s + 1), step < LINES.length ? 260 : 420);
    return () => window.clearTimeout(id);
  }, [step, open, onDone]);

  useEffect(() => {
    const end = () => setStep(LINES.length + 4);
    window.addEventListener("keydown", end);
    return () => window.removeEventListener("keydown", end);
  }, []);

  const count = step - LINES.length; // 1..3 → T-3, T-2, T-1
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] cursor-pointer"
          onClick={() => setStep(LINES.length + 4)}
          exit={{ opacity: 1 }}
          transition={{ duration: 1 }}
          role="dialog"
          aria-label="Launch intro. Press any key to skip."
        >
          <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-ink" exit={{ y: "-100%" }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" exit={{ y: "100%" }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="absolute inset-0 flex flex-col justify-between p-6 md:p-14" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
              <span>Mission AA-1 · Mission control</span>
              <span>Press any key to skip</span>
            </div>
            <div className="font-mono text-xs leading-7 text-starlight/80 md:text-sm">
              {LINES.slice(0, step).map((l) => (
                <div key={l}><span className="text-aurora">›</span> {l}</div>
              ))}
            </div>
            <div className="flex items-end justify-between gap-6">
              <div className="font-display text-[22vw] leading-[0.8] text-starlight md:text-[14vw]">
                {count > 0 ? <>T-<span className="italic text-orange">{4 - count}</span></> : <span className="text-starlight/15">T-3</span>}
              </div>
              <div className="mb-4 h-px w-1/3 bg-white/10">
                <motion.div className="h-px bg-aurora" animate={{ width: `${(step / (LINES.length + 3)) * 100}%` }} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootIntro;
