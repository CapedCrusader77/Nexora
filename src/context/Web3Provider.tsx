'use client';

import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Web3ContextProvider } from './Web3Context';

const config = getDefaultConfig({
  appName: 'NEXORA NFT Marketplace',
  projectId: 'a4ca2249b6f849cc6b84eb921c5d9a18', // Standard WalletConnect Demo Project ID
  chains: [polygonAmoy],
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#06b6d4',
            accentColorForeground: '#050505',
            borderRadius: 'medium',
            overlayBlur: 'large',
          })}
        >
          <Web3ContextProvider>
            {children}
          </Web3ContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
