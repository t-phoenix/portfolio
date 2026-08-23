'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { base } from '@reown/appkit/networks';
import { wagmiAdapter, projectId, metadata, networks } from '@/config/wagmi';
import { useState, useEffect } from 'react';
import { initGA } from '@/lib/analytics';
import 'atropos/css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

let appKitInitialized = false;

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initGA();

    if (!appKitInitialized) {
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
        allowUnsupportedChain: true,
        themeMode: 'dark',
        themeVariables: {
          '--w3m-accent': '#ffffff',
          '--w3m-border-radius-master': '4px',
        },
      });
      appKitInitialized = true;
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
