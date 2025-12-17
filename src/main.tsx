import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { base } from '@reown/appkit/networks'
import { wagmiAdapter, projectId, metadata, networks } from './config/wagmi'
import './index.css'
import App from './App.tsx'

// Create a client for React Query with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes gc time
      retry: 1,
    },
  },
})

// Apply dark mode to the document
document.documentElement.classList.add('dark')

// Initialize AppKit modal (must be done outside React component)
createAppKit({
  adapters: [wagmiAdapter],
  networks: [...networks],
  defaultNetwork: base,
  projectId,
  metadata,
  features: {
    analytics: false,
    swaps: false,
    onramp: false,
  },
  // Disable automatic network validation to allow cross-chain swaps
  // The Nexus SDK handles chain switching internally
  allowUnsupportedChain: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#ffffff',
    '--w3m-border-radius-master': '4px'
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
