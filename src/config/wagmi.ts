import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, optimism, arbitrum, scroll, bsc } from '@reown/appkit/networks'
import { http } from 'wagmi'

// Get WalletConnect project ID from environment
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

// Get Alchemy API key from environment for dedicated RPC
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API

// Use Alchemy RPC if API key is available, otherwise fallback to public RPC
const baseRpcUrl = alchemyApiKey 
  ? `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
  : 'https://mainnet.base.org'

// Metadata for the dApp
export const metadata = {
  name: 'Potshot',
  description: 'A fun lottery game on Base',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://www.abhini.in',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Set the networks - Base is the primary chain for ticket purchases
// Other chains are supported for Nexus SDK cross-chain swaps
export const networks = [base, optimism, arbitrum, scroll, bsc] as [
  typeof base,
  typeof optimism,
  typeof arbitrum,
  typeof scroll,
  typeof bsc
]

// Create Wagmi Adapter with all supported chains for cross-chain swaps
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  transports: {
    [base.id]: http(baseRpcUrl),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [scroll.id]: http(),
    [bsc.id]: http(),
  },
})

// Export the wagmi config for use in providers
export const config = wagmiAdapter.wagmiConfig

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
