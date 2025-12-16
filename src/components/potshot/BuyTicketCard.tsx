import { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "../animations";
import { PaymentButtons } from "./PaymentButtons";
import { TipDeveloperModal } from "./TipDeveloperModal";
import { 
  QUICK_AMOUNTS, 
  ANIMATION_DELAYS,
  POT_SPLIT_PERCENTAGE,
  DEV_SPLIT_PERCENTAGE,
  MIN_TICKET_PRICE,
} from "./helper/constants";

interface BuyTicketCardProps {
  contributionAmount: number;
  customAmount: string;
  isConnected: boolean;
  isProcessing: boolean;
  isGamePaused: boolean;
  minTicketPrice: number;
  baseUSDCBalance: number;
  baseETHBalance: number;
  hasEnoughUSDC: boolean;
  hasEnoughGas: boolean;
  canBuyDirectly: boolean;
  isLoadingBalances: boolean;
  onSelectAmount: (amount: number) => void;
  onCustomAmountChange: (value: string, numericValue: number) => void;
  onBuyTicket: () => void;
}

export const BuyTicketCard = ({
  contributionAmount,
  customAmount,
  isConnected,
  isProcessing,
  isGamePaused,
  minTicketPrice,
  baseUSDCBalance,
  baseETHBalance,
  hasEnoughUSDC,
  hasEnoughGas,
  canBuyDirectly,
  isLoadingBalances,
  onSelectAmount,
  onCustomAmountChange,
  onBuyTicket,
}: BuyTicketCardProps) => {
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  return (
    <>
      <TipDeveloperModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
      />
      <FadeIn delay={ANIMATION_DELAYS.THIRD}>
      <motion.div
        className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"
        whileHover={{ borderColor: "rgba(244, 108, 56, 0.3)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="text-secondary text-xl font-semibold">
            Buy a Ticket
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange/10 border border-orange/20">
            <span className="text-orange font-bold text-lg">Min ${MIN_TICKET_PRICE}</span>
            <span className="text-tertiary text-xs">USDC</span>
          </div>
        </div>

        {/* Amount Selector */}
        <div className="mb-6">
          <label className="text-tertiary text-sm mb-3 block">
            Choose your contribution (min ${MIN_TICKET_PRICE})
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min={MIN_TICKET_PRICE}
              step="0.01"
              placeholder="Enter amount..."
              value={customAmount}
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = parseFloat(value);
                onCustomAmountChange(value, numericValue);
              }}
              className="flex-1 py-3 px-4 rounded-lg bg-white/10 border border-white/10 text-secondary placeholder-tertiary focus:outline-none focus:border-orange/50 focus:bg-white/15 transition-all"
            />
            {QUICK_AMOUNTS.slice(0,3).map((amount) => (
              <motion.button
                key={amount}
                onClick={() => onSelectAmount(amount)}
                className={`py-3 px-4 rounded-lg font-bold transition-all whitespace-nowrap ${
                  contributionAmount === amount && !customAmount
                    ? "bg-orange text-white shadow-lg shadow-orange/30 border border-orange/50"
                    : "bg-white/10 text-secondary hover:bg-white/15 border border-white/10"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ${amount}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Contribution Display */}
        <motion.div
          className="from-orange/10 to-orange/5 backdrop-blur-sm rounded-xl p-5 mb-6 border border-orange/20"
          key={contributionAmount}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm mb-1">You're Contributing</p>
              <p className="text-4xl font-bold text-orange">
                ${contributionAmount.toFixed(2)}
                <span className="text-lg text-tertiary ml-2">USDC</span>
              </p>
              <p className="text-accent text-xs mt-2 font-semibold">
                = 1 Ticket Entry
              </p>
            </div>
            <div className="text-right">
              <p className="text-tertiary text-xs mb-1">Split</p>
              <p className="text-xs text-tertiary">
                ${(contributionAmount * POT_SPLIT_PERCENTAGE).toFixed(2)} → Pot
              </p>
              <p className="text-xs text-tertiary">
                ${(contributionAmount * DEV_SPLIT_PERCENTAGE).toFixed(2)} → Dev
              </p>
            </div>
          </div>
          {contributionAmount > MIN_TICKET_PRICE && (
            <p className="text-tertiary text-xs mt-3 pt-3 border-t border-white/10 text-center">
              💰 Extra ${(contributionAmount - MIN_TICKET_PRICE).toFixed(2)} grows the pot faster!
            </p>
          )}
        </motion.div>


        <PaymentButtons
          isConnected={isConnected}
          isProcessing={isProcessing}
          isGamePaused={isGamePaused}
          canBuyDirectly={canBuyDirectly}
          contributionAmount={contributionAmount}
          minTicketPrice={minTicketPrice}
          baseUSDCBalance={baseUSDCBalance}
          baseETHBalance={baseETHBalance}
          hasEnoughUSDC={hasEnoughUSDC}
          hasEnoughGas={hasEnoughGas}
          isLoadingBalances={isLoadingBalances}
          onBuyTicket={onBuyTicket}
        />

        {/* Tip Developer Button */}
        {isConnected && (
          <motion.button
            onClick={() => setIsTipModalOpen(true)}
            disabled={isProcessing}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 hover:shadow-lg hover:shadow-accent/20 mt-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-2">
              ☕ Tip the Developer
            </span>
          </motion.button>
        )}

        <p className="text-tertiary text-xs text-center mt-4 leading-relaxed">
          🎫 1 ticket per play • Min ${MIN_TICKET_PRICE} • Pay more to boost the pot 🌉
        </p>
      </motion.div>
      </FadeIn>
    </>
  );
};
