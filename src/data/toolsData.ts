import ethereumIcon from '../assets/tools/ethereum.png';
import solidityIcon from '../assets/tools/solidity.png';
import foundryIcon from '../assets/tools/foundry.png';
import walletconnectIcon from '../assets/tools/walletconnect.png';
import reactnativeIcon from '../assets/tools/reactnative.png';
import javascriptIcon from '../assets/tools/javascript.png';
import ethersIcon from '../assets/tools/ethers.png';
import alchemyIcon from '../assets/tools/alchemy.png';
import hardhatIcon from '../assets/tools/hardhat.png';
import metamaskIcon from '../assets/tools/metamask.png';
import nodejsIcon from '../assets/tools/nodejs.png';
import openzeppelinIcon from '../assets/tools/OpenZeppelin.png';
import typescriptIcon from '../assets/tools/type-script.png';
import web3jsIcon from '../assets/tools/web3js.jpeg';
import uniswapIcon from '../assets/tools/uniswap.jpeg';
import balancerIcon from '../assets/tools/balancer.jpeg';
import polygonIcon from '../assets/tools/polygon.jpeg';
import bnbIcon from '../assets/tools/bnb.png';
import solanaIcon from '../assets/tools/solana.jpeg';
import aptosIcon from '../assets/tools/aptos.png';
import basechainIcon from '../assets/tools/basechain.png';

export interface Tool {
  name: string;
  category: string;
  icon: string;
}

export const toolsData: Tool[] = [
  {
    name: 'Ethereum',
    category: 'L1 Blockchain',
    icon: ethereumIcon,
  },
  {
    name: 'Solidity',
    category: 'Programming Language',
    icon: solidityIcon,
  },
  {
    name: 'TypeScript',
    category: 'Programming Language',
    icon: typescriptIcon,
  },
  {
    name: 'JavaScript',
    category: 'Programming Language',
    icon: javascriptIcon,
  },
  {
    name: 'Foundry',
    category: 'Solidity Development Tool',
    icon: foundryIcon,
  },
  {
    name: 'Hardhat',
    category: 'Ethereum Development',
    icon: hardhatIcon,
  },
  {
    name: 'Wallet Connect',
    category: 'Web3 Wallet Tool',
    icon: walletconnectIcon,
  },
  {
    name: 'MetaMask',
    category: 'Web3 Wallet',
    icon: metamaskIcon,
  },
  {
    name: 'React/React-Native',
    category: 'Frontend Frameworks',
    icon: reactnativeIcon,
  },
  {
    name: 'Node.js',
    category: 'Runtime Environment',
    icon: nodejsIcon,
  },
  {
    name: 'Ethers.js',
    category: 'Web3 SDK',
    icon: ethersIcon,
  },
  {
    name: 'Web3.js',
    category: 'Web3 SDK',
    icon: web3jsIcon,
  },
  {
    name: 'Alchemy',
    category: 'Node Provider',
    icon: alchemyIcon,
  },
  {
    name: 'OpenZeppelin',
    category: 'Smart Contract Library',
    icon: openzeppelinIcon,
  },
  {
    name: 'Uniswap',
    category: 'DEX Protocol',
    icon: uniswapIcon,
  },
  {
    name: 'Balancer',
    category: 'DeFi Protocol',
    icon: balancerIcon,
  },
  {
    name: 'Polygon',
    category: 'L2 Scaling Solution',
    icon: polygonIcon,
  },
  {
    name: 'BNB Chain',
    category: 'L1 Blockchain',
    icon: bnbIcon,
  },
  {
    name: 'Solana',
    category: 'L1 Blockchain',
    icon: solanaIcon,
  },
  {
    name: 'Aptos',
    category: 'L1 Blockchain',
    icon: aptosIcon,
  },
  {
    name: 'Base',
    category: 'L2 Blockchain',
    icon: basechainIcon,
  },
];

