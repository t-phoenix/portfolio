import { NextRequest, NextResponse } from 'next/server';
import { createX402Response, verifyX402Payment } from '@/lib/x402/middleware';

const X402_CONFIG = {
  price: '0.02',
  asset: 'USDC' as const,
  network: 'base' as const,
  recipient: process.env.X402_RECIPIENT || '0x0000000000000000000000000000000000000000',
  description: 'DeFi pool analysis API - LP position analysis and impermanent loss calculation',
};

interface PoolData {
  protocol: string;
  poolAddress: string;
  token0: { symbol: string; reserve: string; price: number };
  token1: { symbol: string; reserve: string; price: number };
  tvl: number;
  volume24h: number;
  fees24h: number;
  apy: {
    tradingFees: number;
    rewards: number;
    total: number;
  };
}

interface ImpermanentLossCalc {
  priceChange: number;
  impermanentLoss: number;
  impermanentLossPercent: string;
  breakEvenDays: number;
  recommendation: string;
}

interface PoolAnalysisResponse {
  pool: PoolData;
  impermanentLoss: ImpermanentLossCalc;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  analysis: string[];
  timestamp: string;
}

function calculateImpermanentLoss(priceChange: number): ImpermanentLossCalc {
  // IL formula: 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
  const priceRatio = 1 + priceChange / 100;
  const sqrtRatio = Math.sqrt(priceRatio);
  const ilFactor = (2 * sqrtRatio) / (1 + priceRatio) - 1;
  const ilPercent = Math.abs(ilFactor * 100);

  let recommendation = '';
  let breakEvenDays = 0;

  if (ilPercent < 1) {
    recommendation = 'Low IL risk. Safe to provide liquidity for extended periods.';
    breakEvenDays = 7;
  } else if (ilPercent < 5) {
    recommendation = 'Moderate IL risk. Consider shorter LP periods or higher APY pools.';
    breakEvenDays = 30;
  } else if (ilPercent < 10) {
    recommendation = 'High IL risk. Only recommended for high APY pools (50%+) with short timeframes.';
    breakEvenDays = 90;
  } else {
    recommendation = 'Very high IL risk. Consider single-sided staking or stablecoin pools instead.';
    breakEvenDays = 365;
  }

  return {
    priceChange,
    impermanentLoss: ilFactor,
    impermanentLossPercent: `${ilPercent.toFixed(2)}%`,
    breakEvenDays,
    recommendation,
  };
}

function analyzePool(
  protocol: string,
  poolAddress: string,
  token0Symbol: string,
  token1Symbol: string
): PoolAnalysisResponse {
  // Simulated pool data
  const baseApy = 5 + Math.random() * 45;
  const rewardsApy = Math.random() * 20;
  const tvl = 1000000 + Math.random() * 50000000;
  const volume24h = tvl * (0.01 + Math.random() * 0.1);
  const fees24h = volume24h * 0.003;

  const pool: PoolData = {
    protocol,
    poolAddress,
    token0: {
      symbol: token0Symbol,
      reserve: (tvl / 2 / (1800 + Math.random() * 200)).toFixed(2),
      price: 1800 + Math.random() * 200,
    },
    token1: {
      symbol: token1Symbol,
      reserve: (tvl / 2).toFixed(2),
      price: 1,
    },
    tvl,
    volume24h,
    fees24h,
    apy: {
      tradingFees: baseApy,
      rewards: rewardsApy,
      total: baseApy + rewardsApy,
    },
  };

  // Calculate IL for various price scenarios
  const ilCalc = calculateImpermanentLoss(50); // Assuming 50% price change scenario

  // Risk assessment
  let riskScore = 0;
  const analysis: string[] = [];

  // TVL risk
  if (tvl < 1000000) {
    riskScore += 30;
    analysis.push('Low TVL: Higher slippage risk and potential for manipulation');
  } else if (tvl < 10000000) {
    riskScore += 15;
    analysis.push('Medium TVL: Moderate liquidity depth');
  } else {
    riskScore += 5;
    analysis.push('High TVL: Good liquidity depth');
  }

  // Volume/TVL ratio
  const volumeRatio = volume24h / tvl;
  if (volumeRatio > 0.5) {
    riskScore += 10;
    analysis.push('High volume ratio: Good fee generation but may indicate high volatility');
  } else if (volumeRatio < 0.01) {
    riskScore += 20;
    analysis.push('Low volume ratio: Limited fee generation, consider other pools');
  }

  // APY sustainability
  if (pool.apy.total > 100) {
    riskScore += 25;
    analysis.push('Very high APY: May not be sustainable, check token emissions');
  } else if (pool.apy.total > 50) {
    riskScore += 15;
    analysis.push('High APY: Monitor for sustainability');
  }

  // Protocol risk
  if (protocol.toLowerCase().includes('uniswap') || protocol.toLowerCase().includes('balancer')) {
    riskScore += 5;
    analysis.push('Established protocol: Lower smart contract risk');
  } else {
    riskScore += 20;
    analysis.push('Newer protocol: Higher smart contract risk, verify audits');
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  if (riskScore < 30) {
    riskLevel = 'LOW';
  } else if (riskScore < 50) {
    riskLevel = 'MEDIUM';
  } else if (riskScore < 70) {
    riskLevel = 'HIGH';
  } else {
    riskLevel = 'VERY_HIGH';
  }

  return {
    pool,
    impermanentLoss: ilCalc,
    riskScore,
    riskLevel,
    analysis,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const verification = await verifyX402Payment(request, X402_CONFIG);

  if (!verification.valid) {
    return createX402Response(X402_CONFIG);
  }

  const { searchParams } = new URL(request.url);
  const protocol = searchParams.get('protocol') || 'Uniswap V3';
  const poolAddress = searchParams.get('pool') || '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640';
  const token0 = searchParams.get('token0') || 'ETH';
  const token1 = searchParams.get('token1') || 'USDC';

  const analysis = analyzePool(protocol, poolAddress, token0, token1);

  return NextResponse.json({
    success: true,
    data: analysis,
    meta: {
      apiVersion: '1.0.0',
      poweredBy: 'Abhinil Agarwal - Balancer V3/Uniswap V3 DEX Builder',
      documentation: 'https://www.abhinil.in/api/docs/pool-analysis',
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
    const { protocol, poolAddress, token0, token1 } = body;

    const analysis = analyzePool(
      protocol || 'Uniswap V3',
      poolAddress || '0x0',
      token0 || 'ETH',
      token1 || 'USDC'
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      meta: {
        apiVersion: '1.0.0',
        poweredBy: 'Abhinil Agarwal - Balancer V3/Uniswap V3 DEX Builder',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
