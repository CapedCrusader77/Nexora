'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';
import { 
  ArrowRight, ArrowUpRight, Sparkles, TrendingUp, Shield, Zap, 
  CheckCircle2, Star, Activity, Globe, Box, Award,
  MessageCircle, Send, Hash
} from 'lucide-react';

// Animated counter hook
const useCounter = (target: number, duration = 2000) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        const start = Date.now();
        const step = () => {
          const progress = Math.min((Date.now() - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(target * eased);
          if (progress < 1) requestAnimationFrame(step);
        };
        step();
      }
    }, { threshold: 0.3 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, started]);

  return { value, ref };
};

const StatCounter: React.FC<{ value: number; suffix?: string; prefix?: string; decimals?: number; label: string }> = ({ value, suffix = '', prefix = '', decimals = 0, label }) => {
  const { value: count, ref } = useCounter(value);
  return (
    <div ref={ref}>
      <div className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        {prefix}{count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
      </div>
      <div className="text-sm text-white/50 mt-2">{label}</div>
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const { nfts } = useWeb3();
  const featured = nfts.slice(0, 6);

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden -mt-32 pt-32">
        {/* Background effects */}
        <div className="aurora" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="noise" />

        {/* Floating NFT cards background */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="absolute top-32 left-[10%] w-48 h-64 rounded-2xl overflow-hidden border border-white/10 animate-float opacity-60">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="absolute top-48 right-[8%] w-56 h-72 rounded-2xl overflow-hidden border border-white/10 animate-float-delayed opacity-50 -rotate-6">
            <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=400" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="absolute bottom-32 left-[5%] w-44 h-56 rounded-2xl overflow-hidden border border-white/10 animate-float opacity-40 rotate-6" style={{ animationDelay: '-2s' }}>
            <img src="https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=400" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="absolute bottom-40 right-[12%] w-40 h-52 rounded-2xl overflow-hidden border border-white/10 animate-float-delayed opacity-50 rotate-3">
            <img src="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400" className="w-full h-full object-cover" alt="" />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white/70">Live on Polygon Amoy</span>
            <span className="text-white/30">•</span>
            <span className="text-white/70">v2.0 Released</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold leading-[0.95] tracking-tighter">
            <span className="block">The Future of</span>
            <span className="block text-gradient">Digital Ownership</span>
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Discover, collect, and trade exceptional NFTs from world-class creators. 
            Built for serious collectors and Web3 natives.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button 
              onClick={() => router.push('/explore')}
              className="btn-primary group flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm cursor-pointer"
            >
              Explore Marketplace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button 
              onClick={() => router.push('/create')}
              className="btn-ghost flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-medium cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Create NFT
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 text-xs text-white/40">
            <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Audited Contracts</div>
            <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> 0.001 MATIC Gas Fees</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> EIP-2981 Royalties</div>
            <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Multi-chain Ready</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <div className="text-xs">Scroll</div>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* TICKER */}
      <section className="border-y border-white/5 py-5 overflow-hidden bg-black/20 backdrop-blur-sm">
        <div className="marquee">
          <div className="animate-ticker flex gap-12 items-center whitespace-nowrap">
            {[
              { label: 'CYBER GENESIS', value: '+24.5%', color: 'text-emerald-400' },
              { label: 'NEON DREAMS', value: '+12.8%', color: 'text-emerald-400' },
              { label: 'VOID TITANS', value: '-3.2%', color: 'text-rose-400' },
              { label: 'QUANTUM REALM', value: '+67.4%', color: 'text-emerald-400' },
              { label: 'AETHER CORE', value: '+8.9%', color: 'text-emerald-400' },
              { label: 'PIXEL PUNKS', value: '-1.5%', color: 'text-rose-400' },
              { label: 'CRYPTOVERSE', value: '+45.2%', color: 'text-emerald-400' },
              { label: 'METAVERSE OG', value: '+18.7%', color: 'text-emerald-400' },
            ].concat([
              { label: 'CYBER GENESIS', value: '+24.5%', color: 'text-emerald-400' },
              { label: 'NEON DREAMS', value: '+12.8%', color: 'text-emerald-400' },
              { label: 'VOID TITANS', value: '-3.2%', color: 'text-rose-400' },
              { label: 'QUANTUM REALM', value: '+67.4%', color: 'text-emerald-400' },
              { label: 'AETHER CORE', value: '+8.9%', color: 'text-emerald-400' },
              { label: 'PIXEL PUNKS', value: '-1.5%', color: 'text-rose-400' },
              { label: 'CRYPTOVERSE', value: '+45.2%', color: 'text-emerald-400' },
              { label: 'METAVERSE OG', value: '+18.7%', color: 'text-emerald-400' },
            ]).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/50 font-mono">{item.label}</span>
                <span className={`text-xs font-mono ${item.color}`}>{item.value}</span>
                <span className="text-white/10">/</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          <StatCounter value={284502} label="Total NFTs Minted" />
          <StatCounter value={45821} suffix=" MATIC" label="Trading Volume" />
          <StatCounter value={12380} label="Active Collectors" />
          <StatCounter value={1240} label="Verified Collections" />
        </div>
      </section>

      {/* FEATURED NFTS */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Featured Drops</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter">
              Trending right now
            </h2>
          </div>
          <button 
            onClick={() => router.push('/explore')}
            className="btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm self-start cursor-pointer"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((nft) => (
            <div 
              key={nft.tokenId}
              onClick={() => router.push(`/details/${nft.tokenId}`)}
              className="nft-card group cursor-pointer relative rounded-3xl overflow-hidden glass"
            >
              <div className="aspect-square overflow-hidden bg-black relative">
                <img src={nft.image} alt={nft.name} className="nft-card-image w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Floating badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{nft.rarity.level}</span>
                </div>
                
                {nft.isAuction && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/95 text-xs font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                    </span>
                    Live Auction
                  </div>
                )}

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-xs text-white/60 mb-1">{nft.category}</div>
                  <div className="font-display font-semibold text-xl truncate">{nft.name}</div>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between border-t border-white/5 bg-zinc-950/40">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40">
                    {nft.isAuction ? 'Top Bid' : 'Price'}
                  </div>
                  <div className="font-display font-semibold text-lg mt-0.5">
                    {nft.isAuction 
                      ? `${nft.highestBid || nft.minBid} MATIC` 
                      : nft.price > 0 ? `${nft.price} MATIC` : '—'}
                  </div>
                </div>
                <span className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  {nft.isAuction ? 'Place Bid' : 'Buy Now'}
                </span>
              </div>

              {/* Glow on hover */}
              <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-r from-cyan-500/20 to-violet-500/20 blur-xl -z-10" />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">Get Started</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Three steps to your first NFT
          </h2>
          <p className="text-white/60">From wallet connection to your first sale, we've simplified Web3</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: '01', title: 'Connect Wallet', desc: 'Link MetaMask, Coinbase, or any WalletConnect-compatible wallet in seconds.', icon: Box },
            { num: '02', title: 'Create or Buy', desc: 'Mint your own NFTs with IPFS metadata, or browse and buy from top creators.', icon: Sparkles },
            { num: '03', title: 'Earn & Trade', desc: 'List on the marketplace, host auctions, and earn perpetual royalties on resales.', icon: TrendingUp },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative group">
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 blur transition" />
                <div className="relative glass rounded-3xl p-8 h-full">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-display font-bold text-5xl text-white/10">{step.num}</div>
                  </div>
                  <div className="font-display font-semibold text-xl mb-2">{step.title}</div>
                  <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TOP CREATORS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Top Creators</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter">
              Visionary artists
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { rank: '01', name: 'cyberion.eth', vol: '847.2', change: '+24%' },
            { rank: '02', name: 'voidwalker', vol: '624.8', change: '+18%' },
            { rank: '03', name: 'neon_genesis', vol: '512.1', change: '+12%' },
            { rank: '04', name: 'pixelmancer', vol: '398.4', change: '+8%' },
          ].map((creator, i) => (
            <div key={i} className="group glass rounded-3xl p-6 hover:bg-white/[0.05] transition cursor-pointer">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-white/40">#{creator.rank}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">{creator.change}</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 mb-4 flex items-center justify-center text-2xl font-bold text-black">
                {creator.name[0].toUpperCase()}
              </div>
              <div className="font-medium mb-1">{creator.name}</div>
              <div className="flex items-center gap-1 text-xs text-white/50">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Verified Creator
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-xs text-white/40">Volume Traded</div>
                <div className="font-display font-semibold text-lg">{creator.vol} <span className="text-xs text-white/40">MATIC</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Built for Scale</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1]">
              The infrastructure layer for digital ownership
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              NEXORA combines battle-tested smart contracts, lightning-fast UX, and creator-first economics into a single, beautifully crafted platform.
            </p>

            <div className="space-y-3 pt-4">
              {[
                { icon: Shield, title: 'Reentrancy-protected contracts', desc: 'OpenZeppelin-audited security primitives' },
                { icon: Zap, title: 'Gas-optimized transactions', desc: 'Up to 60% lower fees than competitors' },
                { icon: Award, title: 'Built-in royalty enforcement', desc: 'EIP-2981 compliant, creator-first design' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-0.5">{item.title}</div>
                      <div className="text-xs text-white/50">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => router.push('/contracts')}
              className="btn-ghost inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium cursor-pointer"
            >
              View Smart Contracts <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-3xl blur-3xl" />
            <div className="relative glass-strong rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="font-mono">NEXORAMarketplace.sol</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>
              <pre className="text-xs font-mono leading-relaxed text-white/70 overflow-x-auto custom-scrollbar">
{`pragma solidity ^0.8.20;

contract NEXORAMarketplace is 
  ReentrancyGuard, 
  Ownable 
{
  uint256 public platformFee = 250; // 2.5%
  
  function listNFT(
    address nft,
    uint256 tokenId,
    uint256 price
  ) external nonReentrant {
    require(price > 0, "Invalid price");
    IERC721(nft).transferFrom(
      msg.sender, 
      address(this), 
      tokenId
    );
    // ... 
  }
}`}
              </pre>
              <div className="flex items-center gap-4 pt-4 border-t border-white/5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Audited
                </div>
                <div className="text-white/40">Solidity 0.8.20</div>
                <div className="text-white/40">200 runs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-[2rem] p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20" />
          <div className="aurora" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter">
              Start your <span className="text-gradient-cyan">Web3 journey</span>
            </h2>
            <p className="text-lg text-white/60">
              Join thousands of creators and collectors building the future of digital ownership on NEXORA.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => router.push('/create')}
                className="btn-primary flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm cursor-pointer"
              >
                Create Your First NFT <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => router.push('/explore')}
                className="btn-ghost px-7 py-3.5 rounded-2xl text-sm font-medium cursor-pointer"
              >
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500" />
                <span className="font-display font-bold text-lg">NEXORA</span>
              </div>
              <p className="text-sm text-white/50 max-w-sm">
                The premium Web3 marketplace for discovering, collecting, and trading exceptional NFTs.
              </p>
              <div className="flex gap-2 pt-2">
                {[Send, Hash, MessageCircle].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center transition">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {[
              { title: 'Marketplace', items: [{ label: 'Explore', href: '/explore' }, { label: 'Collections', href: '/collections' }, { label: 'Auctions', href: '/auctions' }, { label: 'Activity', href: '/activity' }] },
              { title: 'Account', items: [{ label: 'Profile', href: '/profile' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Settings', href: '/settings' }] },
              { title: 'Resources', items: [{ label: 'Docs', href: '#' }, { label: 'API', href: '#' }, { label: 'Contracts', href: '/contracts' }] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-xs font-medium text-white/80 mb-4">{col.title}</div>
                <div className="space-y-2.5">
                  {col.items.map(item => (
                    <Link key={item.label} href={item.href} className="block text-sm text-white/50 hover:text-white transition">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <div>© 2026 NEXORA Protocol. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                <span>All systems operational</span>
              </div>
              <div>Polygon Amoy • Chain ID 80002</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
