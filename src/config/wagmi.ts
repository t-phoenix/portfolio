import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Get WalletConnect project ID from environment or use a default for development
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

// Get Alchemy API key from environment for dedicated RPC
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API

// Use Alchemy RPC if API key is available, otherwise fallback to public RPC
const baseRpcUrl = alchemyApiKey 
  ? `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
  : 'https://mainnet.base.org'
export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(baseRpcUrl),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
