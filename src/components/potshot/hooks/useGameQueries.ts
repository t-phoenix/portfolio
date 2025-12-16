/**
 * Contract Query Hooks for Potshot Game
 * 
 * These hooks fetch data from the Potshot smart contract on Base:
 * - useGameState: Fetches global game state (pot, total plays, payouts)
 * - useUserChance: Fetches user-specific data (win chance, claimable winnings, pending tickets)
 * - usePausedState: Checks if the contract is paused
 * - useActivity: Fetches recent game activity (TODO: implement event listening)
 * 
 * Data is cached aggressively and only refetched on critical user actions.
 */

import { useReadContracts } from "wagmi";
import { type GameState, type Activity } from "../helper/types";
import { POTSHOT_CONTRACT_ADDRESS, STARTING_WIN_CHANCE } from "../helper/constants";
import { POTSHOT_CONTRACT } from "../helper/abi";
import { formatUnits } from "viem";

// Cache times - data refreshes only on user actions
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook to fetch game state from contract
 * Fetches: pot, totalTickets, totalWinnings, totalToDev, minBet
 */
export const useGameState = () => {
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "pot",
      },
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "totalTickets",
      },
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "totalWinnings",
      },
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "totalToDev",
      },
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "minBet",
      },
    ],
    query: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    },
  });

  // Parse the results
  const gameState: GameState | undefined = data
    ? {
        currentPot: data[0]?.result ? Number(formatUnits(data[0].result as bigint, 6)) : 0,
        totalPlays: data[1]?.result ? Number(data[1].result) : 0,
        usdcPaidOut: data[2]?.result ? Number(formatUnits(data[2].result as bigint, 6)) : 0,
        usdcToDev: data[3]?.result ? Number(formatUnits(data[3].result as bigint, 6)) : 0,
        userChance: STARTING_WIN_CHANCE, // This is fetched per-user in useUserChance
      }
    : undefined;

  const minBet = data?.[4]?.result
    ? Number(formatUnits(data[4].result as bigint, 6))
    : 1;

  return {
    data: gameState,
    minBet,
    isLoading,
    isError,
    refetch,
  };
};

/**
 * Hook to fetch user's win chance and claimable winnings
 */
export const useUserChance = (address?: `0x${string}`) => {
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "getChance",
        args: address ? [address] : undefined,
      },
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "claimableWinnings",
        args: address ? [address] : undefined,
      },
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "getPendingTicket",
        args: address ? [address] : undefined,
      },
    ],
    query: {
      enabled: !!address,
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    },
  });

  const chance = data?.[0]?.result ? Number(data[0].result) : 0;
  const claimableWinnings = data?.[1]?.result
    ? Number(formatUnits(data[1].result as bigint, 6))
    : 0;
  const pendingTicket = data?.[2]?.result ? Number(data[2].result) : 0;

  return {
    chance,
    claimableWinnings,
    pendingTicket,
    hasPendingTicket: pendingTicket > 0,
    isLoading,
    isError,
    refetch,
  };
};

/**
 * Hook to fetch paused state
 */
export const usePausedState = () => {
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        address: POTSHOT_CONTRACT_ADDRESS,
        abi: POTSHOT_CONTRACT,
        functionName: "paused",
      },
    ],
    query: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
    },
  });

  const isPaused = data?.[0]?.result ? (data[0].result as boolean) : false;

  return {
    isPaused,
    isLoading,
    isError,
    refetch,
  };
};

/**
 * Hook to fetch live activity feed from contract events
 * Note: This is a placeholder. For production, you'd want to:
 * 1. Use useContractEvent or useWatchContractEvent to listen to TicketResolved events
 * 2. Store events in state or use a subgraph/indexer for historical data
 * 3. Format the event data into Activity objects
 */
export const useActivity = (): {
  data: Activity[];
  isLoading: boolean;
  isError: boolean;
} => {
  // TODO: Implement event listening for TicketResolved events
  // For now, return empty array
  return {
    data: [],
    isLoading: false,
    isError: false,
  };
};
