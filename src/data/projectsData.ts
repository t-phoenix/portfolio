import rektceoImg from '../assets/projects/rektceo.webp';
import cryptoindexImg from '../assets/projects/cryptoindex.webp';
import simplidaoImg from '../assets/projects/simplidao.webp';
import availMemeImg from '../assets/projects/avail-meme.webp';
import ownbackImg from '../assets/projects/ownback.jpg';

export interface Project {
  name: string;
  url: string;
  description: string;
  image: string;
  tags: string[];
  techStack: string[];
  impact: string;
  // where it was built (hackathon, sprint) and whether it is live
  origin?: string;
  year?: string;
  live?: boolean;
  // brand colour for the logo tile glow
  accent?: string;
}

export const projectsData: Project[] = [
  {
    name: 'Ownback',
    url: 'https://www.ownback.tech',
    description: 'A small share of every purchase goes into the companies behind it as tokenized shares in your own wallet. You approve every buy; sign in with Google, hold only USDC.',
    image: ownbackImg,
    tags: ['Consumer', 'Tokenized stocks', 'USDC'],
    techStack: ['Arc', '0G', 'Arkiv', 'USDC'],
    impact: 'Live with real money on mainnet · free for the first 1,000',
    origin: 'Built in 36 hours at ETHGlobal Mumbai',
    year: '2026',
    live: true,
    accent: '#4CC38A',
  },
  {
    name: 'Rekt CEO',
    url: 'https://www.rektceo.club/',
    description: 'A web3 native brand bridging web2 fun and interaction with web3 ethos of digital ownership',
    image: rektceoImg,
    tags: ['Memecoin', 'Community', 'NFT'],
    techStack: ['React', 'Solidity', 'IPFS', 'Dapp'],
    impact: '1000+ NFTs minted | Active community',
    accent: '#f2c230',
  },
  {
    name: 'Crypto Index',
    url: 'https://crypto-index-wine.vercel.app/',
    description: 'Decentralised Structured Investment Funds, a tech that can help initiate Index Fund, Mutual funds and other funds. (DeFi)',
    image: cryptoindexImg,
    tags: ['DeFi', 'Smart Contract', 'Full stack'],
    techStack: ['Foundry', 'Balancer V3', 'Uniswap V3', 'React'],
    impact: 'Balancer V3 + Uniswap V3 architecture',
    accent: '#b5e36f',
  },
  {
    name: 'Simpli DAO',
    url: 'https://simpli-dao.vercel.app/',
    description: 'DAO Tooling Full Stack App, that helps manage an inchain community. Create proposal, vote using tokens, and automated payouts.',
    image: simplidaoImg,
    tags: ['DAO', 'Governance', 'Full Stack'],
    techStack: ['Solidity', 'React', 'WalletConnect', 'Celo'],
    impact: 'Won $2.5K at Build With Celo Hackathon',
    origin: 'Build With Celo hackathon',
    year: '2022',
    accent: '#9df29b',
  },
  {
    name: 'Avail Meme',
    url: 'https://avail-meme.vercel.app/',
    description: 'A creative web3 meme project leveraging blockchain technology for community engagement and digital collectibles.',
    image: availMemeImg,
    tags: ['Web3', 'Memecoin', 'Community'],
    techStack: ['React', 'TypeScript', 'Web3.js', 'Avail'],
    impact: 'Community-driven engagement platform',
    accent: '#6aa3ff',
  },
];

