"use client";

import { useCallback, useMemo, useRef } from "react";
import { ArrowDownUp, Loader2, RefreshCcw } from "lucide-react";
import { useNexus } from "../nexus/NexusProvider";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import useHover from "./hooks/useHover";
import SourceContainer from "./components/source-container";
import DestinationContainer from "./components/destination-container";
import ViewTransaction from "./components/view-transaction";
import useSwaps, { type SwapInputs } from "./hooks/useSwaps";

function SwapWidget({
  onComplete,
  onStart,
  onError,
}: Readonly<{
  onComplete?: (amount?: string) => void;
  onStart?: () => void;
  onError?: () => void;
}>) {
  const sourceContainer = useRef<HTMLDivElement | null>(null);
  const destinationContainer = useRef<HTMLDivElement | null>(null);
  const { nexusSDK, swapIntent, swapBalance, fetchSwapBalance, getFiatValue } =
    useNexus();
  const {
    status,
    inputs,
    swapMode,
    setSwapMode,
    txError,
    setInputs,
    setStatus,
    setTxError,
    steps,
    reset,
    explorerUrls,
    availableBalance,
    availableStables,
    formatBalance,
    destinationBalance,
  } = useSwaps({
    nexusSDK,
    swapIntent,
    swapBalance,
    fetchBalance: fetchSwapBalance,
    onComplete,
    onStart,
    onError,
  });
  const sourceHovered = useHover(sourceContainer);
  const destinationHovered = useHover(destinationContainer);

  const handleInputSwitch = useCallback(() => {
    swapIntent.current?.deny();
    swapIntent.current = null;

    // Always reset to exactIn mode and clear amounts when switching
    setSwapMode("exactIn");

    if (!inputs?.fromToken || !inputs?.toToken) {
      const switched: SwapInputs = {
        fromChainID: inputs.toChainID,
        toChainID: inputs.fromChainID,
        fromToken: undefined,
        toToken: undefined,
        fromAmount: undefined,
        toAmount: undefined,
      };
      setInputs(switched);
      return;
    }
    const isValidSource = swapBalance?.find(
      (bal) => bal.symbol === inputs.toToken?.symbol
    );
    if (!isValidSource) {
      const switched: SwapInputs = {
        fromChainID: inputs.toChainID,
        toToken: {
          tokenAddress: inputs.fromToken?.contractAddress,
          decimals: inputs.fromToken?.decimals,
          symbol: inputs.fromToken?.symbol,
          name: inputs.fromToken?.name,
          logo: inputs.fromToken?.logo,
        },
        fromToken: undefined,
        toChainID: inputs.fromChainID,
        fromAmount: undefined,
        toAmount: undefined,
      };
      setInputs(switched);
      return;
    }
    const switched: SwapInputs = {
      fromToken: {
        contractAddress: inputs.toToken?.tokenAddress,
        decimals: inputs.toToken?.decimals,
        symbol: inputs.toToken?.symbol,
        name: inputs.toToken?.name,
        logo: inputs.toToken?.logo,
      },
      fromChainID: inputs.toChainID,
      toToken: {
        tokenAddress: inputs.fromToken?.contractAddress,
        decimals: inputs.fromToken?.decimals,
        symbol: inputs.fromToken?.symbol,
        name: inputs.fromToken?.name,
        logo: inputs.fromToken?.logo,
      },
      toChainID: inputs.fromChainID,
      fromAmount: undefined,
      toAmount: undefined,
    };
    setInputs(switched);
  }, [inputs, swapIntent, swapBalance, setSwapMode, setInputs]);

  const buttonIcons = useMemo(() => {
    if (status === "simulating") {
      return <Loader2 className="animate-spin size5" />;
    }
    return swapMode === "exactIn" ? (
      <ArrowDownUp className="size-5" />
    ) : (
      <RefreshCcw className="size-5" />
    );
  }, [status, swapMode]);

  return (
    <>
      <div className="w-full bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10">
        <div className="flex flex-col items-center w-full relative gap-y-2">
          {/* Sell section */}
          <div
            ref={sourceContainer}
            className="flex flex-col gap-y-3 w-full rounded-xl bg-white/5 p-4 border border-white/10"
          >
            <SourceContainer
              status={status}
              sourceHovered={sourceHovered}
              inputs={inputs}
              availableBalance={availableBalance}
              swapBalance={swapBalance}
              swapMode={swapMode}
              swapIntent={swapIntent}
              setInputs={setInputs}
              setSwapMode={setSwapMode}
              setTxError={setTxError}
              getFiatValue={getFiatValue}
              formatBalance={formatBalance}
            />
          </div>

          {/* Swap arrow / mode toggle */}
          <Button
            variant={"secondary"}
            size={"icon-lg"}
            onClick={handleInputSwitch}
            title="Toggle between exact in and exact out"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 !bg-orange hover:!bg-orange/90 !text-black !border-4 !border-primary rounded-full"
            disabled={status === "simulating" || status === "swapping"}
          >
            {buttonIcons}
          </Button>
          <Separator />

          {/* Buy section */}
          <div
            className="flex flex-col gap-y-3 w-full rounded-xl bg-white/5 p-4 border border-white/10"
            ref={destinationContainer}
          >
            <DestinationContainer
              destinationHovered={destinationHovered}
              inputs={inputs}
              setInputs={setInputs}
              swapIntent={swapIntent}
              destinationBalance={destinationBalance}
              swapBalance={swapBalance}
              availableStables={availableStables}
              swapMode={swapMode}
              status={status}
              setSwapMode={setSwapMode}
              getFiatValue={getFiatValue}
              formatBalance={formatBalance}
            />
          </div>
        </div>
        {status === "error" && (
          <p className="text-red-400 text-sm mt-3 text-center">{txError}</p>
        )}
      </div>

      {status !== "idle" && (
        <div className="mt-4">
          <ViewTransaction
            txError={txError}
            explorerUrls={explorerUrls}
            steps={steps}
            status={status}
            swapIntent={swapIntent}
            getFiatValue={getFiatValue}
            nexusSDK={nexusSDK}
            setStatus={setStatus}
            reset={reset}
          />
        </div>
      )}
    </>
  );
}

export default SwapWidget;
