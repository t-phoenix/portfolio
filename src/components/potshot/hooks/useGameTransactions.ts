/**
 * Contract Transaction Hooks for Potshot Game
 * 
 * These hooks handle write operations to the Potshot smart contract:
 * - useBuyTicket: Purchase a ticket with USDC
 * - useClaimWinnings: Claim winnings after winning
 * - useApproveUSDC: Approve USDC spending for the Potshot contract
 * 
 * All hooks return transaction state and methods to execute the transaction.
 */

import { useWriteContract, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { POTSHOT_CONTRACT_ADDRESS, USDC_ADDRESS } from "../helper/constants";
import { POTSHOT_CONTRACT, ERC20_ABI } from "../helper/abi";
import { useEffect } from "react";

/**
 * Hook to check USDC allowance and approve if needed
 */
export const useUSDCApproval = (address?: `0x${string}`) => {
  const queryClient = useQueryClient();
  
  const { data: approvalData, refetch: refetchAllowance } = useReadContracts({
    contracts: [
      {
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address ? [address, POTSHOT_CONTRACT_ADDRESS] : undefined,
      },
    ],
    query: {
      enabled: !!address,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
    },
  });

  const currentAllowance = approvalData?.[0]?.result 
    ? (approvalData[0].result as bigint)
    : BigInt(0);

  const { writeContract, data: approveHash, isPending: isApproving, reset, error } = useWriteContract();

  const { isLoading: isConfirmingApproval, isSuccess: isApprovalConfirmed } = 
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  // Refetch allowance after approval is confirmed
  useEffect(() => {
    if (isApprovalConfirmed) {
      refetchAllowance();
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
    }
  }, [isApprovalConfirmed, refetchAllowance, queryClient]);

  const approveUSDC = async (amount: number) => {
    const amountInSmallestUnit = parseUnits(amount.toString(), 6); // USDC has 6 decimals
    
    return writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [POTSHOT_CONTRACT_ADDRESS, amountInSmallestUnit],
    });
  };

  const hasEnoughAllowance = (amount: number) => {
    const amountInSmallestUnit = parseUnits(amount.toString(), 6);
    return currentAllowance >= amountInSmallestUnit;
  };

  return {
    currentAllowance,
    hasEnoughAllowance,
    approveUSDC,
    isApproving,
    isConfirmingApproval,
    isApprovalConfirmed,
    approveHash,
    reset,
    error,
  };
};

/**
 * Hook to buy a ticket
 */
export const useBuyTicket = () => {
  const queryClient = useQueryClient();
  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Invalidate queries after purchase is confirmed
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
    }
  }, [isSuccess, queryClient]);

  const executeBuyTicket = async (amountUSDC: number) => {
    // Convert USDC amount to smallest unit (6 decimals)
    const amountInSmallestUnit = parseUnits(amountUSDC.toString(), 6);

    return writeContract({
      address: POTSHOT_CONTRACT_ADDRESS,
      abi: POTSHOT_CONTRACT,
      functionName: "buyTicket",
      args: [amountInSmallestUnit],
    });
  };

  return {
    buyTicket: executeBuyTicket,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
};

/**
 * Hook to claim winnings
 */
export const useClaimWinnings = () => {
  const queryClient = useQueryClient();
  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Invalidate queries after claim is confirmed
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
    }
  }, [isSuccess, queryClient]);

  const executeClaimWinnings = async () => {
    return writeContract({
      address: POTSHOT_CONTRACT_ADDRESS,
      abi: POTSHOT_CONTRACT,
      functionName: "claimWinnings",
    });
  };

  return {
    claimWinnings: executeClaimWinnings,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

/**
 * Hook to seed the pot (optional - for admin or anyone who wants to add to the pot)
 */
export const useSeedPot = () => {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const executeSeedPot = async (amountUSDC: number) => {
    const amountInSmallestUnit = parseUnits(amountUSDC.toString(), 6);

    return writeContract({
      address: POTSHOT_CONTRACT_ADDRESS,
      abi: POTSHOT_CONTRACT,
      functionName: "seedPot",
      args: [amountInSmallestUnit],
    });
  };

  return {
    seedPot: executeSeedPot,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

/**
 * Hook to tip the developer
 */
export const useTipDev = () => {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const executeTipDev = async (amountUSDC: number) => {
    const amountInSmallestUnit = parseUnits(amountUSDC.toString(), 6);

    return writeContract({
      address: POTSHOT_CONTRACT_ADDRESS,
      abi: POTSHOT_CONTRACT,
      functionName: "tipDev",
      args: [amountInSmallestUnit],
    });
  };

  return {
    tipDev: executeTipDev,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};
