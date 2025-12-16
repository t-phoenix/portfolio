/**
 * Hook to listen for ticket-related events
 * Listens to TicketRequested and TicketResolved events for a specific user
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useWatchContractEvent, useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits, type Log } from "viem";
import { POTSHOT_CONTRACT_ADDRESS } from "../helper/constants";
import { POTSHOT_CONTRACT } from "../helper/abi";

export interface TicketRequestedEvent {
  player: `0x${string}`;
  amount: bigint;
  requestId: bigint;
  playerChance: number;
}

export interface TicketResolvedEvent {
  player: `0x${string}`;
  requestId: bigint;
  randomWord: bigint;
  won: boolean;
  winAmount: bigint;
  newChance: number;
  potAfter: bigint;
}

interface EventLog extends Log {
  args?: any;
}

export const useTicketEvents = (userAddress?: `0x${string}`) => {
  const queryClient = useQueryClient();
  const [ticketRequested, setTicketRequested] = useState<TicketRequestedEvent | null>(null);
  const [ticketResolved, setTicketResolved] = useState<TicketResolvedEvent | null>(null);
  const [isWaitingForResolution, setIsWaitingForResolution] = useState(false);
  
  // Store initial state to detect changes
  const previousChanceRef = useRef<number | null>(null);
  const previousClaimableRef = useRef<number | null>(null);
  const waitStartTimeRef = useRef<number | null>(null);

  // Watch for TicketResolved events - ONLY when waiting for resolution
  // This prevents constant eth_getFilterChanges polling
  useWatchContractEvent({
    address: POTSHOT_CONTRACT_ADDRESS,
    abi: POTSHOT_CONTRACT,
    eventName: "TicketResolved",
    enabled: isWaitingForResolution && !!userAddress,
    onLogs(logs) {
      if (!userAddress) return;
      
      // Filter logs for the current user
      const userLogs = (logs as EventLog[]).filter((log) => {
        return log.args?.player?.toLowerCase() === userAddress.toLowerCase();
      });

      if (userLogs.length > 0) {
        const latestLog = userLogs[userLogs.length - 1];
        const args = latestLog.args as TicketResolvedEvent;
        
        // If newChance is 0 or invalid, wait a moment for contract state to update
        if (args.newChance === 0) {
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['readContract'] });
            setTimeout(() => {
              setTicketResolved(args);
              setIsWaitingForResolution(false);
            }, 1000);
          }, 500);
        } else {
          setTicketResolved(args);
          setIsWaitingForResolution(false);
          queryClient.invalidateQueries({ queryKey: ['readContract'] });
        }
      }
    },
  });

  // Poll contract state while waiting - this is the fallback mechanism
  // Only poll during active resolution, otherwise cache for 5 mins
  const { data: pendingTicketData } = useReadContract({
    address: POTSHOT_CONTRACT_ADDRESS,
    abi: POTSHOT_CONTRACT,
    functionName: "getPendingTicket",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && isWaitingForResolution,
      refetchInterval: isWaitingForResolution ? 2000 : false,
      staleTime: isWaitingForResolution ? 0 : 5 * 60 * 1000,
    },
  });

  const { data: currentChanceData } = useReadContract({
    address: POTSHOT_CONTRACT_ADDRESS,
    abi: POTSHOT_CONTRACT,
    functionName: "getChance",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && isWaitingForResolution,
      refetchInterval: isWaitingForResolution ? 2000 : false,
      staleTime: isWaitingForResolution ? 0 : 5 * 60 * 1000,
    },
  });

  const { data: claimableWinnings, refetch: refetchClaimableWinnings } = useReadContract({
    address: POTSHOT_CONTRACT_ADDRESS,
    abi: POTSHOT_CONTRACT,
    functionName: "claimableWinnings",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: isWaitingForResolution ? 2000 : false,
      staleTime: isWaitingForResolution ? 0 : 5 * 60 * 1000,
    },
  });

  const hasPendingTicket = pendingTicketData ? Number(pendingTicketData) > 0 : false;
  const currentChance = currentChanceData ? Number(currentChanceData) : 0;
  const claimableAmount = claimableWinnings
    ? Number(formatUnits(claimableWinnings as bigint, 6))
    : 0;

  // Reset events
  const resetEvents = useCallback(() => {
    setTicketRequested(null);
    setTicketResolved(null);
    setIsWaitingForResolution(false);
    // Reset polling refs
    waitStartTimeRef.current = null;
    previousChanceRef.current = null;
    previousClaimableRef.current = null;
  }, []);

  // Refetch claimable winnings when ticket is resolved
  useEffect(() => {
    if (ticketResolved) {
      refetchClaimableWinnings();
    }
  }, [ticketResolved, refetchClaimableWinnings]);

  // FALLBACK MECHANISM: Detect resolution by polling contract state
  useEffect(() => {
    if (!isWaitingForResolution) return;

    // Start timer when waiting begins
    if (waitStartTimeRef.current === null) {
      waitStartTimeRef.current = Date.now();
      previousChanceRef.current = currentChance;
      previousClaimableRef.current = claimableAmount;
    }

    // Check if ticket has been resolved (no longer pending)
    if (!hasPendingTicket && ticketResolved === null) {
      // Wait for chance to update (give it a moment to refetch)
      // If currentChance is 0 or same as before, wait for next poll
      if (currentChance === 0 || currentChance === previousChanceRef.current) {
        return; // Wait for next poll cycle
      }

      // Determine if won based on state changes
      const wonByClaimable = claimableAmount > (previousClaimableRef.current || 0);
      const won = wonByClaimable;

      // Synthesize a resolved event
      const syntheticEvent: TicketResolvedEvent = {
        player: userAddress!,
        requestId: ticketRequested?.requestId || BigInt(0),
        randomWord: BigInt(0), // We don't have this from polling
        won,
        winAmount: BigInt(Math.floor(claimableAmount * 1_000_000)), // Convert back to 6 decimals
        newChance: currentChance,
        potAfter: BigInt(0), // We don't have this from polling
      };

      setTicketResolved(syntheticEvent);
      setIsWaitingForResolution(false);
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
      
      // Reset refs
      waitStartTimeRef.current = null;
      previousChanceRef.current = null;
      previousClaimableRef.current = null;
    }
  }, [
    isWaitingForResolution, 
    hasPendingTicket, 
    currentChance, 
    claimableAmount, 
    ticketRequested, 
    ticketResolved, 
    userAddress,
    queryClient
  ]);

  // Manual trigger for waiting state (backup if event is missed)
  const startWaiting = useCallback(() => {
    setIsWaitingForResolution(true);
    waitStartTimeRef.current = Date.now();
    previousChanceRef.current = currentChance;
    previousClaimableRef.current = claimableAmount;
  }, [currentChance, claimableAmount]);

  return {
    ticketRequested,
    ticketResolved,
    isWaitingForResolution,
    claimableAmount,
    resetEvents,
    refetchClaimableWinnings,
    startWaiting,
  };
};
