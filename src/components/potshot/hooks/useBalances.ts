import { useBalance, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { ERC20_ABI } from "../helper/abi";
import { USDC_ADDRESS } from "../helper/constants";

// Cache times - refreshes only on user actions
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook to fetch user's USDC and ETH balances on Base
 * Returns raw balance values with decimals
 */
export const useBalances = (address?: `0x${string}`) => {
  const isEnabled = Boolean(address);

  // Fetch ETH balance using wagmi's useBalance
  const {
    data: ethBalanceData,
    isLoading: isLoadingETH,
    error: ethError,
    refetch: refetchETH,
  } = useBalance({
    address,
    chainId: base.id,
    query: {
      enabled: isEnabled,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    },
  });

  // Fetch USDC balance using contract read
  const usdcContracts = { address: USDC_ADDRESS, abi: ERC20_ABI, chainId: base.id };

  const {
    data: usdcBalanceData,
    isLoading: isLoadingUSDC,
    error: usdcError,
    refetch: refetchUSDC,
  } = useReadContracts({
    contracts: [
      {
        ...usdcContracts,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        ...usdcContracts,
        functionName: "decimals",
      },
      {
        ...usdcContracts,
        functionName: "symbol",
      },
    ],
    query: {
      enabled: isEnabled,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    },
  });

  // Combined refetch function to refresh all balances
  const refetchBalances = async () => {
    await Promise.all([refetchETH(), refetchUSDC()]);
  };

  return {
    // ETH balance in raw format (wei)
    ethBalance: ethBalanceData?.value ?? BigInt(0),
    ethDecimals: ethBalanceData?.decimals ?? 18,
    ethSymbol: ethBalanceData?.symbol ?? "ETH",

    // USDC balance in raw format (smallest unit)
    usdcBalance: usdcBalanceData?.[0].result ?? BigInt(0),
    usdcDecimals: usdcBalanceData?.[1].result ?? 6,
    usdcSymbol: usdcBalanceData?.[2].result ?? "USDC",

    // Loading states
    isLoading: isLoadingETH || isLoadingUSDC,
    isLoadingETH,
    isLoadingUSDC,

    // Error states
    ethError,
    usdcError,

    // Refetch functions
    refetchBalances,
    refetchETH,
    refetchUSDC,
  };
};