'use client';

import React, { useState } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, CheckCircle2, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'top' | 'new'>('trending');
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const collections = [
    { 
      rank: 1, name: 'Cyber Genesis', vol: '12,840', items: 10000, floor: '2.45', change: 38.4, owners: 4280, verified: true,
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600',
    },
    { 
      rank: 2, name: 'Neon Sentinels', vol: '8,920', items: 5000, floor: '1.85', change: 22.1, owners: 2890, verified: true,
      banner: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600',
    },
    { 
      rank: 3, name: 'Vaporwave Dreams', vol: '6,480', items: 8888, floor: '0.95', change: -4.2, owners: 3120, verified: false,
      banner: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600',
    },
    { 
      rank: 4, name: 'Quantum Realms', vol: '5,210', items: 1540, floor: '1.15', change: 67.8, owners: 920, verified: true,
      banner: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600',
    },
    { 
      rank: 5, name: 'Pixel Punks', vol: '4,820', items: 10000, floor: '3.20', change: 12.5, owners: 5800, verified: true,
      banner: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600',
    },
    { 
      rank: 6, name: 'Aether Core', vol: '3,950', items: 7500, floor: '0.78', change: 8.9, owners: 2120, verified: true,
      banner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600',
    },
    { 
      rank: 7, name: 'Void Walkers', vol: '3,210', items: 3333, floor: '1.55', change: -3.2, owners: 1850, verified: false,
      banner: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600',
    },
    { 
      rank: 8, name: 'Metaverse OG', vol: '2,840', items: 4444, floor: '0.65', change: 18.7, owners: 2400, verified: true,
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600',
    },
  ];

  return (
    <div className="space-y-10 pb-24">
      <div>
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">Discover</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tighter">Collections</h1>
        <p className="text-white/50 text-sm mt-2">The most valuable NFT collections trading right now</p>
      </div>

      {/* Tabs and timeframe */}
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="flex gap-1 p-1 rounded-2xl border border-white/10 self-start">
          {[
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'top', label: 'Top', icon: Sparkles },
            { id: 'new', label: 'New', icon: TrendingUp },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === t.id ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-1 p-1 rounded-2xl border border-white/10 self-start">
          {(['1h', '24h', '7d', '30d'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                timeframe === t ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Featured */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.slice(0, 3).map((col, i) => (
          <div key={i} className="group relative rounded-3xl overflow-hidden glass cursor-pointer">
            <div className="relative h-40 overflow-hidden">
              <img 
                src={col.banner} 
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition duration-700" 
                alt={col.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full glass-strong text-xs font-mono">
                #{col.rank}
              </div>
            </div>
            <div className="p-5 -mt-12 relative z-10">
              <div className="w-16 h-16 rounded-2xl border-2 border-black bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center font-display font-bold text-2xl text-black mb-4">
                {col.name[0]}
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="font-display font-semibold text-lg">{col.name}</div>
                {col.verified && <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-white/40">Floor</div>
                  <div className="font-display font-semibold">{col.floor} MATIC</div>
                </div>
                <div>
                  <div className="text-xs text-white/40">Volume</div>
                  <div className="font-display font-semibold">{col.vol} <span className="text-xs text-white/40">MATIC</span></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rankings table */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider">
              <tr>
                <th className="text-left p-4 font-medium">#</th>
                <th className="text-left p-4 font-medium">Collection</th>
                <th className="text-right p-4 font-medium">Floor</th>
                <th className="text-right p-4 font-medium hidden md:table-cell">Volume</th>
                <th className="text-right p-4 font-medium hidden lg:table-cell">Change</th>
                <th className="text-right p-4 font-medium hidden lg:table-cell">Owners</th>
                <th className="text-right p-4 font-medium hidden xl:table-cell">Items</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition group">
                  <td className="p-4 text-white/40 font-mono">{col.rank}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center font-display font-bold text-black flex-shrink-0 relative">
                        <img src={col.banner} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{col.name}</span>
                        {col.verified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-display font-medium">{col.floor} MATIC</td>
                  <td className="p-4 text-right hidden md:table-cell font-mono">{col.vol}</td>
                  <td className="p-4 text-right hidden lg:table-cell">
                    <span className={`inline-flex items-center gap-1 font-mono text-xs ${col.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {col.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {col.change > 0 ? '+' : ''}{col.change}%
                    </span>
                  </td>
                  <td className="p-4 text-right hidden lg:table-cell text-white/60 font-mono">{col.owners.toLocaleString()}</td>
                  <td className="p-4 text-right hidden xl:table-cell text-white/60 font-mono">{col.items.toLocaleString()}</td>
                  <td className="p-4">
                    <button className="p-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition hover:bg-white hover:text-black">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
