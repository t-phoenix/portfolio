"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import NexusProvider, { useNexus } from "../nexus/NexusProvider";
import UnifiedBalance from "../unified-balance/unified-balance";
import SwapWidget from "../swaps/swap-widget";
import type { EthereumProvider } from "@avail-project/nexus-core";
import { Loader2, Wallet, ArrowUpDown, X } from "lucide-react";

interface BridgeFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type TabType = "balance" | "swap";

const ScrollableContainer = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle wheel events explicitly to ensure scrolling works
  const handleWheel = (e: React.WheelEvent) => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isScrollable = scrollHeight > clientHeight;

    if (isScrollable) {
      // Prevent the event from bubbling to prevent body scroll
      e.stopPropagation();

      // Check if we're at the bounds
      const isAtTop = scrollTop === 0 && e.deltaY < 0;
      const isAtBottom =
        scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

      if (!isAtTop && !isAtBottom) {
        // Let the scroll happen naturally
        return;
      }
    }
  };

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      className="max-h-[60vh] overflow-y-auto overscroll-contain custom-scrollbar"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.2) transparent",
      }}
    >
      {children}
    </div>
  );
};

const BridgeFundsModalContent = ({
  onComplete,
  activeTab,
  setActiveTab,
}: {
  onComplete?: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) => {
  const { connector } = useAccount();
  const {
    nexusSDK,
    handleInit,
    loading,
    bridgableBalance,
    swapBalance,
    fetchSwapBalance,
  } = useNexus();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize Nexus SDK when modal opens
  useEffect(() => {
    const initNexus = async () => {
      if (!connector || nexusSDK || loading || isInitializing) return;

      setIsInitializing(true);
      setInitError(null);

      try {
        const provider = await connector.getProvider();
        await handleInit(provider as EthereumProvider);
      } catch (error) {
        console.error("Failed to initialize Nexus:", error);
        setInitError("Failed to initialize. Please try again.");
      } finally {
        setIsInitializing(false);
      }
    };

    initNexus();
  }, [connector, nexusSDK, handleInit, loading, isInitializing]);

  // Fetch swap balance when SDK is initialized
  useEffect(() => {
    if (nexusSDK && !swapBalance) {
      fetchSwapBalance();
    }
  }, [nexusSDK, swapBalance, fetchSwapBalance]);

  // Show loading state while initializing
  if (loading || isInitializing || !nexusSDK) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-accent" />
        </motion.div>
        <p className="text-secondary text-sm">
          {initError ? initError : "Initializing Nexus SDK..."}
        </p>
        {initError && (
          <motion.button
            onClick={() => {
              setInitError(null);
              setIsInitializing(false);
            }}
            className="text-accent hover:text-accent/80 text-sm underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Custom Tab Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
        <motion.button
          onClick={() => setActiveTab("balance")}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
            activeTab === "balance"
              ? "bg-accent text-black shadow-lg shadow-orange/30"
              : "text-tertiary hover:text-secondary hover:bg-white/5"
          }`}
          whileHover={{ scale: activeTab !== "balance" ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet className="w-4 h-4" />
          <span>Unified Balance</span>
        </motion.button>
        <motion.button
          onClick={() => setActiveTab("swap")}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
            activeTab === "swap"
              ? "bg-accent text-black shadow-lg shadow-orange/30"
              : "text-tertiary hover:text-secondary hover:bg-white/5"
          }`}
          whileHover={{ scale: activeTab !== "swap" ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Swap Assets</span>
        </motion.button>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {activeTab === "balance" && (
          <ScrollableContainer>
            {bridgableBalance ? (
              <div className="[&_*]:!border-white/10 [&_.bg-card]:!bg-white/5 [&_.text-muted-foreground]:!text-tertiary [&_.text-foreground]:!text-secondary">
                <UnifiedBalance />
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            )}
          </ScrollableContainer>
        )}

        {activeTab === "swap" && (
          <ScrollableContainer>
            {swapBalance ? (
              <SwapWidget
                onComplete={onComplete}
                onError={() => console.error("Swap error")}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <p className="text-tertiary text-sm">
                    Loading your balances...
                  </p>
                </div>
              </div>
            )}
            {/* Info Banner */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mt-4">
              <p className="text-accent text-xs text-center">
                💡 Swap any asset across chains. Select source and destination,
                enter the amount, and we'll handle the rest!
              </p>
            </div>
          </ScrollableContainer>
        )}
      </div>
    </div>
  );
};

export const BridgeFundsModal = ({
  isOpen,
  onClose,
  onComplete,
}: BridgeFundsModalProps) => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("swap");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("swap");
    }
  }, [isOpen]);

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isConnected) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-primary border border-white/10 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-tertiary hover:text-secondary transition-colors p-2 rounded-lg hover:bg-white/5 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2 ml-2">
              <div>
                <h3 className="text-xl font-bold text-secondary">
                  Get USDC on Base
                </h3>
                <p className="text-tertiary text-sm">
                  Swap any asset to USDC on Base
                </p>
              </div>
            </div>

            {/* Content - Allow this to grow and contain scroll */}
            <div className="flex-1 min-h-0">
              <NexusProvider config={{ network: "mainnet" }}>
                <BridgeFundsModalContent
                  onComplete={handleComplete}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </NexusProvider>
            </div>
            <p className="text-tertiary text-sm mt-4 mr-4 text-right">
              Powered by{" "}
              <a
                href="https://availproject.org/nexus"
                target="_blank"
                className="text-accent hover:text-accent/80"
              >
                Avail Nexus
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BridgeFundsModal;
