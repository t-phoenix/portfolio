import { motion } from "framer-motion";
import { FadeIn } from "../animations";
import type { GameState } from "./helper/types";
import { formatValue, formatInteger } from "./helper/formatters";

interface StatsGridProps {
  gameState: GameState;
  isLoading?: boolean;
}

export const StatsGrid = ({ gameState, isLoading = false }: StatsGridProps) => {
  return (
    <FadeIn delay={0.5}>
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 text-center"
          whileHover={{ scale: 1.05, borderColor: "rgba(197, 255, 65, 0.3)" }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-3xl font-bold text-accent">
            {formatValue(gameState.usdcPaidOut, isLoading)}
          </p>
          <p className="text-tertiary text-xs mt-2 uppercase tracking-wide">
            USDC Paid Out
          </p>
        </motion.div>
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 text-center"
          whileHover={{ scale: 1.05, borderColor: "rgba(244, 108, 56, 0.3)" }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-3xl font-bold text-orange">
            {formatValue(gameState.usdcToDev, isLoading)}
          </p>
          <p className="text-tertiary text-xs mt-2 uppercase tracking-wide">
            USDC to Dev
          </p>
        </motion.div>
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 text-center"
          whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.2)" }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-3xl font-bold text-secondary">
            {formatInteger(gameState.totalPlays, isLoading)}
          </p>
          <p className="text-tertiary text-xs mt-2 uppercase tracking-wide">
            Total Plays
          </p>
        </motion.div>
      </div>
    </FadeIn>
  );
};
