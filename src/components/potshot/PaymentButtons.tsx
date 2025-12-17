import { useState } from "react";
import { motion } from "framer-motion";
import { useDisconnect, useAccount } from "wagmi";
import { useAppKit, useAppKitState } from "@reown/appkit/react";
import { BridgeFundsModal } from "./BridgeFundsModal";

interface PaymentButtonsProps {
  isConnected: boolean;
  isProcessing: boolean;
  isGamePaused: boolean;
  canBuyDirectly: boolean;
  contributionAmount: number;
  minTicketPrice: number;
  baseUSDCBalance: number;
  baseETHBalance: number;
  hasEnoughUSDC: boolean;
  hasEnoughGas: boolean;
  isLoadingBalances: boolean;
  onBuyTicket: () => void;
  onRefreshBalances?: () => void;
}

export const PaymentButtons = ({
  isConnected,
  isProcessing,
  isGamePaused,
  canBuyDirectly,
  contributionAmount,
  minTicketPrice,
  baseUSDCBalance,
  baseETHBalance,
  hasEnoughUSDC,
  hasEnoughGas,
  isLoadingBalances,
  onBuyTicket,
  onRefreshBalances,
}: PaymentButtonsProps) => {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { open } = useAppKit();
  const { open: isModalOpen, loading: isModalLoading } = useAppKitState();
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = () => {
    open({ view: 'Connect' });
  };

  // Check if connecting (modal is open or loading)
  const isConnecting = isModalOpen || isModalLoading;

  if(isGamePaused){
    return(
      <motion.button
        
        className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-orange/10 text-white border border-orange/50 transition-all"
        whileHover={{ scale: 1 }}
        whileTap={{ scale: 0.98 }}
      >
        🥲 Game is Paused
      </motion.button>
    )
  }
  

  // Wallet Connect Button
  if (!isConnected) {
    return (
      <motion.button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
          isConnecting 
            ? "bg-orange/50 text-white/70 cursor-wait border border-orange/30"
            : "bg-orange hover:bg-orange/90 hover:shadow-lg hover:shadow-orange/30 text-white border border-orange/50"
        }`}
        whileHover={!isConnecting ? { scale: 1.02 } : {}}
        whileTap={!isConnecting ? { scale: 0.98 } : {}}
      >
        {isConnecting ? (
          <motion.div
            className="flex items-center justify-center gap-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            Connecting...
          </motion.div>
        ) : (
          <span>🔌 Connect Wallet to Play</span>
        )}
      </motion.button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Connected Wallet Info */}
      {address && (
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-tertiary text-xs">Connected:</span>
              <span className="text-secondary font-mono text-sm">{formatAddress(address)}</span>
            </div>
            <motion.button
              onClick={() => disconnect()}
              disabled={isProcessing}
              className="px-3 py-1 rounded-lg font-semibold text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/20 transition-all"
              whileHover={!isProcessing ? { scale: 1.05 } : {}}
              whileTap={!isProcessing ? { scale: 0.95 } : {}}
              title="Disconnect Wallet"
            >
              Disconnect
            </motion.button>
          </div>
        </div>
      )}

      {/* Base Balance Info */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="mb-2">
          <p className="text-tertiary text-xs">Your Base Balance:</p>
        </div>

        {/* Balance Display */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              {isLoadingBalances ? (
                <span className="text-secondary font-semibold inline-flex items-center gap-2">
                  <span className="animate-pulse bg-white/20 h-4 w-20 rounded inline-block">--</span>
                  <span className="text-gray-400">USDC</span>
                </span>
              ) : (
                <>
                  <span className="text-secondary font-semibold">
                    {baseUSDCBalance.toFixed(4)} USDC
                  </span>
                  {!hasEnoughUSDC && (
                    <span className="text-red-400 text-xs ml-2">
                      (Need {contributionAmount.toFixed(2)})
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div>
              {isLoadingBalances ? (
                <span className="text-secondary font-semibold inline-flex items-center gap-2">
                  <span className="animate-pulse bg-white/20 h-4 w-20 rounded inline-block">--</span>
                  <span className="text-gray-400">ETH</span>
                </span>
              ) : (
                <>
                  <span className="text-secondary font-semibold">
                    {baseETHBalance.toFixed(4)} ETH
                  </span>
                  {!hasEnoughGas && (
                    <span className="text-red-400 text-xs ml-2">
                      (Low gas)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {canBuyDirectly && (
            <span className="text-accent text-xs font-semibold">✓ Ready</span>
          )}
        </div>
      </div>

      {canBuyDirectly ? (
        /* Direct Buy Button */
        <motion.button
          onClick={onBuyTicket}
          disabled={isProcessing || contributionAmount < minTicketPrice}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
            isProcessing || contributionAmount < minTicketPrice
              ? "bg-white/10 text-white/50 cursor-not-allowed border border-white/20"
              : "bg-orange hover:bg-orange/90 hover:shadow-lg hover:shadow-orange/30 text-white border border-orange/50"
          }`}
          whileHover={!isProcessing && contributionAmount >= minTicketPrice ? { scale: 1.02 } : {}}
          whileTap={!isProcessing && contributionAmount >= minTicketPrice ? { scale: 0.98 } : {}}
        >
          {isProcessing ? (
            <motion.div
              className="flex items-center justify-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              Processing...
            </motion.div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🎫 Buy Ticket (${contributionAmount.toFixed(2)} USDC)
            </span>
          )}
        </motion.button>
      ) : (
        /* Insufficient Balance Warning */
        <div className="w-full py-4 px-6 rounded-xl border-2 border-red-400/30 bg-red-400/10">
          <p className="text-red-400 font-semibold text-center">
            {!hasEnoughUSDC && !hasEnoughGas && "Insufficient USDC and ETH"}
            {!hasEnoughUSDC && hasEnoughGas && "Insufficient USDC"}
            {hasEnoughUSDC && !hasEnoughGas && "Insufficient ETH for gas"}
          </p>
          <p className="text-tertiary text-xs text-center mt-1 mb-3">
            Swap any asset to USDC on Base using Avail Nexus
          </p>
          
          {/* Swap Funds Button */}
          <motion.button
            onClick={() => setIsBridgeModalOpen(true)}
            className="w-full py-3 px-4 rounded-lg font-semibold text-sm bg-gradient-to-r from-orange/20 to-amber-500/20 hover:from-orange/30 hover:to-amber-500/30 text-orange border border-orange/30 hover:border-orange/50 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>🔄</span>
            Swap to USDC on Base
          </motion.button>
        </div>
      )}

      {/* Bridge Funds Modal */}
      <BridgeFundsModal
        isOpen={isBridgeModalOpen}
        onClose={() => {
          setIsBridgeModalOpen(false);
          // Refresh balances when modal closes (user may have bridged assets)
          onRefreshBalances?.();
        }}
        onComplete={() => {
          // Refresh balances after successful bridge/swap
          onRefreshBalances?.();
        }}
      />
    </div>
  );
};
