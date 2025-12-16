import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { FadeIn } from "../animations";
import { formatValue } from "./helper/formatters";

interface CurrentPotCardProps {
  currentPot: number;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const CurrentPotCard = ({ 
  currentPot, 
  isLoading = false,
  isRefreshing = false,
  onRefresh 
}: CurrentPotCardProps) => {
  return (
    <FadeIn delay={0.2}>
      <motion.div
        className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 relative overflow-hidden"
        whileHover={{ scale: 1.01, borderColor: "rgba(244, 108, 56, 0.3)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <p className="text-tertiary text-sm uppercase tracking-wider">
                Current Pot
              </p>
              {onRefresh && (
                <motion.button
                  onClick={onRefresh}
                  disabled={isRefreshing || isLoading}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Refresh data"
                >
                  <RefreshCw 
                    className={`w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                </motion.button>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide">
                Base Chain
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <motion.p
              className="text-6xl md:text-7xl font-bold text-orange"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {formatValue(currentPot, isLoading)}
            </motion.p>
            <p className="text-3xl text-tertiary font-medium">USDC</p>
          </div>
        </div>
      </motion.div>
    </FadeIn>
  );
};
