'use client';

import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { Activity } from 'lucide-react';

export default function ActivityPage() {
  const { transactions } = useWeb3();

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-6 h-6 text-cyan-400" />
        <h1 className="font-display text-3xl font-bold tracking-tight">Live Activity Feed</h1>
      </div>

      <div className="space-y-3">
        {transactions && transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between border border-white/5 bg-zinc-950/40 backdrop-blur-md p-5 rounded-2xl hover:border-white/10 transition-colors"
            >
              <div>
                <div className="font-medium flex items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    tx.type === 'Mint' ? 'bg-cyan-500/10 text-cyan-400' :
                    tx.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'List' ? 'bg-violet-500/10 text-violet-400' :
                    tx.type === 'Bid' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {tx.type}
                  </span>
                  <span>{tx.tokenName || `Token #${tx.tokenId}`}</span>
                </div>
                <div className="text-xs text-white/50 font-mono mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                  <span>{new Date(tx.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className="text-cyan-400/80">{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</span>
                  <span>→</span>
                  <span className="text-violet-400/80">{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold">{tx.amount ? `${tx.amount} MATIC` : '—'}</div>
                <div className={`text-xs ${
                  tx.status === 'Success' ? 'text-emerald-400' : 
                  tx.status === 'Pending' ? 'text-amber-400 animate-pulse' : 
                  'text-rose-400'
                }`}>
                  {tx.status}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl text-white/40">
            <Activity className="w-8 h-8 mx-auto mb-3 opacity-25" />
            <p className="text-sm">No recent on-chain activity yet. Start minting or buying NFTs!</p>
          </div>
        )}
      </div>
    </div>
  );
}
