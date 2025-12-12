import rektceoImg from '../assets/projects/rektceo.png';
import cryptoindexImg from '../assets/projects/cryptoindex.png';
import simplidaoImg from '../assets/projects/simplidao.png';
import availMemeImg from '../assets/projects/avail-meme.png';

export interface Project {
  name: string;
  url: string;
  description: string;
  image: string;
  tags: string[];
  techStack: string[];
  impact: string;
}

export const projectsData: Project[] = [
  {
    name: 'Rekt CEO',
    url: 'https://www.rektceo.club/',
    description: 'A web3 native brand bridging web2 fun and interaction with web3 ethos of digital ownership',
    image: rektceoImg,
    tags: ['Memecoin', 'Community', 'NFT'],
    techStack: ['React', 'Solidity', 'IPFS', 'Dapp'],
    impact: '1000+ NFTs minted | Active community',
  },
  {
    name: 'Crypto Index',
    url: 'https://crypto-index-wine.vercel.app/',
    description: 'Decentralised Structured Investment Funds, a tech that can help initiate Index Fund, Mutual funds and other funds. (DeFi)',
    image: cryptoindexImg,
    tags: ['DeFi', 'Smart Contract', 'Full stack'],
    techStack: ['Foundry', 'Balancer V3', 'Uniswap V3', 'React'],
    impact: 'Balancer V3 + Uniswap V3 architecture',
  },
  {
    name: 'Simpli DAO',
    url: 'https://simpli-dao.vercel.app/',
    description: 'DAO Tooling Full Stack App, that helps manage an inchain community. Create proposal, vote using tokens, and automated payouts.',
    image: simplidaoImg,
    tags: ['DAO', 'Governance', 'Full Stack'],
    techStack: ['Solidity', 'React', 'WalletConnect', 'Celo'],
    impact: 'Won $2.5K at Build With Celo Hackathon',
  },
  {
    name: 'Avail Meme',
    url: 'https://avail-meme.vercel.app/',
    description: 'A creative web3 meme project leveraging blockchain technology for community engagement and digital collectibles.',
    image: availMemeImg,
    tags: ['Web3', 'Memecoin', 'Community'],
    techStack: ['React', 'TypeScript', 'Web3.js', 'Avail'],
    impact: 'Community-driven engagement platform',
  },
];

