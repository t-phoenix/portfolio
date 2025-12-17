import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from '@reown/appkit/networks'
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

// Set the networks
export const networks: [typeof base] = [base]

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  transports: {
    [base.id]: http(baseRpcUrl),
  },
})

// Export the wagmi config for use in providers
export const config = wagmiAdapter.wagmiConfig

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
