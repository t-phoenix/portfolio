import { motion } from "framer-motion";
import { FadeIn } from "../animations";
import {  
  MAX_WIN_CHANCE, 
  WIN_CHANCE_INCREMENT,
  STARTING_WIN_CHANCE,
  DEFAULT_VALUE,
} from "./helper/constants";

interface WinChanceCardProps {
  userChance: number;
  isConnected: boolean;
  isLoading?: boolean;
}

export const WinChanceCard = ({ userChance, isConnected, isLoading = false }: WinChanceCardProps) => {
  // Only show loading state if we don't have a previous value to preserve
  // This prevents the "flicker to 0" when refetching data while connected
  const shouldShowLoading = isLoading && userChance === 0;
  const displayValue = shouldShowLoading 
    ? DEFAULT_VALUE 
    : `${isConnected ? userChance : 0}%`;
  
  return (
    <FadeIn delay={0.3}>
      <motion.div
        className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 relative overflow-hidden"
        whileHover={{ borderColor: "rgba(197, 255, 65, 0.3)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-tertiary text-sm uppercase tracking-wider">
              Your Win Chance
            </p>
            <motion.p
              className="text-5xl font-bold text-orange"
              animate={{
                scale: isConnected && userChance > 0 ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {displayValue}
            </motion.p>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${isConnected ? (userChance / MAX_WIN_CHANCE) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Info Text */}
          <div className="flex items-center justify-between text-xs text-tertiary">
            <span>+{WIN_CHANCE_INCREMENT}% per play  |  Resets to {STARTING_WIN_CHANCE}% on win  |  Remains Max {MAX_WIN_CHANCE}% till you win</span>
            {!isConnected && (
              <span className="text-orange">Connect to play</span>
            )}
          </div>
        </div>
      </motion.div>
    </FadeIn>
  );
};
