import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Clock, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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

interface LeaderboardData {
  period: string;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  totalPot: number;
  userPosition?: LeaderboardEntry;
}

const PERIODS = [
  { id: 'all_time', label: 'All Time', icon: Trophy },
  { id: 'monthly', label: 'Monthly', icon: Medal },
  { id: 'weekly', label: 'Weekly', icon: Clock },
  { id: 'daily', label: 'Daily', icon: Flame },
];

const fetchLeaderboard = async (period: string, address?: string): Promise<LeaderboardData> => {
  const params = new URLSearchParams({ period });
  if (address) params.append('address', address);
  
  const response = await fetch(`/api/potshot/leaderboard?${params}`);
  const data = await response.json();
  return data.data;
};

interface LeaderboardProps {
  userAddress?: string;
}

export const Leaderboard = ({ userAddress }: LeaderboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');

  const { data, isLoading } = useQuery({
    queryKey: ['potshot-leaderboard', selectedPeriod, userAddress],
    queryFn: () => fetchLeaderboard(selectedPeriod, userAddress),
    staleTime: 60 * 1000,
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-white/60';
  };

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange" />
          Leaderboard
        </h3>
        {data && (
          <span className="text-sm text-white/50">
            {data.totalPlayers} players
          </span>
        )}
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {PERIODS.map((period) => {
          const Icon = period.icon;
          return (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedPeriod === period.id
                  ? 'bg-orange text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {period.label}
            </button>
          );
        })}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-white/50">Loading...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPeriod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {data?.entries.slice(0, 10).map((entry, index) => (
                <motion.div
                  key={entry.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.rank <= 3 ? 'bg-orange/10' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold w-8 ${getRankColor(entry.rank)}`}>
                      {getRankBadge(entry.rank)}
                    </span>
                    <div>
                      <p className="font-medium">{entry.address}</p>
                      <p className="text-xs text-white/50">
                        {entry.totalTickets} tickets • ${entry.totalSpent.toFixed(2)} spent
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">
                      {entry.currentChance.toFixed(1)}%
                    </p>
                    <p className="text-xs text-white/50">
                      {entry.winCount > 0 ? `${entry.winCount} wins` : 'No wins yet'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* User Position */}
      {data?.userPosition && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-white/50 mb-2">Your Position</p>
          <div className="flex items-center justify-between p-3 rounded-lg bg-orange/20 border border-orange/30">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">#{data.userPosition.rank}</span>
              <div>
                <p className="font-medium">You</p>
                <p className="text-xs text-white/50">
                  {data.userPosition.totalTickets} tickets
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-accent">
                {data.userPosition.currentChance.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
