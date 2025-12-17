import React, { type RefObject } from "react";
import { Label } from "../../ui/label";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import {
  CHAIN_METADATA,
  type OnSwapIntentHookData,
  type UserAsset,
  type SUPPORTED_CHAINS_IDS,
} from "@avail-project/nexus-core";
import {
  type SwapInputs,
  type SwapMode,
  type TransactionStatus,
  type DestinationTokenInfo,
} from "../hooks/useSwaps";
import { TokenIcon } from "./token-icon";
import AmountInput from "./amount-input";
import { usdFormatter } from "../../common";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { ChevronDown } from "lucide-react";
import DestinationAssetSelect from "./destination-asset-select";

interface DestinationContainerProps {
  destinationHovered: boolean;
  inputs: SwapInputs;
  swapIntent: RefObject<OnSwapIntentHookData | null>;
  destinationBalance?: UserAsset["breakdown"][0];
  swapBalance: UserAsset[] | null;
  availableStables: UserAsset[];
  swapMode: SwapMode;
  status: TransactionStatus;
  setInputs: (inputs: Partial<SwapInputs>) => void;
  setSwapMode: (mode: SwapMode) => void;
  getFiatValue: (amount: number, token: string) => number;
  formatBalance: (
    balance?: string | number,
    symbol?: string,
    decimals?: number
  ) => string | undefined;
}

// Pre-configured destination options on Base
const BASE_CHAIN_ID = 8453 as SUPPORTED_CHAINS_IDS;
const BASE_DESTINATION_OPTIONS: DestinationTokenInfo[] = [
  {
    tokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as `0x${string}`,
    decimals: 6,
    logo: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
    name: "USD Coin",
    symbol: "USDC",
    chainId: BASE_CHAIN_ID,
  },
  {
    tokenAddress: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    decimals: 18,
    logo: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    name: "Ether",
    symbol: "ETH",
    chainId: BASE_CHAIN_ID,
  },
];

const DestinationContainer: React.FC<DestinationContainerProps> = ({
  destinationHovered,
  inputs,
  swapIntent,
  destinationBalance,
  swapBalance,
  swapMode,
  status,
  setInputs,
  setSwapMode,
  getFiatValue,
  formatBalance,
}) => {
  const isDisabled = status === "simulating" || status === "swapping";

  // In exactOut mode, show user's input; in exactIn mode, show calculated destination
  const displayedAmount =
    swapMode === "exactOut"
      ? inputs.toAmount ?? ""
      : formatBalance(
          swapIntent?.current?.intent?.destination?.amount,
          swapIntent?.current?.intent?.destination?.token?.symbol,
          swapIntent?.current?.intent?.destination?.token?.decimals
        ) ?? "";

  const handleQuickSelect = (token: DestinationTokenInfo) => {
    setInputs({
      toToken: token,
      toChainID: BASE_CHAIN_ID,
      toAmount: undefined,
      fromAmount: undefined,
    });
    setSwapMode("exactIn");
  };

  return (
    <div className="rounded-xl flex flex-col items-center w-full gap-y-4">
      <div className="w-full flex items-center justify-between">
        <Label className="text-lg font-medium text-white">Buy</Label>
        <div
          className={cn(
            "flex transition-all duration-150 ease-out w-full justify-end gap-x-2",
            destinationHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1"
          )}
        >
          {BASE_DESTINATION_OPTIONS.map((option) => (
            <Button
              key={option.symbol}
              size={"icon-sm"}
              variant={"secondary"}
              disabled={isDisabled}
              onClick={() => handleQuickSelect(option)}
              className={cn(
                "px-6 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 hover:-translate-y-0.5 transition-all",
                inputs.toToken?.symbol === option.symbol &&
                  inputs.toChainID === BASE_CHAIN_ID
                  ? "bg-white/20 border-white/20"
                  : ""
              )}
            >
              <p className="text-xs font-medium">{option.symbol}</p>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-x-4 w-full">
        <AmountInput
          amount={displayedAmount}
          onChange={(val) => {
            setSwapMode("exactOut");
            setInputs({ toAmount: val, fromAmount: undefined });
          }}
          disabled={isDisabled}
        />
        <Dialog>
          <DialogTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-x-3 bg-white/10 hover:bg-white/15 border border-white/10 min-w-max rounded-full p-1 pr-3 cursor-pointer transition-colors",
                isDisabled ? "pointer-events-none select-none opacity-50" : ""
              )}
            >
              <TokenIcon
                symbol={inputs?.toToken?.symbol}
                tokenLogo={inputs?.toToken?.logo}
                chainLogo={
                  inputs?.toChainID
                    ? CHAIN_METADATA[inputs?.toChainID]?.logo
                    : undefined
                }
                size="lg"
              />
              <span className="font-medium text-white">
                {inputs?.toToken?.symbol || "Select"}
              </span>
              <ChevronDown size={16} className="text-tertiary" />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-md! bg-primary border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Select Destination Token</DialogTitle>
            </DialogHeader>
            <DestinationAssetSelect
              onSelect={(toChainID, toToken) =>
                setInputs({ ...inputs, toChainID, toToken })
              }
              swapBalance={swapBalance}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center justify-between gap-x-4 w-full">
        {swapIntent?.current?.intent?.destination?.amount && inputs?.toToken ? (
          <span className="text-sm text-tertiary">
            {usdFormatter.format(
              getFiatValue(
                Number.parseFloat(
                  swapIntent?.current?.intent?.destination?.amount
                ),
                inputs.toToken?.logo
              )
            )}
          </span>
        ) : (
          <span className="h-5" />
        )}
        {inputs?.toToken ? (
          <span className="text-sm text-tertiary">
            {formatBalance(
              destinationBalance?.balance,
              inputs?.toToken?.symbol,
              destinationBalance?.decimals
            ) ?? ""}
          </span>
        ) : (
          <span className="h-5" />
        )}
      </div>
    </div>
  );
};

export default DestinationContainer;
