import { NextRequest, NextResponse } from 'next/server';
import { withX402, createX402Response, verifyX402Payment } from '@/lib/x402/middleware';

const X402_CONFIG = {
  price: '0.01',
  asset: 'USDC' as const,
  network: 'base' as const,
  recipient: process.env.X402_RECIPIENT || '0x0000000000000000000000000000000000000000',
  description: 'Cross-chain bridge quote API - Find optimal bridging routes',
};

interface BridgeRoute {
  protocol: string;
  sourceChain: string;
  destChain: string;
  estimatedTime: string;
  fee: string;
  feeUsd: number;
  gasEstimate: string;
  route: string[];
}

interface BridgeQuoteResponse {
  amount: string;
  token: string;
  sourceChain: string;
  destChain: string;
  routes: BridgeRoute[];
  bestRoute: BridgeRoute;
  timestamp: string;
}

function calculateBridgeQuotes(
  amount: string,
  token: string,
  sourceChain: string,
  destChain: string
): BridgeQuoteResponse {
  // Simulated bridge quote data based on real protocols
  const protocols = [
    {
      name: 'Across Protocol',
      baseFee: 0.05,
      speedMultiplier: 1,
      estimatedTime: '2-5 minutes',
    },
    {
      name: 'Stargate',
      baseFee: 0.06,
      speedMultiplier: 1.2,
      estimatedTime: '5-15 minutes',
    },
    {
      name: 'Hop Protocol',
      baseFee: 0.04,
      speedMultiplier: 0.9,
      estimatedTime: '10-20 minutes',
    },
    {
      name: 'Celer cBridge',
      baseFee: 0.08,
      speedMultiplier: 0.8,
      estimatedTime: '5-10 minutes',
    },
  ];

  const amountNum = parseFloat(amount);
  
  const routes: BridgeRoute[] = protocols.map((protocol) => {
    const feePercent = protocol.baseFee * protocol.speedMultiplier;
    const feeAmount = amountNum * (feePercent / 100);
    
    return {
      protocol: protocol.name,
      sourceChain,
      destChain,
      estimatedTime: protocol.estimatedTime,
      fee: `${feePercent.toFixed(3)}%`,
      feeUsd: feeAmount,
      gasEstimate: `${(0.001 + Math.random() * 0.002).toFixed(4)} ETH`,
      route: [sourceChain, destChain],
    };
  });

  // Sort by fee (lowest first)
  routes.sort((a, b) => a.feeUsd - b.feeUsd);

  return {
    amount,
    token,
    sourceChain,
    destChain,
    routes,
    bestRoute: routes[0],
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  // Check for x402 payment
  const verification = await verifyX402Payment(request, X402_CONFIG);

  if (!verification.valid) {
    return createX402Response(X402_CONFIG);
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get('amount') || '1000';
  const token = searchParams.get('token') || 'USDC';
  const sourceChain = searchParams.get('source') || 'ethereum';
  const destChain = searchParams.get('dest') || 'base';

  const quote = calculateBridgeQuotes(amount, token, sourceChain, destChain);

  return NextResponse.json({
    success: true,
    data: quote,
    meta: {
      apiVersion: '1.0.0',
      poweredBy: 'Abhinil Agarwal - $1.5B+ bridged on-chain',
      documentation: 'https://www.abhinil.in/api/docs/bridge-quote',
    },
  });
}

export async function POST(request: NextRequest) {
  const verification = await verifyX402Payment(request, X402_CONFIG);

  if (!verification.valid) {
    return createX402Response(X402_CONFIG);
  }

  try {
    const body = await request.json();
    const { amount, token, sourceChain, destChain } = body;

    if (!amount || !sourceChain || !destChain) {
      return NextResponse.json(
        { error: 'Missing required parameters: amount, sourceChain, destChain' },
        { status: 400 }
      );
    }

    const quote = calculateBridgeQuotes(
      amount.toString(),
      token || 'USDC',
      sourceChain,
      destChain
    );

    return NextResponse.json({
      success: true,
      data: quote,
      meta: {
        apiVersion: '1.0.0',
        poweredBy: 'Abhinil Agarwal - $1.5B+ bridged on-chain',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
