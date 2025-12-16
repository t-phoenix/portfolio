/**
 * Modal for tipping the developer
 * States: Enter Amount -> Approve USDC (if needed) -> Tip -> Success
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Loader2,
  X,
  AlertCircle,
  Coffee,
  Heart,
  Sparkles,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useUSDCApproval, useTipDev } from "./hooks/useGameTransactions";

interface TipDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FlowState = 
  | "enterAmount" 
  | "approval" 
  | "approving" 
  | "tipping" 
  | "success"
  | "error";

const QUICK_TIP_AMOUNTS = [1, 5, 10, 25];

export const TipDeveloperModal: React.FC<TipDeveloperModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [flowState, setFlowState] = useState<FlowState>("enterAmount");
  const [tipAmount, setTipAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Transaction hooks
  const {
    hasEnoughAllowance,
    approveUSDC,
    isApproving,
    isApprovalConfirmed,
    reset: resetApproval,
    error: approvalError,
  } = useUSDCApproval(address);

  const {
    tipDev,
    isPending: isTipping,
    isConfirming: isConfirmingTip,
    isSuccess: isTipSuccess,
    error: tipError,
  } = useTipDev();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFlowState("enterAmount");
      setTipAmount(5);
      setCustomAmount("");
      setErrorMessage("");
    }
  }, [isOpen]);

  // Handle approval confirmation
  useEffect(() => {
    if (isApprovalConfirmed) {
      setFlowState("tipping");
      setErrorMessage("");
      resetApproval();
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
      
      // Auto-execute tip after approval
      handleTip();
    }
  }, [isApprovalConfirmed]);

  // Handle approval error
  useEffect(() => {
    if (approvalError) {
      setErrorMessage("Failed to approve USDC. Please try again.");
      setFlowState("error");
    }
  }, [approvalError]);

  // Handle tip success
  useEffect(() => {
    if (isTipSuccess) {
      setFlowState("success");
      setErrorMessage("");
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
    }
  }, [isTipSuccess, queryClient]);

  // Handle tip error
  useEffect(() => {
    if (tipError) {
      setErrorMessage("Failed to send tip. Please try again.");
      setFlowState("error");
    }
  }, [tipError]);

  const handleStartTip = async () => {
    if (tipAmount < 1) {
      setErrorMessage("Common, you can tip at least $1 USDC");
      return;
    }

    // Check if approval is needed
    if (!hasEnoughAllowance(tipAmount)) {
      setFlowState("approval");
      try {
        await approveUSDC(tipAmount);
        setFlowState("approving");
      } catch (error) {
        setErrorMessage("Failed to approve USDC. Please try again.");
        setFlowState("error");
      }
    } else {
      // Skip approval, go straight to tipping
      setFlowState("tipping");
      await handleTip();
    }
  };

  const handleTip = async () => {
    try {
      await tipDev(tipAmount);
    } catch (error) {
      setErrorMessage("Failed to send tip. Please try again.");
      setFlowState("error");
    }
  };

  const handleRetry = () => {
    setErrorMessage("");
    setFlowState("enterAmount");
  };

  const handleClose = () => {
    if (flowState === "tipping" || flowState === "approving") {
      // Don't allow closing during transaction
      return;
    }
    onClose();
  };

  const renderContent = () => {
    switch (flowState) {
      case "enterAmount":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Coffee className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-secondary">
                Tip the Developer
              </h3>
              <p className="text-tertiary text-sm">
                Support the development of Potshot! Your tips help keep the game running and improving.
              </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-tertiary text-sm block">
                Choose tip amount (min $1 USDC)
              </label>
              <input
                type="number"
                min={1}
                step="0.01"
                placeholder="Enter amount..."
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomAmount(value);
                  const numericValue = parseFloat(value);
                  if (!isNaN(numericValue)) {
                    setTipAmount(numericValue);
                  }
                }}
                className="w-full py-3 px-4 rounded-lg bg-white/10 border border-white/10 text-secondary placeholder-tertiary focus:outline-none focus:border-accent/50 focus:bg-white/15 transition-all"
              />
              <div className="grid grid-cols-4 gap-2">
                {QUICK_TIP_AMOUNTS.map((amount) => (
                  <motion.button
                    key={amount}
                    onClick={() => {
                      setTipAmount(amount);
                      setCustomAmount(amount.toString());
                    }}
                    className={`py-2 px-3 rounded-lg font-bold transition-all ${
                      tipAmount === amount
                        ? "bg-accent text-black font-bold shadow-lg shadow-accent/30 border border-accent/50"
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

            {/* Selected Amount Display */}
            {tipAmount >= 1 && (
              <motion.div
                className="bg-accent/10 rounded-xl p-4 border border-accent/20"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-tertiary text-xs mb-1">Your Tip</p>
                    <p className="text-3xl font-bold text-accent">
                      ${tipAmount.toFixed(2)}
                      <span className="text-sm text-tertiary ml-2">USDC</span>
                    </p>
                  </div>
                  <Heart className="w-12 h-12 text-accent/30" />
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            <motion.button
              onClick={handleStartTip}
              disabled={tipAmount < 1}
              className="w-full py-4 px-6 rounded-xl font-bold text-base transition-all bg-accent hover:bg-accent/90 text-black font-bold shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: tipAmount >= 1 ? 1.02 : 1 }}
              whileTap={{ scale: tipAmount >= 1 ? 0.98 : 1 }}
            >
              {tipAmount >= 1 ? `Send $${tipAmount.toFixed(2)} Tip` : "Enter Amount"}
            </motion.button>
          </motion.div>
        );

      case "approval":
      case "approving":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 py-8"
          >
            <div className="relative">
              <div className="w-20 h-20 bg-orange/20 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-orange animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-secondary">
                {flowState === "approval" ? "Approve USDC" : "Approving..."}
              </h3>
              <p className="text-tertiary text-sm max-w-sm mx-auto">
                {flowState === "approval"
                  ? "Please approve USDC spending in your wallet"
                  : "Waiting for approval confirmation..."}
              </p>
            </div>
            {isApproving && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-tertiary">
                  Processing approval transaction...
                </p>
              </div>
            )}
          </motion.div>
        );

      case "tipping":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 py-8"
          >
            <div className="relative">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-secondary">
                Sending Tip...
              </h3>
              <p className="text-tertiary text-sm max-w-sm mx-auto">
                Processing your ${tipAmount.toFixed(2)} USDC tip
              </p>
            </div>
            {(isTipping || isConfirmingTip) && (
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {isTipping ? (
                    <>
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      <p className="text-xs text-tertiary">Confirm in wallet...</p>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      <p className="text-xs text-tertiary">Confirming transaction...</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-14 h-14 text-accent" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-accent" />
              </motion.div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-accent">
                Thank You! 🎉
              </h3>
              <p className="text-secondary text-lg font-semibold">
                You tipped ${tipAmount.toFixed(2)} USDC
              </p>
              <p className="text-tertiary text-sm max-w-md mx-auto leading-relaxed">
                Your support means the world! Your contribution helps keep Potshot running 
                and enables us to build more awesome features for the community. 
              </p>
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 max-w-md mx-auto">
                <p className="text-accent text-sm font-semibold flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 fill-current" />
                  You're amazing!
                  <Heart className="w-4 h-4 fill-current" />
                </p>
              </div>
            </div>

            <motion.button
              onClick={handleClose}
              className="w-full py-4 px-6 rounded-xl font-bold text-base transition-all bg-accent hover:bg-accent/90 text-black shadow-lg shadow-accent/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
        );

      case "error":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-secondary">
                Something Went Wrong
              </h3>
              <p className="text-tertiary text-sm max-w-sm mx-auto">
                {errorMessage || "An unexpected error occurred"}
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={handleClose}
                className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all bg-white/10 hover:bg-white/15 text-secondary border border-white/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleRetry}
                className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all bg-accent hover:bg-accent/90 text-black shadow-lg shadow-accent/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-primary border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Only show when not processing */}
            {flowState !== "tipping" && flowState !== "approving" && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-tertiary hover:text-secondary transition-colors p-2 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
