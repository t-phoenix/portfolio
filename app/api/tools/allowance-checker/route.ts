import { NextRequest, NextResponse } from 'next/server';

interface TokenAllowance {
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  spender: {
    address: string;
    name: string;
    type: 'dex' | 'bridge' | 'lending' | 'nft' | 'unknown';
    riskLevel: 'low' | 'medium' | 'high';
  };
  allowance: string;
  allowanceFormatted: string;
  isUnlimited: boolean;
  lastUpdated: string;
}

interface AllowanceCheckerResponse {
  address: string;
  chain: string;
  chainId: number;
  allowances: TokenAllowance[];
  riskSummary: {
    totalUnlimited: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    recommendations: string[];
  };
  timestamp: string;
}

const KNOWN_SPENDERS: Record<string, { name: string; type: TokenAllowance['spender']['type']; riskLevel: TokenAllowance['spender']['riskLevel'] }> = {
  '0x1111111254fb6c44bac0bed2854e76f90643097d': { name: '1inch Router', type: 'dex', riskLevel: 'low' },
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': { name: 'Uniswap V3 Router', type: 'dex', riskLevel: 'low' },
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': { name: '0x Exchange', type: 'dex', riskLevel: 'low' },
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': { name: 'Uniswap Universal Router', type: 'dex', riskLevel: 'low' },
  '0xba12222222228d8ba445958a75a0704d566bf2c8': { name: 'Balancer Vault', type: 'dex', riskLevel: 'low' },
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap V2 Router', type: 'dex', riskLevel: 'medium' },
  '0x99a58482bd75cbab83b27ec03ca68ff489b5788f': { name: 'OpenSea Seaport', type: 'nft', riskLevel: 'medium' },
  '0x881d40237659c251811cec9c364ef91dc08d300c': { name: 'Metamask Swap Router', type: 'dex', riskLevel: 'low' },
};

const SAMPLE_TOKENS = [
  { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
  { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
];

function generateMockAllowances(address: string): TokenAllowance[] {
  const allowances: TokenAllowance[] = [];
  const spenderAddresses = Object.keys(KNOWN_SPENDERS);

  SAMPLE_TOKENS.forEach((token) => {
    const numAllowances = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numAllowances; i++) {
      const spenderAddress = spenderAddresses[Math.floor(Math.random() * spenderAddresses.length)];
      const spenderInfo = KNOWN_SPENDERS[spenderAddress];
      const isUnlimited = Math.random() > 0.3;
      const allowanceAmount = isUnlimited
        ? '115792089237316195423570985008687907853269984665640564039457584007913129639935'
        : (Math.floor(Math.random() * 10000) * Math.pow(10, token.decimals)).toString();

      allowances.push({
        token,
        spender: {
          address: spenderAddress,
          ...spenderInfo,
        },
        allowance: allowanceAmount,
        allowanceFormatted: isUnlimited
          ? 'Unlimited'
          : `${(parseFloat(allowanceAmount) / Math.pow(10, token.decimals)).toLocaleString()} ${token.symbol}`,
        isUnlimited,
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  return allowances;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum';

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required. Example: /api/tools/allowance-checker?address=0x...' },
      { status: 400 }
    );
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address format' },
      { status: 400 }
    );
  }

  const chainMap: Record<string, number> = {
    ethereum: 1,
    base: 8453,
    arbitrum: 42161,
    optimism: 10,
    polygon: 137,
  };

  const chainId = chainMap[chain.toLowerCase()] || 1;
  const allowances = generateMockAllowances(address);

  const riskSummary = {
    totalUnlimited: allowances.filter((a) => a.isUnlimited).length,
    highRisk: allowances.filter((a) => a.spender.riskLevel === 'high').length,
    mediumRisk: allowances.filter((a) => a.spender.riskLevel === 'medium').length,
    lowRisk: allowances.filter((a) => a.spender.riskLevel === 'low').length,
    recommendations: [] as string[],
  };

  if (riskSummary.totalUnlimited > 0) {
    riskSummary.recommendations.push(
      `Consider revoking ${riskSummary.totalUnlimited} unlimited allowances to reduce risk exposure.`
    );
  }
  if (riskSummary.highRisk > 0) {
    riskSummary.recommendations.push(
      `Review ${riskSummary.highRisk} high-risk spender approvals immediately.`
    );
  }
  if (riskSummary.mediumRisk > 2) {
    riskSummary.recommendations.push(
      'Consider consolidating approvals to fewer, more trusted protocols.'
    );
  }

  const response: AllowanceCheckerResponse = {
    address,
    chain,
    chainId,
    allowances,
    riskSummary,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      apiVersion: '1.0.0',
      poweredBy: 'Abhinil Agarwal - Web3 Tools Hub',
      documentation: 'https://www.abhinil.in/api/docs/allowance-checker',
      rateLimit: '50 requests/minute',
      note: 'This is simulated data. For production use, connect to actual blockchain RPC.',
    },
  });
}
