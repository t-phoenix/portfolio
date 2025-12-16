import { motion } from "framer-motion";
import { FadeIn } from "../animations";
import { GAME_STEPS, ANIMATION_DELAYS } from "./helper/constants";

export const HowItWorksCard = () => {
  return (
    <FadeIn delay={ANIMATION_DELAYS.SECOND}>
      <motion.div
        className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"
        whileHover={{ borderColor: "rgba(197, 255, 65, 0.2)" }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-secondary text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">✨</span>
          How It Works
        </p>
        <div className="space-y-4">
          {GAME_STEPS.map((step, index) => (
            <motion.div
              key={index}
              className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
              whileHover={{
                x: 5,
                borderColor: step.color === "orange"
                  ? "rgba(244, 108, 56, 0.2)"
                  : "rgba(197, 255, 65, 0.2)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  step.color === "orange"
                    ? "bg-orange/20 text-orange"
                    : "bg-accent/20 text-accent"
                } font-bold text-sm shrink-0`}
              >
                {step.number}
              </div>
              <div>
                <p className="text-secondary font-medium mb-1">
                  {step.title}
                </p>
                <p className="text-tertiary text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </FadeIn>
  );
};
