'use client';

import React, { useMemo, useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { 
  BarChart3, 
  Coins, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  History,
  FileCode,
  Globe
} from 'lucide-react';

export default function DashboardPage() {
  const { isConnected, walletAddress, balance, nfts, transactions } = useWeb3();
  const [chartTimeline, setChartTimeline] = useState<'7d' | '30d'>('7d');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Total NFTs Owned
  const totalOwned = useMemo(() => {
    if (!walletAddress) return 0;
    return nfts.filter(nft => nft.owner.toLowerCase() === walletAddress.toLowerCase()).length;
  }, [nfts, walletAddress]);

  // 2. Created NFTs count
  const totalCreated = useMemo(() => {
    if (!walletAddress) return 0;
    return nfts.filter(nft => nft.creator.toLowerCase() === walletAddress.toLowerCase()).length;
  }, [nfts, walletAddress]);

  // 3. Simulated Earnings / Revenue Analytics
  const analytics = useMemo(() => {
    if (!walletAddress) return { earnings: 0, salesCount: 0, avgPrice: 0 };
    
    // Filter buy transactions where current user was the seller (recipient)
    const salesTx = transactions.filter(tx => 
      tx.type === 'Buy' && tx.to.toLowerCase() === walletAddress.toLowerCase()
    );

    const earnings = salesTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const avgPrice = salesTx.length > 0 ? parseFloat((earnings / salesTx.length).toFixed(3)) : 0;

    return {
      earnings,
      salesCount: salesTx.length,
      avgPrice
    };
  }, [transactions, walletAddress]);

  // 4. Mock SVG Chart Data points
  const chartPoints = useMemo(() => {
    // Return coordinate points for SVG path representing trading volume
    // 7d or 30d timeline
    const data7d = [15, 22, 18, 32, 28, 42, 35];
    const data30d = [10, 14, 12, 18, 15, 22, 19, 26, 23, 31, 28, 36, 32, 42, 38, 46, 42, 51, 47, 56, 52, 61, 57, 66, 62, 71, 67, 76, 72, 82];

    const data = chartTimeline === '7d' ? data7d : data30d;
    const maxVal = Math.max(...data);
    const width = 500;
    const height = 150;
    
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (val / maxVal) * (height - 20) - 10;
      return { x, y, val };
    });

    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { points, pathD, areaD, width, height };
  }, [chartTimeline]);

  if (!mounted || !isConnected || !walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl py-24 text-center px-4 max-w-xl mx-auto space-y-6">
        <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="text-md font-bold text-white font-rajdhani">Analytics Dashboard Lock</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Please connect your Web3 wallet using the top menu to view your portfolio analytics, revenue charts, and transaction history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-rajdhani">Analytics Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time statistics covering your listed assets, trade volume, and wallet activity.</p>
        </div>
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
          <button 
            onClick={() => setChartTimeline('7d')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${chartTimeline === '7d' ? 'bg-zinc-800 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-white'}`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setChartTimeline('30d')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${chartTimeline === '30d' ? 'bg-zinc-800 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-white'}`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Grid Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'NFTs Owned', value: totalOwned, desc: 'Held in connected wallet', icon: Layers, color: 'text-cyan-400' },
          { label: 'NFTs Minted', value: totalCreated, desc: 'Created on Polygon Amoy', icon: FileCode, color: 'text-fuchsia-400' },
          { label: 'Secondary Earnings', value: `${analytics.earnings.toFixed(2)} MATIC`, desc: 'Sales revenues acquired', icon: Coins, color: 'text-amber-400' },
          { label: 'Est. Net Worth', value: `${(totalOwned * 1.1 + balance).toFixed(2)} MATIC`, desc: 'Assets floor + cash', icon: DollarSign, color: 'text-emerald-400' }
        ].map((widget, i) => {
          const Icon = widget.icon;
          return (
            <div key={i} className="border border-zinc-850 bg-zinc-900/10 p-5 rounded-2xl space-y-4 hover:border-zinc-700 transition">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{widget.label}</span>
                <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 ${widget.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white font-rajdhani">{widget.value}</h3>
                <span className="text-[10px] text-zinc-500 block mt-1">{widget.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Volume Area Chart */}
        <div className="lg:col-span-8 border border-zinc-800 bg-zinc-950 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trading Activity</h3>
              <span className="text-[11px] text-zinc-500">Captured transaction frequencies across local blocks</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.4% Volume Increase</span>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="relative pt-4">
            <svg 
              viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`} 
              className="w-full h-[180px] overflow-visible"
            >
              <defs>
                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="35" x2={chartPoints.width} y2="35" stroke="#1f2937" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2={chartPoints.width} y2="75" stroke="#1f2937" strokeDasharray="4 4" />
              <line x1="0" y1="115" x2={chartPoints.width} y2="115" stroke="#1f2937" strokeDasharray="4 4" />

              {/* Area */}
              <path d={chartPoints.areaD} fill="url(#gradient-area)" />
              
              {/* Path Line */}
              <path d={chartPoints.pathD} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
              
              {/* Points circles */}
              {chartPoints.points.map((p, idx) => (
                <circle 
                  key={idx} 
                  cx={p.x} 
                  cy={p.y} 
                  r="4" 
                  fill="#09090b" 
                  stroke="#22d3ee" 
                  strokeWidth="2" 
                  className="hover:r-6 cursor-pointer transition"
                />
              ))}
            </svg>
            
            {/* Timeline axis labels */}
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-3 px-1">
              <span>{chartTimeline === '7d' ? 'Monday' : 'Day 1'}</span>
              <span>{chartTimeline === '7d' ? 'Wednesday' : 'Day 15'}</span>
              <span>{chartTimeline === '7d' ? 'Sunday' : 'Day 30'}</span>
            </div>
          </div>
        </div>

        {/* Right: Wallet Details & Node Health */}
        <div className="lg:col-span-4 border border-zinc-800 bg-zinc-900/10 p-6 rounded-2xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Node & Wallet Health</h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-2.5 border-b border-zinc-850">
              <span className="text-zinc-500 font-semibold">Active Identity</span>
              <span className="font-mono text-zinc-300">{walletAddress.substring(0, 8)}...{walletAddress.substring(34)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2.5 border-b border-zinc-850">
              <span className="text-zinc-500 font-semibold">Native Token Balance</span>
              <span className="font-bold text-white">{balance.toFixed(4)} MATIC</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-zinc-850">
              <span className="text-zinc-500 font-semibold">Client Blockchain</span>
              <span className="font-bold text-cyan-400">Polygon Amoy Testnet</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-zinc-850">
              <span className="text-zinc-500 font-semibold">Node Status</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <Globe className="h-3.5 w-3.5 mr-1" />
                Sovereign Connected
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              // Open Polygon Explorer
              window.open(`https://amoy.polygonscan.com/address/${walletAddress}`, '_blank');
            }}
            className="w-full flex items-center justify-center space-x-1.5 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 py-3 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <span>Inspect Explorer Details</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Transaction History Logs */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-zinc-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historical Block Logs</h3>
        </div>

        <div className="border border-zinc-800 rounded-2xl bg-zinc-900/10 overflow-hidden divide-y divide-zinc-800/80">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500">
              No transactions logged on-chain yet. Mint an NFT, place a bid, or switch networks to log activity!
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.hash} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    tx.type === 'Mint' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                    tx.type === 'List' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' :
                    tx.type === 'Buy' ? 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' :
                    tx.type === 'Bid' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-zinc-400 border-zinc-800'
                  }`}>
                    {tx.type}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-zinc-200 font-bold">
                      {tx.type === 'Mint' && `Minted NFT "${tx.tokenName}" (#${tx.tokenId})`}
                      {tx.type === 'List' && `Listed NFT #${tx.tokenId} for sale`}
                      {tx.type === 'Buy' && `Purchased NFT #${tx.tokenId}`}
                      {tx.type === 'Bid' && `Placed bid on NFT #${tx.tokenId}`}
                      {tx.type === 'Cancel' && `Canceled listing of #${tx.tokenId}`}
                      {tx.type === 'End Auction' && `Completed auction for #${tx.tokenId}`}
                      {tx.type === 'Network Switch' && `Switched active node / account`}
                    </span>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      From: <span className="text-zinc-400">{tx.from}</span> &rarr; To: <span className="text-zinc-400">{tx.to}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                  <div>
                    <span className="text-zinc-300 font-bold block">
                      {tx.amount && tx.amount > 0 ? `${tx.amount} MATIC` : '0.00 MATIC'}
                    </span>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <a 
                    href={`https://amoy.polygonscan.com/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
