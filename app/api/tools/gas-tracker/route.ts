import { NextRequest, NextResponse } from 'next/server';

interface GasPrice {
  chain: string;
  chainId: number;
  standard: number;
  fast: number;
  instant: number;
  baseFee: number;
  priorityFee: number;
  estimatedCostUsd: {
    transfer: number;
    swap: number;
    nftMint: number;
  };
  lastUpdated: string;
}

interface GasTrackerResponse {
  prices: GasPrice[];
  ethPrice: number;
  btcGasRate: number;
  timestamp: string;
}

const CHAINS = [
  { name: 'Ethereum', id: 1, symbol: 'ETH', baseGas: 21000 },
  { name: 'Base', id: 8453, symbol: 'ETH', baseGas: 21000 },
  { name: 'Arbitrum', id: 42161, symbol: 'ETH', baseGas: 21000 },
  { name: 'Optimism', id: 10, symbol: 'ETH', baseGas: 21000 },
  { name: 'Polygon', id: 137, symbol: 'MATIC', baseGas: 21000 },
  { name: 'BSC', id: 56, symbol: 'BNB', baseGas: 21000 },
  { name: 'Avalanche', id: 43114, symbol: 'AVAX', baseGas: 21000 },
];

function generateRealisticGasPrice(chainId: number): Omit<GasPrice, 'chain' | 'chainId'> {
  const baseMultipliers: Record<number, number> = {
    1: 1,
    8453: 0.001,
    42161: 0.01,
    10: 0.001,
    137: 0.00001,
    56: 0.00001,
    43114: 0.00001,
  };

  const multiplier = baseMultipliers[chainId] || 1;
  const baseGwei = 15 + Math.random() * 20;
  const ethPrice = 1850 + Math.random() * 100;

  const standard = baseGwei * multiplier;
  const fast = standard * 1.2;
  const instant = standard * 1.5;

  const gweiToEth = (gwei: number) => gwei * 1e-9;

  return {
    standard: Math.round(standard * 100) / 100,
    fast: Math.round(fast * 100) / 100,
    instant: Math.round(instant * 100) / 100,
    baseFee: Math.round(standard * 0.8 * 100) / 100,
    priorityFee: Math.round(standard * 0.2 * 100) / 100,
    estimatedCostUsd: {
      transfer: Math.round(gweiToEth(standard) * 21000 * ethPrice * 100) / 100,
      swap: Math.round(gweiToEth(standard) * 150000 * ethPrice * 100) / 100,
      nftMint: Math.round(gweiToEth(standard) * 100000 * ethPrice * 100) / 100,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chainFilter = searchParams.get('chain');

  let chainsToProcess = CHAINS;
  if (chainFilter) {
    const chainId = parseInt(chainFilter, 10);
    chainsToProcess = CHAINS.filter(
      (c) => c.id === chainId || c.name.toLowerCase() === chainFilter.toLowerCase()
    );
  }

  const prices: GasPrice[] = chainsToProcess.map((chain) => ({
    chain: chain.name,
    chainId: chain.id,
    ...generateRealisticGasPrice(chain.id),
  }));

  const response: GasTrackerResponse = {
    prices,
    ethPrice: 1850 + Math.random() * 100,
    btcGasRate: 5 + Math.random() * 10,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      apiVersion: '1.0.0',
      poweredBy: 'Abhinil Agarwal - Web3 Tools Hub',
      documentation: 'https://www.abhinil.in/api/docs/gas-tracker',
      rateLimit: '100 requests/minute',
    },
  });
}
