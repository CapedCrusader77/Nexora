import React from 'react';
import type { Metadata } from 'next';
import { Web3Provider } from '../context/Web3Provider';
import { NEXORANavbar } from '../components/NEXORANavbar';
import { WalletSimulator } from '../components/WalletSimulator';
import { Footer } from '../components/Footer';
import '../index.css';

export const metadata: Metadata = {
  title: 'NEXORA | NFT Marketplace — EtherAuthority Internship Project',
  description: 'A production-grade Web3 NFT Marketplace & Auction House built on Polygon Amoy Testnet. Developed under the EtherAuthority Training Program featuring real blockchain transactions, ERC-721 minting, and ERC-2981 royalty compliance.',
  keywords: ['NFT', 'Marketplace', 'Polygon', 'Ethereum', 'Web3', 'EtherAuthority', 'DApp', 'Blockchain'],
  authors: [{ name: 'EtherAuthority Intern' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500 selection:text-black antialiased">
        <Web3Provider>
          {/* Neon Floating Ambient Backgrounds */}
          <div className="aurora pointer-events-none absolute inset-0 overflow-hidden z-0"></div>
          <div className="noise pointer-events-none absolute inset-0 opacity-[0.015] z-0"></div>
          
          <div className="relative z-10 flex flex-col min-h-screen">
            {/* Top Navbar */}
            <NEXORANavbar />
            <WalletSimulator />

            {/* Main Page Layout */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
              {children}
            </main>

            {/* Footer with EtherAuthority Branding */}
            <Footer />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
