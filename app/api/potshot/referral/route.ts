import { NextRequest, NextResponse } from 'next/server';

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  pendingEarnings: number;
  claimedEarnings: number;
  referralBonus: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierAt: number;
}

interface ReferralEntry {
  address: string;
  joinedAt: string;
  ticketsPurchased: number;
  earningsGenerated: number;
  isActive: boolean;
}

interface ReferralResponse {
  stats: ReferralStats;
  referrals: ReferralEntry[];
  bonusStructure: {
    bronze: { minReferrals: number; bonus: number };
    silver: { minReferrals: number; bonus: number };
    gold: { minReferrals: number; bonus: number };
    platinum: { minReferrals: number; bonus: number };
  };
  timestamp: string;
}

const BONUS_STRUCTURE = {
  bronze: { minReferrals: 0, bonus: 5 },
  silver: { minReferrals: 5, bonus: 7.5 },
  gold: { minReferrals: 15, bonus: 10 },
  platinum: { minReferrals: 50, bonus: 15 },
};

function generateReferralCode(address: string): string {
  const shortAddress = address.slice(2, 8).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `POT${shortAddress}${random}`;
}

function getTier(referralCount: number): ReferralStats['tier'] {
  if (referralCount >= 50) return 'platinum';
  if (referralCount >= 15) return 'gold';
  if (referralCount >= 5) return 'silver';
  return 'bronze';
}

function getNextTierAt(referralCount: number): number {
  if (referralCount >= 50) return 50;
  if (referralCount >= 15) return 50;
  if (referralCount >= 5) return 15;
  return 5;
}

function generateMockReferrals(count: number): ReferralEntry[] {
  const referrals: ReferralEntry[] = [];

  for (let i = 0; i < count; i++) {
    const address = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
    const ticketsPurchased = Math.floor(Math.random() * 20) + 1;
    const isActive = Math.random() > 0.3;

    referrals.push({
      address,
      joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      ticketsPurchased,
      earningsGenerated: Math.round(ticketsPurchased * 0.5 * 100) / 100,
      isActive,
    });
  }

  return referrals.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required. Example: /api/potshot/referral?address=0x...' },
      { status: 400 }
    );
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address format' },
      { status: 400 }
    );
  }

  const totalReferrals = Math.floor(Math.random() * 20);
  const activeReferrals = Math.floor(totalReferrals * 0.7);
  const referrals = generateMockReferrals(totalReferrals);

  const totalEarned = referrals.reduce((sum, r) => sum + r.earningsGenerated, 0);
  const claimedEarnings = Math.round(totalEarned * 0.6 * 100) / 100;
  const pendingEarnings = Math.round((totalEarned - claimedEarnings) * 100) / 100;

  const tier = getTier(totalReferrals);
  const referralCode = generateReferralCode(address);

  const stats: ReferralStats = {
    referralCode,
    referralLink: `https://www.abhinil.in/#potshot?ref=${referralCode}`,
    totalReferrals,
    activeReferrals,
    totalEarned: Math.round(totalEarned * 100) / 100,
    pendingEarnings,
    claimedEarnings,
    referralBonus: BONUS_STRUCTURE[tier].bonus,
    tier,
    nextTierAt: getNextTierAt(totalReferrals),
  };

  const response: ReferralResponse = {
    stats,
    referrals,
    bonusStructure: BONUS_STRUCTURE,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      apiVersion: '1.0.0',
      contract: '0x...',
      chain: 'Base',
      documentation: 'https://www.abhinil.in/potshot/referral',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, referralCode } = body;

    if (!address || !referralCode) {
      return NextResponse.json(
        { error: 'Both address and referralCode are required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Referral code registered successfully',
        referralCode,
        registeredAddress: address,
        bonus: '5% on first ticket purchase',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
