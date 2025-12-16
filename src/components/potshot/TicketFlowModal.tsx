/**
 * Modal sheet that shows the ticket buying and redemption flow
 * States: Approve USDC -> Buy Ticket -> Wait for Result -> Win/Lose
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Loader2,
  Trophy,
  TrendingUp,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useUSDCApproval, useBuyTicket, useClaimWinnings } from "./hooks/useGameTransactions";
import { useTicketEvents } from "./hooks/useTicketEvents";
import { formatUnits } from "viem";

interface TicketFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributionAmount: number;
  onFlowComplete?: () => void;
}

type FlowState = 
  | "approval" 
  | "approving" 
  | "buyTicket" 
  | "buying" 
  | "waitingForResult" 
  | "won" 
  | "lost"
  | "error";

export const TicketFlowModal: React.FC<TicketFlowModalProps> = ({
  isOpen,
  onClose,
  contributionAmount,
  onFlowComplete,
}) => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [flowState, setFlowState] = useState<FlowState>("approval");
  const [winAmount, setWinAmount] = useState(0);
  const [newChance, setNewChance] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasStartedFlow, setHasStartedFlow] = useState(false); // Track if flow has started

  // Transaction hooks
  const {
    hasEnoughAllowance,
    approveUSDC,
    isApproving,
    isConfirmingApproval,
    isApprovalConfirmed,
    reset: resetApproval,
    error: approvalError,
  } = useUSDCApproval(address);

  const {
    buyTicket,
    isPending: isBuying,
    isConfirming: isConfirmingPurchase,
    isSuccess: isPurchaseSuccess,
    reset: resetPurchase,
    error: buyError,
  } = useBuyTicket();

  const {
    claimWinnings,
    isPending: isClaiming,
    isConfirming: isConfirmingClaim,
    isSuccess: isClaimSuccess,
    error: claimError,
  } = useClaimWinnings();

  // Event listeners
  const {
    ticketRequested,
    ticketResolved,
    claimableAmount,
    resetEvents,
    refetchClaimableWinnings,
    startWaiting,
  } = useTicketEvents(address);
  

  // Handle approval confirmation
  useEffect(() => {
    if (isApprovalConfirmed) {
      setFlowState("buyTicket");
      setErrorMessage("");
      resetApproval();
      // Invalidate queries to refetch allowance
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
    }
  }, [isApprovalConfirmed, resetApproval, queryClient]);

  // Handle approval error
  useEffect(() => {
    if (approvalError) {
      setErrorMessage("Failed to approve USDC. Please try again.");
      setFlowState("approval");
    }
  }, [approvalError]);

  // Handle purchase success - wait for event
  useEffect(() => {
    if (isPurchaseSuccess) {
      setFlowState("waitingForResult");
      setErrorMessage("");
      resetPurchase();
      
      // Start waiting state as backup (in case TicketRequested event is missed)
      setTimeout(() => {
        if (!ticketRequested) {
          startWaiting();
        }
      }, 3000); // Give 3 seconds for event to arrive
      
      // Invalidate queries to refetch game state
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
    }
  }, [isPurchaseSuccess, resetPurchase, queryClient, ticketRequested, startWaiting]);

  // Handle purchase error
  useEffect(() => {
    if (buyError) {
      setErrorMessage("Failed to buy ticket. Please try again.");
      setFlowState("buyTicket");
    }
  }, [buyError]);

  // Handle ticket resolved event
  useEffect(() => {
    if (ticketResolved) {
      // Force immediate refetch to get latest state
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
      
      if (ticketResolved.won) {
        const amount = Number(formatUnits(ticketResolved.winAmount, 6));
        setWinAmount(amount);
        
        // If newChance is 0 or missing, wait for refetch
        if (ticketResolved.newChance === 0) {
          setTimeout(() => {
            // Will be updated by the query refetch
            setNewChance(ticketResolved.newChance || 5); // Fallback to starting chance
          }, 1500);
        } else {
          setNewChance(ticketResolved.newChance);
        }
        
        setFlowState("won");
        setErrorMessage("");
        // Refetch claimable winnings
        refetchClaimableWinnings();
      } else {
        // If newChance is 0 or missing, wait for refetch
        if (ticketResolved.newChance === 0) {
          setTimeout(() => {
            setNewChance(ticketResolved.newChance || 5); // Fallback
          }, 1500);
        } else {
          setNewChance(ticketResolved.newChance);
        }
        
        setFlowState("lost");
        setErrorMessage("");
      }
    }
  }, [ticketResolved, refetchClaimableWinnings, queryClient]);

  // Handle claim success
  useEffect(() => {
    if (isClaimSuccess) {
      // Invalidate queries to update balances
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
      // Trigger refresh callback
      onFlowComplete?.();
      // Close modal after successful claim
      setTimeout(() => {
        handleClose();
      }, 3000); // Give user time to see success message
    }
  }, [isClaimSuccess, queryClient]);

  // Handle claim error
  useEffect(() => {
    if (claimError) {
      setErrorMessage("Failed to claim winnings. Please try again.");
    }
  }, [claimError]);

  // Check if approval is needed on mount - only if flow hasn't started
  useEffect(() => {
    if (isOpen && !hasStartedFlow) {
      if (hasEnoughAllowance(contributionAmount)) {
        setFlowState("buyTicket");
      } else {
        setFlowState("approval");
      }
    }
  }, [isOpen, hasEnoughAllowance, contributionAmount, hasStartedFlow]);

  // Update states based on transaction status
  useEffect(() => {
    if (isApproving || isConfirmingApproval) {
      setFlowState("approving");
    }
  }, [isApproving, isConfirmingApproval]);

  useEffect(() => {
    if (isBuying || isConfirmingPurchase) {
      setFlowState("buying");
    }
  }, [isBuying, isConfirmingPurchase]);

  const handleApprove = async () => {
    try {
      setErrorMessage("");
      setHasStartedFlow(true); // Mark flow as started
      setFlowState("approving"); // Immediately show loading state
      await approveUSDC(contributionAmount);
    } catch (error: any) {
      const message = error?.message || "Failed to approve USDC";
      setErrorMessage(message);
      setFlowState("approval"); // Go back to approval on error
    }
  };

  const handleBuyTicket = async () => {
    try {
      setErrorMessage("");
      setHasStartedFlow(true); // Mark flow as started
      setFlowState("buying"); // Immediately show loading state
      await buyTicket(contributionAmount);
    } catch (error: any) {
      const message = error?.message || "Failed to buy ticket";
      setErrorMessage(message);
      setFlowState("buyTicket"); // Go back to buy ticket on error
    }
  };

  const handleClaimWinnings = async () => {
    try {
      setErrorMessage("");
      await claimWinnings();
    } catch (error: any) {
      const message = error?.message || "Failed to claim winnings";
      setErrorMessage(message);
    }
  };

  const handleClose = () => {
    // Prevent closing during active transactions
    if (flowState === "approving" || flowState === "buying" || flowState === "waitingForResult") {
      return;
    }
    
    // If we completed a win/loss flow, trigger refresh
    if (flowState === "won" || flowState === "lost") {
      onFlowComplete?.();
    }
    
    resetEvents();
    resetApproval();
    resetPurchase();
    setFlowState("approval");
    setErrorMessage("");
    setWinAmount(0);
    setNewChance(0);
    setHasStartedFlow(false); // Reset flow started flag
    onClose();
  };

  const handleRetryFromError = () => {
    setErrorMessage("");
    // Determine which state to return to based on what failed
    if (flowState === "error") {
      // Check which step we were on
      if (hasEnoughAllowance(contributionAmount)) {
        setFlowState("buyTicket");
      } else {
        setFlowState("approval");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 bg-primary backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={flowState === "approving" || flowState === "buying" || flowState === "waitingForResult"}
            className={`absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${
              (flowState === "approving" || flowState === "buying" || flowState === "waitingForResult")
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <X className="w-5 h-5 text-tertiary" />
          </button>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-secondary mb-2">
              Ticket Purchase Flow
            </h2>
            <p className="text-tertiary mb-8">
              Contributing {contributionAmount} USDC
            </p>

            {/* Error State */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-500 mb-1">Error</h4>
                  <p className="text-sm text-secondary">{errorMessage}</p>
                  {flowState === "error" && (
                    <button
                      onClick={handleRetryFromError}
                      className="mt-3 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-secondary text-sm font-semibold transition-all"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Flow States */}
            <div className="space-y-6">
              {/* State 1: Approve USDC */}
              <StateItem
                icon={Circle}
                title="Approve USDC"
                description="Allow Potshot to spend your USDC"
                isActive={flowState === "approval"}
                isLoading={flowState === "approving"}
                isComplete={
                  flowState !== "approval" && flowState !== "approving"
                }
                onAction={handleApprove}
                showButton={flowState === "approval"}
                buttonText="Approve USDC"
              />

              {/* State 2: Buy Ticket */}
              <StateItem
                icon={Circle}
                title="Buy Ticket"
                description={`Purchase ticket for ${contributionAmount} USDC`}
                isActive={flowState === "buyTicket"}
                isLoading={flowState === "buying"}
                isComplete={
                  hasStartedFlow &&
                  flowState !== "approval" &&
                  flowState !== "approving" &&
                  flowState !== "buyTicket" &&
                  flowState !== "buying"
                }
                onAction={handleBuyTicket}
                showButton={flowState === "buyTicket"}
                buttonText="Buy Ticket"
              />

              {/* State 3: Wait for Result */}
              <StateItem
                icon={Circle}
                title="Waiting for Result"
                description={
                  ticketRequested
                    ? `🎲 Chainlink VRF is generating random number... Request ID: ${ticketRequested.requestId.toString().slice(0, 8)}...`
                    : "Chainlink VRF is generating random number..."
                }
                isActive={flowState === "waitingForResult"}
                isLoading={flowState === "waitingForResult"}
                isComplete={flowState === "won" || flowState === "lost"}
                showButton={false}
                extraInfo={
                  flowState === "waitingForResult" && (
                    <div className="mt-3 space-y-2">
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                        <p className="text-sm text-accent flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          This may take 30-60 seconds. Please wait...
                        </p>
                      </div>
                      <p className="text-xs text-tertiary text-center">
                        🔒 Modal will remain open until result is ready
                      </p>
                    </div>
                  )
                }
              />

              {/* State 4a: Won */}
              {flowState === "won" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                  }}
                  transition={{ type: "spring", damping: 15 }}
                  className="p-6 rounded-xl bg-accent/10 border border-accent/30 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <motion.div 
                      className="flex items-center gap-3 mb-4"
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 0.6,
                        repeat: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <Trophy className="w-8 h-8 text-yellow-400" />
                      <h3 className="text-2xl font-bold text-secondary">
                        You Won! 🎉
                      </h3>
                    </motion.div>
                    <motion.p 
                      className="text-accent text-lg mb-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Congratulations! You won {winAmount} USDC!
                    </motion.p>
                    <motion.p 
                      className="text-tertiary text-sm mb-6"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Your chance has been reset to {newChance}%
                    </motion.p>
                  
                    {claimableAmount > 0 && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <p className="text-secondary mb-4">
                          Claimable Amount: <span className="font-bold text-accent">{claimableAmount} USDC</span>
                        </p>
                        <motion.button
                          onClick={handleClaimWinnings}
                          disabled={isClaiming || isConfirmingClaim || isClaimSuccess}
                          className="w-full px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-black font-bold transition-all shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isClaiming || isConfirmingClaim ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {isClaiming ? "Claiming..." : "Confirming..."}
                            </>
                          ) : isClaimSuccess ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Claimed!
                            </>
                          ) : (
                            "Claim Winnings"
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* State 4b: Lost */}
              {flowState === "lost" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="p-6 rounded-xl bg-orange/10 border border-orange/30"
                >
                  <motion.div 
                    className="flex items-center gap-3 mb-4"
                    animate={{ 
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ 
                      duration: 0.5,
                      repeat: 2,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-orange" />
                    <h3 className="text-2xl font-bold text-secondary">
                      Not This Time
                    </h3>
                  </motion.div>
                  <motion.p 
                    className="text-orange text-lg mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    But your odds just got better!
                  </motion.p>
                  <motion.div 
                    className="p-4 rounded-xl bg-orange/10 border border-orange/30 mb-6"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ 
                      scale: [0.9, 1.05, 1], 
                      opacity: 1 
                    }}
                    transition={{ 
                      delay: 0.4,
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        animate={{ 
                          y: [0, -5, 0]
                        }}
                        transition={{ 
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <TrendingUp className="w-6 h-6 text-accent" />
                      </motion.div>
                      <p className="text-secondary font-bold text-xl">
                        New Win Chance: {newChance}%
                      </p>
                    </div>
                    <p className="text-tertiary text-sm">
                      Each play increases your odds. You're getting closer!
                    </p>
                  </motion.div>
                  <motion.button
                    onClick={handleClose}
                    className="w-full px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-secondary font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <X className="w-5 h-5" />
                    Close
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Helper component for individual state items
interface StateItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  isActive: boolean;
  isLoading: boolean;
  isComplete: boolean;
  onAction?: () => void;
  showButton: boolean;
  buttonText?: string;
  extraInfo?: React.ReactNode;
}

const StateItem: React.FC<StateItemProps> = ({
  icon: Icon,
  title,
  description,
  isActive,
  isLoading,
  isComplete,
  onAction,
  showButton,
  buttonText,
  extraInfo,
}) => {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isActive
          ? "border-accent/50 bg-accent/10"
          : isComplete
          ? "border-accent/30 bg-accent/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          ) : isComplete ? (
            <CheckCircle className="w-6 h-6 text-accent" />
          ) : (
            <Icon
              className={`w-6 h-6 ${
                isActive ? "text-accent" : "text-tertiary"
              }`}
            />
          )}
        </div>
        <div className="flex-1">
          <h4
            className={`font-semibold mb-1 ${
              isActive ? "text-secondary" : isComplete ? "text-accent" : "text-tertiary"
            }`}
          >
            {title}
          </h4>
          <p className="text-sm text-tertiary mb-3">{description}</p>
          {extraInfo}
          {showButton && onAction && (
            <button
              onClick={onAction}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-black text-sm font-bold transition-all shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
