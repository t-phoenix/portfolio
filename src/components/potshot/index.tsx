import { useState, useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { PotshotHeader } from "./PotshotHeader";
import { CurrentPotCard } from "./CurrentPotCard";
import { WinChanceCard } from "./WinChanceCard";
import { BuyTicketCard } from "./BuyTicketCard";
import { StatsGrid } from "./StatsGrid";
import { HowItWorksCard } from "./HowItWorksCard";
import { CustomScrollbarStyles } from "./helper/CustomScrollbarStyles";
import { TicketFlowModal } from "./TicketFlowModal";
import { useGameState, usePausedState, useUserChance } from "./hooks/useGameQueries";
import { useBalances } from "./hooks/useBalances";
import { MIN_TICKET_PRICE, ESTIMATED_GAS_FEE, POTSHOT_CONTRACT_ADDRESS } from "./helper/constants";

const Potshot = () => {
  // Local state management
  const [contributionAmount, setContributionAmount] = useState(MIN_TICKET_PRICE);
  const [customAmount, setCustomAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Connection
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  // Fetch game state and user chance
  const { data: gameStateData, minBet, isLoading: isLoadingGameState, refetch: refetchGameState } = useGameState();
  const { isPaused } = usePausedState();
  const { 
    chance: userChance,
    isLoading: isLoadingUserChance,
    refetch: refetchUserChance
  } = useUserChance(address);

  // Fetch user balances on Base
  const {
    ethBalance,
    ethDecimals,
    usdcBalance,
    usdcDecimals,
    isLoading: isLoadingBalances,
    refetchBalances,
  } = useBalances(address as `0x${string}`);

  // Convert balances to number format for comparison
  // ETH: wei to ETH (divide by 10^18)
  const baseETHBalance = Number(ethBalance) / 10 ** Number(ethDecimals);
  // USDC: smallest unit to USDC (divide by 10^6 for USDC which has 6 decimals)
  const baseUSDCBalance = Number(usdcBalance) / 10 ** Number(usdcDecimals);

  // Check if user has enough funds on Base
  const hasEnoughUSDC = baseUSDCBalance >= contributionAmount;
  const hasEnoughGas = baseETHBalance >= ESTIMATED_GAS_FEE;
  const canBuyDirectly = hasEnoughUSDC && hasEnoughGas;

  // Use loaded game state or default values
  const gameState = {
    currentPot: gameStateData?.currentPot ?? 0,
    userChance: userChance ?? 0,
    usdcPaidOut: gameStateData?.usdcPaidOut ?? 0,
    usdcToDev: gameStateData?.usdcToDev ?? 0,
    totalPlays: gameStateData?.totalPlays ?? 0,
  };

  // Refetch all data when modal closes (after ticket purchase/claim)
  useEffect(() => {
    if (!isModalOpen && address) {
      refetchBalances();
      refetchGameState();
      refetchUserChance();
    }
  }, [isModalOpen, address, refetchBalances, refetchGameState, refetchUserChance]);

  // Refetch on wallet connection
  useEffect(() => {
    if (isConnected && address) {
      refetchBalances();
      refetchGameState();
      refetchUserChance();
    }
  }, [isConnected, address, refetchBalances, refetchGameState, refetchUserChance]);

  // Transaction handlers
  const handleBuyTicket = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    // Check if on correct chain
    if (chain?.id !== base.id) {
      try {
        await switchChain({ chainId: base.id });
      } catch (error) {
        alert("Please switch to Base network in your wallet");
        return;
      }
    }

    if (!canBuyDirectly) {
      alert("Insufficient balance. Please add funds to your Base wallet.");
      return;
    }

    // Open modal to handle the flow
    setIsModalOpen(true);
  };

  const handleSelectAmount = (amount: number) => {
    setContributionAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string, numericValue: number) => {
    setCustomAmount(value);
    if (value && numericValue >= MIN_TICKET_PRICE) {
      setContributionAmount(numericValue);
    }
  };

  return (
    <section id="potshot" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <PotshotHeader />

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Game Interface */}
          <div className="lg:col-span-7 space-y-6">
            

            <WinChanceCard
              userChance={gameState.userChance}
              isConnected={isConnected}
              isLoading={isLoadingGameState || isLoadingUserChance}
            />

            <BuyTicketCard
              contributionAmount={contributionAmount}
              customAmount={customAmount}
              isConnected={isConnected}
              isProcessing={false}
              isGamePaused={isPaused}
              minTicketPrice={minBet || MIN_TICKET_PRICE}
              baseUSDCBalance={baseUSDCBalance}
              baseETHBalance={baseETHBalance}
              hasEnoughUSDC={hasEnoughUSDC}
              hasEnoughGas={hasEnoughGas}
              canBuyDirectly={canBuyDirectly}
              isLoadingBalances={isLoadingBalances}
              onSelectAmount={handleSelectAmount}
              onCustomAmountChange={handleCustomAmountChange}
              onBuyTicket={handleBuyTicket}
            />

            {/* Disclaimer - Only shown when wallet is not connected */}
            {!isConnected && (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-amber-400 text-sm">⚠️</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="text-amber-400 font-semibold text-sm uppercase tracking-wide">
                        Important Disclaimer
                      </h4>
                      <p className="text-neutral-300 text-sm leading-relaxed">
                        This game is purely designed to showcase skill and have fun along the way. 
                        Please <span className="font-semibold text-white">gamble responsibly</span> and 
                        only participate with amounts you can afford to lose.
                      </p>
                    </div>
                  </div>
                  {/* Contract Address Link */}
                <div className="text-center mt-4">
                  <a 
                    href={`https://basescan.org/address/${POTSHOT_CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-neutral-400 text-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Contract:</span>
                    <code className="font-mono">{POTSHOT_CONTRACT_ADDRESS}</code>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                </div>
                
                
              </div>
            )}

            
          </div>

          {/* Right Column - Info */}
          <div className="lg:col-span-5 space-y-8">
            <CurrentPotCard 
              currentPot={gameState.currentPot} 
              isLoading={isLoadingGameState || isLoadingUserChance}
            />
            
            <StatsGrid 
              gameState={gameState} 
              isLoading={isLoadingGameState || isLoadingUserChance}
            />
            <HowItWorksCard />
          </div>
        </div>
      </div>

      {/* Ticket Flow Modal */}
      <TicketFlowModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Refetch data after modal closes
          setTimeout(() => {
            refetchGameState();
            refetchUserChance();
          }, 500);
        }}
        contributionAmount={contributionAmount}
      />

      <CustomScrollbarStyles />
    </section>
  );
};

export default Potshot;
