'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Wallet, Menu, X, Search, Sparkles, ChevronDown, LogOut, 
  Copy, Check, Zap, Terminal
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

export const NEXORANavbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    isSimulatorOpen,
    setSimulatorOpen,
    walletType,
    walletAddress,
    balance,
    disconnectWallet
  } = useWeb3();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { href: '/explore', label: 'Explore' },
    { href: '/collections', label: 'Collections' },
    { href: '/auctions', label: 'Auctions' },
    { href: '/activity', label: 'Activity' },
    { href: '/dashboard', label: 'Stats' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong py-2' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link 
              href="/"
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 p-[1px]">
                  <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4L20 20M20 4L4 20" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="24" y2="24">
                          <stop stopColor="#67e8f9"/>
                          <stop offset="1" stopColor="#c084fc"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">NEXORA</span>
              <span className="hidden xl:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-semibold uppercase tracking-wider">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                EtherAuthority
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm transition-colors ${
                      isActive ? 'text-white font-medium' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition group"
            >
              <Search className="w-4 h-4 text-white/40 group-hover:text-white/70" />
              <span className="text-sm text-white/40 flex-1 text-left">Search NFTs, collections, creators...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/40 border border-white/10">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link 
              href="/create"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition"
            >
              <Sparkles className="w-4 h-4" /> Create
            </Link>

            {/* Dev Simulator Trigger */}
            <button
              onClick={() => setSimulatorOpen(!isSimulatorOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isSimulatorOpen 
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold' 
                  : 'bg-white/[0.02] border border-white/5 hover:border-white/15 text-white/70 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">Dev Simulator</span>
            </button>

            {walletType === 'simulated' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimulatorOpen(true)}
                  className="hidden md:inline-block px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-950/20 text-xs text-cyan-400 hover:bg-cyan-950/40 transition font-medium"
                >
                  Amoy (Simulated)
                </button>
                
                <button 
                  onClick={() => setSimulatorOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 text-sm transition"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-[10px] text-cyan-400/50">{balance.toFixed(3)} MATIC</span>
                    <span className="text-[10px] font-mono">{walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : ''}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-cyan-400/50" />
                </button>
                
                <button
                  onClick={disconnectWallet}
                  className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition"
                  title="Disconnect Simulation"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button 
                              onClick={openConnectModal} 
                              className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-black text-sm font-semibold"
                            >
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 blur-md opacity-60 group-hover:opacity-100 transition" />
                              <Wallet className="relative w-4 h-4" /> 
                              <span className="relative">Connect Wallet</span>
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button 
                              onClick={openChainModal} 
                              className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-2"
                            >
                              Wrong network
                            </button>
                          );
                        }

                        return (
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={openChainModal}
                              className="hidden sm:inline-block px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/70 hover:bg-white/10"
                            >
                              {chain.name}
                            </button>
                            
                            <button 
                              onClick={openAccountModal}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/5 transition"
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500" />
                              <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-xs text-white/50">{account.displayBalance ? account.displayBalance : '0.00 MATIC'}</span>
                                <span className="text-xs font-mono">{account.displayName}</span>
                              </div>
                              <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/5 mt-2 px-6 py-4 space-y-1 glass-strong">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-sm"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/create"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Create NFT
            </Link>
            <button
              onClick={() => {
                setSimulatorOpen(!isSimulatorOpen);
                setMobileOpen(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-sm flex items-center gap-2 text-cyan-400 font-medium"
            >
              <Terminal className="w-4 h-4" /> Dev Simulator
            </button>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm animate-fade-in p-4 pt-[15vh]"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl mx-auto glass-strong rounded-2xl overflow-hidden animate-slide-up"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Search className="w-5 h-5 text-white/40" />
              <input 
                autoFocus
                placeholder="Search NFTs, collections, addresses..." 
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-xs px-2 py-1 rounded border border-white/10">ESC</button>
            </div>
            <div className="p-4 text-xs text-white/40">
              <div className="px-2 py-1 font-medium">Suggestions</div>
              {['Trending NFTs', 'Latest Drops', 'Top Collections', 'Featured Auctions'].map(s => (
                <button key={s} className="w-full text-left px-2 py-2 rounded hover:bg-white/5 text-sm text-white">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
