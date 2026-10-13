import { NextRequest, NextResponse } from 'next/server';

interface BridgeQuote {
  bridge: {
    name: string;
    logo: string;
    website: string;
    auditStatus: 'audited' | 'partially_audited' | 'unaudited';
  };
  route: {
    sourceChain: string;
    destinationChain: string;
    estimatedTime: string;
    timeRangeMin: number;
    timeRangeMax: number;
  };
  fees: {
    bridgeFee: number;
    bridgeFeeUsd: number;
    bridgeFeePercent: string;
    gasFeeSource: number;
    gasFeeDestination: number;
    totalFeeUsd: number;
  };
  output: {
    inputAmount: string;
    outputAmount: string;
    outputAmountUsd: number;
    slippage: string;
    rate: number;
  };
  limits: {
    minAmount: string;
    maxAmount: string;
  };
  recommendation: string;
}

interface BridgeComparatorResponse {
  query: {
    token: string;
    amount: string;
    sourceChain: string;
    destinationChain: string;
  };
  quotes: BridgeQuote[];
  bestQuote: BridgeQuote | null;
  comparison: {
    fastestBridge: string;
    cheapestBridge: string;
    bestOverall: string;
    savingsVsWorst: number;
  };
  timestamp: string;
}

const BRIDGES = [
  { name: 'Across Protocol', logo: '/bridges/across.svg', website: 'https://across.to', auditStatus: 'audited' as const },
  { name: 'Stargate', logo: '/bridges/stargate.svg', website: 'https://stargate.finance', auditStatus: 'audited' as const },
  { name: 'Hop Protocol', logo: '/bridges/hop.svg', website: 'https://hop.exchange', auditStatus: 'audited' as const },
  { name: 'Celer cBridge', logo: '/bridges/cbridge.svg', website: 'https://cbridge.celer.network', auditStatus: 'audited' as const },
  { name: 'Synapse', logo: '/bridges/synapse.svg', website: 'https://synapseprotocol.com', auditStatus: 'audited' as const },
  { name: 'Multichain', logo: '/bridges/multichain.svg', website: 'https://multichain.org', auditStatus: 'partially_audited' as const },
];

const SUPPORTED_CHAINS = ['ethereum', 'base', 'arbitrum', 'optimism', 'polygon', 'bsc', 'avalanche'];

function generateBridgeQuote(
  bridge: typeof BRIDGES[0],
  amount: number,
  sourceChain: string,
  destChain: string
): BridgeQuote {
  const baseFeePercent = 0.03 + Math.random() * 0.07;
  const bridgeFee = amount * baseFeePercent;
  const outputAmount = amount - bridgeFee;
  const minTime = Math.floor(Math.random() * 10) + 2;
  const maxTime = minTime + Math.floor(Math.random() * 20) + 5;

  const recommendations = [
    'Best for large transfers',
    'Fastest option available',
    'Lowest fees for this route',
    'Most reliable bridge',
    'Good balance of speed and cost',
    'Consider for frequent transfers',
  ];

  return {
    bridge,
    route: {
      sourceChain,
      destinationChain: destChain,
      estimatedTime: `${minTime}-${maxTime} minutes`,
      timeRangeMin: minTime,
      timeRangeMax: maxTime,
    },
    fees: {
      bridgeFee: Math.round(bridgeFee * 100) / 100,
      bridgeFeeUsd: Math.round(bridgeFee * 100) / 100,
      bridgeFeePercent: `${(baseFeePercent * 100).toFixed(2)}%`,
      gasFeeSource: Math.round((1 + Math.random() * 5) * 100) / 100,
      gasFeeDestination: Math.round((0.1 + Math.random() * 0.5) * 100) / 100,
      totalFeeUsd: Math.round((bridgeFee + 1 + Math.random() * 5) * 100) / 100,
    },
    output: {
      inputAmount: amount.toString(),
      outputAmount: outputAmount.toFixed(2),
      outputAmountUsd: Math.round(outputAmount * 100) / 100,
      slippage: `${(Math.random() * 0.1).toFixed(2)}%`,
      rate: Math.round((outputAmount / amount) * 10000) / 10000,
    },
    limits: {
      minAmount: '10',
      maxAmount: '1000000',
    },
    recommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || 'USDC';
  const amount = parseFloat(searchParams.get('amount') || '1000');
  const sourceChain = searchParams.get('source') || 'ethereum';
  const destChain = searchParams.get('dest') || 'base';

  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json(
      { error: 'Invalid amount. Must be a positive number.' },
      { status: 400 }
    );
  }

  if (!SUPPORTED_CHAINS.includes(sourceChain.toLowerCase())) {
    return NextResponse.json(
      { error: `Unsupported source chain. Supported: ${SUPPORTED_CHAINS.join(', ')}` },
      { status: 400 }
    );
  }

  if (!SUPPORTED_CHAINS.includes(destChain.toLowerCase())) {
    return NextResponse.json(
      { error: `Unsupported destination chain. Supported: ${SUPPORTED_CHAINS.join(', ')}` },
      { status: 400 }
    );
  }

  const quotes = BRIDGES.map((bridge) =>
    generateBridgeQuote(bridge, amount, sourceChain, destChain)
  );

  quotes.sort((a, b) => a.fees.totalFeeUsd - b.fees.totalFeeUsd);

  const bestQuote = quotes[0];
  const worstQuote = quotes[quotes.length - 1];
  const fastestBridge = [...quotes].sort((a, b) => a.route.timeRangeMin - b.route.timeRangeMin)[0];
  const cheapestBridge = quotes[0];

  const response: BridgeComparatorResponse = {
    query: {
      token,
      amount: amount.toString(),
      sourceChain,
      destinationChain: destChain,
    },
    quotes,
    bestQuote,
    comparison: {
      fastestBridge: fastestBridge.bridge.name,
      cheapestBridge: cheapestBridge.bridge.name,
      bestOverall: bestQuote.bridge.name,
      savingsVsWorst: Math.round((worstQuote.fees.totalFeeUsd - bestQuote.fees.totalFeeUsd) * 100) / 100,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      apiVersion: '1.0.0',
      poweredBy: 'Abhinil Agarwal - Web3 Tools Hub',
      documentation: 'https://www.abhinil.in/api/docs/bridge-comparator',
      rateLimit: '100 requests/minute',
      note: 'Quotes are simulated. For production use, integrate with actual bridge APIs.',
    },
  });
}
