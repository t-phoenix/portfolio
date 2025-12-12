import dorahacksLogo from '../assets/achievements/dorahacks.png';
import gitcoinLogo from '../assets/achievements/gitcoin.jpeg';
import hackerearthLogo from '../assets/achievements/hackerearth.png';

export interface Achievement {
  name: string;
  platform: string;
  prize: string;
  position: string;
  project: string;
  date: string;
}

export const platformLogos: Record<string, string> = {
  'DoraHacks': dorahacksLogo,
  'Gitcoin': gitcoinLogo,
  'Hackerearth': hackerearthLogo,
};

export const achievementsData: Achievement[] = [
  {
    name: 'Balancer Hookathon',
    platform: 'DoraHacks',
    prize: '$2,000',
    position: 'Winner',
    project: 'Volatility-based Fee Hook for Balancer V3',
    date: 'Sept-Oct 2024',
  },
  {
    name: 'Harmony Hackathon',
    platform: 'Gitcoin',
    prize: '$20,000',
    position: '1st Prize',
    project: 'On-Chain Wallet Frontend with React Native',
    date: 'Aug-Sept 2021',
  },
  {
    name: 'Build With Celo',
    platform: 'Hackerearth',
    prize: '$2,500',
    position: 'Winner',
    project: 'Equistart - The DAO Suite',
    date: 'Sept-Nov 2022',
  },
  {
    name: 'Green NFT Hackathon',
    platform: 'Gitcoin',
    prize: '$1,700',
    position: 'Winner',
    project: 'NFT Sustainability Research',
    date: 'Mar-May 2021',
  },
];

