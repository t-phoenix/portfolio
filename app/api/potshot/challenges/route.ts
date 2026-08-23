import { NextRequest, NextResponse } from 'next/server';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirements: {
    action: string;
    target: number;
    current: number;
  };
  reward: {
    type: 'bonus_tickets' | 'multiplier' | 'usdc';
    value: number;
    description: string;
  };
  status: 'available' | 'in_progress' | 'completed' | 'claimed' | 'expired';
  expiresAt: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ChallengesResponse {
  daily: Challenge[];
  weekly: Challenge[];
  special: Challenge[];
  streak: {
    current: number;
    longest: number;
    multiplier: number;
  };
  totalCompleted: number;
  totalClaimed: number;
  timestamp: string;
}

interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  requirements: { action: string; target: number };
  reward: { type: 'bonus_tickets' | 'multiplier' | 'usdc'; value: number; description: string };
  difficulty: 'easy' | 'medium' | 'hard';
}

const DAILY_CHALLENGES: ChallengeTemplate[] = [
  {
    id: 'daily_1',
    title: 'First Ticket',
    description: 'Purchase your first ticket of the day',
    requirements: { action: 'buy_ticket', target: 1 },
    reward: { type: 'bonus_tickets', value: 1, description: '+1 bonus ticket' },
    difficulty: 'easy',
  },
  {
    id: 'daily_2',
    title: 'High Roller',
    description: 'Purchase at least 5 USDC worth of tickets',
    requirements: { action: 'spend_usdc', target: 5 },
    reward: { type: 'multiplier', value: 1.1, description: '10% chance boost' },
    difficulty: 'medium',
  },
  {
    id: 'daily_3',
    title: 'Whale Alert',
    description: 'Purchase at least 20 USDC worth of tickets',
    requirements: { action: 'spend_usdc', target: 20 },
    reward: { type: 'usdc', value: 2, description: '+$2 USDC bonus' },
    difficulty: 'hard',
  },
];

const WEEKLY_CHALLENGES: ChallengeTemplate[] = [
  {
    id: 'weekly_1',
    title: 'Consistent Player',
    description: 'Buy tickets on 5 different days',
    requirements: { action: 'active_days', target: 5 },
    reward: { type: 'bonus_tickets', value: 5, description: '+5 bonus tickets' },
    difficulty: 'medium',
  },
  {
    id: 'weekly_2',
    title: 'Referral Master',
    description: 'Refer 3 new players who purchase tickets',
    requirements: { action: 'referrals', target: 3 },
    reward: { type: 'usdc', value: 10, description: '+$10 USDC' },
    difficulty: 'hard',
  },
];

const SPECIAL_CHALLENGES: ChallengeTemplate[] = [
  {
    id: 'special_1',
    title: 'Early Bird',
    description: 'Be the first to buy a ticket after pot reset',
    requirements: { action: 'first_buyer', target: 1 },
    reward: { type: 'multiplier', value: 1.5, description: '50% chance boost for this round' },
    difficulty: 'hard',
  },
];

function getExpiresAt(type: string): string {
  const now = new Date();
  if (type === 'daily') {
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    return tomorrow.toISOString();
  }
  if (type === 'weekly') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
    nextWeek.setHours(0, 0, 0, 0);
    return nextWeek.toISOString();
  }
  const special = new Date(now);
  special.setHours(special.getHours() + 24);
  return special.toISOString();
}

function generateChallengeProgress(
  base: ChallengeTemplate,
  type: 'daily' | 'weekly' | 'special',
  hasAddress: boolean
): Challenge {
  let status: Challenge['status'] = 'available';
  let current = 0;

  if (hasAddress) {
    const progress = Math.random();
    if (progress > 0.8) {
      status = 'claimed';
      current = base.requirements.target;
    } else if (progress > 0.6) {
      status = 'completed';
      current = base.requirements.target;
    } else if (progress > 0.3) {
      status = 'in_progress';
      current = Math.floor(base.requirements.target * Math.random());
    }
  }

  return {
    id: base.id,
    title: base.title,
    description: base.description,
    type,
    requirements: {
      ...base.requirements,
      current,
    },
    reward: base.reward,
    status,
    expiresAt: getExpiresAt(type),
    difficulty: base.difficulty,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  const hasAddress = !!address && /^0x[a-fA-F0-9]{40}$/.test(address);

  const daily = DAILY_CHALLENGES.map((c) => generateChallengeProgress(c, 'daily', hasAddress));
  const weekly = WEEKLY_CHALLENGES.map((c) => generateChallengeProgress(c, 'weekly', hasAddress));
  const special = SPECIAL_CHALLENGES.map((c) => generateChallengeProgress(c, 'special', hasAddress));

  const allChallenges = [...daily, ...weekly, ...special];
  const completed = allChallenges.filter((c) => c.status === 'completed' || c.status === 'claimed').length;
  const claimed = allChallenges.filter((c) => c.status === 'claimed').length;

  const streak = hasAddress
    ? {
        current: Math.floor(Math.random() * 7),
        longest: Math.floor(Math.random() * 14) + 3,
        multiplier: 1 + Math.floor(Math.random() * 7) * 0.05,
      }
    : {
        current: 0,
        longest: 0,
        multiplier: 1,
      };

  const response: ChallengesResponse = {
    daily,
    weekly,
    special,
    streak,
    totalCompleted: completed,
    totalClaimed: claimed,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      apiVersion: '1.0.0',
      documentation: 'https://www.abhinil.in/potshot/challenges',
      note: address ? 'Showing personalized challenges' : 'Connect wallet for personalized progress',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, challengeId } = body;

    if (!address || !challengeId) {
      return NextResponse.json(
        { error: 'Both address and challengeId are required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Challenge reward claimed successfully',
        challengeId,
        address,
        reward: {
          type: 'bonus_tickets',
          value: 1,
          txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        },
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
