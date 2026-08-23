import { NextRequest, NextResponse } from 'next/server';

interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  totalTickets: number;
  totalSpent: number;
  totalWon: number;
  winCount: number;
  currentChance: number;
  lastActive: string;
}

interface LeaderboardResponse {
  period: 'all_time' | 'monthly' | 'weekly' | 'daily';
  entries: LeaderboardEntry[];
  totalPlayers: number;
  totalPot: number;
  timestamp: string;
}

function generateMockLeaderboard(period: string): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const multipliers: Record<string, number> = {
    all_time: 1,
    monthly: 0.3,
    weekly: 0.1,
    daily: 0.03,
  };

  const mult = multipliers[period] || 1;

  for (let i = 0; i < 20; i++) {
    const address = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
    const totalTickets = Math.floor((100 - i * 3 + Math.random() * 20) * mult);
    const totalSpent = totalTickets * (1 + Math.random() * 2);
    const winCount = Math.floor(Math.random() * 3 * mult);
    const totalWon = winCount > 0 ? winCount * (50 + Math.random() * 200) : 0;

    entries.push({
      rank: i + 1,
      address,
      displayName: `Player ${i + 1}`,
      totalTickets,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalWon: Math.round(totalWon * 100) / 100,
      winCount,
      currentChance: Math.round((totalTickets / (totalTickets + 500)) * 100 * 100) / 100,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return entries;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'all_time';
  const address = searchParams.get('address');

  const validPeriods = ['all_time', 'monthly', 'weekly', 'daily'];
  if (!validPeriods.includes(period)) {
    return NextResponse.json(
      { error: `Invalid period. Supported: ${validPeriods.join(', ')}` },
      { status: 400 }
    );
  }

  const entries = generateMockLeaderboard(period);

  // If address is provided, add their position
  let userPosition = null;
  if (address) {
    const userRank = Math.floor(Math.random() * 50) + 20;
    userPosition = {
      rank: userRank,
      address,
      displayName: 'You',
      totalTickets: Math.floor(10 + Math.random() * 30),
      totalSpent: Math.round((10 + Math.random() * 50) * 100) / 100,
      totalWon: Math.random() > 0.7 ? Math.round(Math.random() * 100 * 100) / 100 : 0,
      winCount: Math.random() > 0.7 ? 1 : 0,
      currentChance: Math.round(Math.random() * 5 * 100) / 100,
      lastActive: new Date().toISOString(),
    };
  }

  const response: LeaderboardResponse & { userPosition?: LeaderboardEntry } = {
    period: period as LeaderboardResponse['period'],
    entries,
    totalPlayers: 247 + Math.floor(Math.random() * 50),
    totalPot: Math.round((1500 + Math.random() * 500) * 100) / 100,
    timestamp: new Date().toISOString(),
  };

  if (userPosition) {
    response.userPosition = userPosition;
  }

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      apiVersion: '1.0.0',
      contract: '0x...',
      chain: 'Base',
      documentation: 'https://www.abhinil.in/potshot',
    },
  });
}
