import cosxLogo from '../assets/experiences/cosx_logo.jpeg';
import pactlabsLogo from '../assets/experiences/pactlabs_logo.jpeg';
import equistartLogo from '../assets/experiences/equistart.jpeg';
import celoLogo from '../assets/experiences/celo_foundation_logo.jpeg';
import etgLogo from '../assets/experiences/export_trading_group_logo.jpeg';

export interface Experience {
  company: string;
  url: string;
  description: string;
  period: string;
  logo: string;
}

export const experiencesData: Experience[] = [
  {
    company: 'CosX',
    url: 'https://www.cosx.ai/',
    description: 'AI and Web3 Led Business Transformation. We simplify AI and Web3 adoption by spending a weekend with founders, identifying manual bottlenecks, and delivering tailored solutions that actually ship.',
    period: 'Mar 2025 - present',
    logo: cosxLogo,
  },
  {
    company: 'Pact labs',
    url: 'https://pactlabs.xyz/',
    description: 'Asset-based lending powered by stablecoins. Onchain private credit funds and facilities connected with originators and borrowers.',
    period: 'Mar 2025 - present',
    logo: pactlabsLogo,
  },
  {
    company: 'Equistart Labs',
    url: 'https://equistart.com/',
    description: 'Stealth Web3 Startup. Scaled various end to end, Mobile and Web Decentralised Applications (Dapps) from ideation to reality. Built Decentralised Autonomous Organisational (DAO) Tools, Balancer V4 and Uniswap V3 based Decentralised Exchange, and Decentralised Crypto Index Fund.',
    period: 'Jun 2022 - Mar 2025',
    logo: equistartLogo,
  },
  {
    company: 'Celo Foundation',
    url: 'https://celo.org/',
    description: 'Celo is pioneering to deliver financial tools and global digital payments accessible to all using crypto. The user-centric approach helps us focus on enabling prosperity for all, making crypto mobile and usable.',
    period: 'Mar 2022 - May 2022',
    logo: celoLogo,
  },
  {
    company: 'ETG India',
    url: 'https://etgindia.com/index.html',
    description: 'Led the development team in creating corporate centric insureTech hybrid mobile application, Hands on experience with React-Native, GCP AI tools, firebase and more',
    period: 'Jan 2021 - Jun 2021',
    logo: etgLogo,
  },
];

