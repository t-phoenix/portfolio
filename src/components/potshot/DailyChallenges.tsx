import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Gift, Flame, Check, Clock, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

interface ChallengesData {
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
}

const fetchChallenges = async (address?: string): Promise<ChallengesData> => {
  const params = new URLSearchParams();
  if (address) params.append('address', address);
  
  const response = await fetch(`/api/potshot/challenges?${params}`);
  const data = await response.json();
  return data.data;
};

const claimReward = async (challengeId: string, address: string) => {
  const response = await fetch('/api/potshot/challenges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, address }),
  });
  return response.json();
};

interface DailyChallengesProps {
  userAddress?: string;
}

export const DailyChallenges = ({ userAddress }: DailyChallengesProps) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['potshot-challenges', userAddress],
    queryFn: () => fetchChallenges(userAddress),
    staleTime: 60 * 1000,
  });

  const claimMutation = useMutation({
    mutationFn: ({ challengeId }: { challengeId: string }) =>
      claimReward(challengeId, userAddress || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potshot-challenges'] });
    },
  });

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
    }
  };

  const getStatusIcon = (status: Challenge['status']) => {
    switch (status) {
      case 'completed': return <Check className="w-5 h-5 text-green-400" />;
      case 'claimed': return <Gift className="w-5 h-5 text-accent" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-orange" />;
      case 'expired': return <Clock className="w-5 h-5 text-red-400" />;
      default: return <Target className="w-5 h-5 text-white/50" />;
    }
  };

  const getRewardIcon = (type: Challenge['reward']['type']) => {
    switch (type) {
      case 'bonus_tickets': return '🎫';
      case 'multiplier': return '⚡';
      case 'usdc': return '💵';
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const challenges = data?.[activeTab] || [];

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-orange" />
          Challenges
        </h3>
        {data && (
          <div className="flex items-center gap-2 text-sm">
            <Flame className="w-4 h-4 text-orange" />
            <span className="text-orange font-semibold">{data.streak.current}</span>
            <span className="text-white/50">day streak</span>
          </div>
        )}
      </div>

      {/* Streak Banner */}
      {data && data.streak.current > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-orange/20 to-accent/20 rounded-lg border border-orange/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <span className="font-medium">Active Streak Bonus</span>
            </div>
            <span className="text-accent font-bold">
              {((data.streak.multiplier - 1) * 100).toFixed(0)}% boost
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['daily', 'weekly', 'special'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'bg-orange text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-white/50">Loading...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    challenge.status === 'completed'
                      ? 'bg-green-400/10 border-green-400/30'
                      : challenge.status === 'claimed'
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(challenge.status)}
                        <h4 className="font-medium">{challenge.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mb-2">{challenge.description}</p>
                      
                      {/* Progress Bar */}
                      {challenge.status !== 'claimed' && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/50">Progress</span>
                            <span>
                              {challenge.requirements.current}/{challenge.requirements.target}
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(challenge.requirements.current / challenge.requirements.target) * 100}%`,
                              }}
                              className="h-full bg-orange rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* Reward */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeRemaining(challenge.expiresAt)}
                        </span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          {getRewardIcon(challenge.reward.type)}
                          {challenge.reward.description}
                        </span>
                      </div>
                    </div>

                    {/* Claim Button */}
                    {challenge.status === 'completed' && userAddress && (
                      <button
                        onClick={() => claimMutation.mutate({ challengeId: challenge.id })}
                        disabled={claimMutation.isPending}
                        className="px-4 py-2 bg-accent text-primary rounded-lg font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
                      >
                        {claimMutation.isPending ? '...' : 'Claim'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default DailyChallenges;
