'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import { NFTCard } from '../../components/NFTCard';
import { Search, Radio, SlidersHorizontal, Grid, AlertCircle } from 'lucide-react';

export default function AuctionsPage() {
  const router = useRouter();
  const { nfts } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time-left'); // time-left, bid-low, bid-high

  // Filter and sort only active auctions
  const activeAuctions = useMemo(() => {
    return nfts
      .filter(nft => {
        if (!nft.isAuction || nft.auctionEnded) return false;
        
        const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              nft.creator.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'time-left') {
          return (a.auctionEndTime || 0) - (b.auctionEndTime || 0);
        }
        if (sortBy === 'bid-low') {
          const aBid = a.highestBid || a.minBid || 0;
          const bBid = b.highestBid || b.minBid || 0;
          return aBid - bBid;
        }
        if (sortBy === 'bid-high') {
          const aBid = a.highestBid || a.minBid || 0;
          const bBid = b.highestBid || b.minBid || 0;
          return bBid - aBid;
        }
        return 0;
      });
  }, [nfts, searchTerm, sortBy]);

  const handleSelectNft = (tokenId: number) => {
    router.push(`/details/${tokenId}`);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-rajdhani flex items-center gap-2">
            <Radio className="h-6 w-6 text-fuchsia-500 animate-pulse" />
            <span>Live Web3 Auctions</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Place competitive bids in real-time. Smart contract escrow compliance secured.</p>
        </div>
      </div>

      {/* Filters and search bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search active auctions by name or creator address..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition duration-300"
          />
        </div>

        {/* Sorting */}
        <div className="flex items-center bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 font-semibold self-start lg:self-auto">
          <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-zinc-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none text-zinc-300 focus:ring-0 cursor-pointer pr-5 font-sans"
          >
            <option value="time-left" className="bg-zinc-900 text-white">Ending Soonest</option>
            <option value="bid-low" className="bg-zinc-900 text-white">Price: Low to High</option>
            <option value="bid-high" className="bg-zinc-900 text-white">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Info notice about refund mechanics */}
      <div className="bg-fuchsia-950/20 border border-fuchsia-900/30 p-4 rounded-xl flex items-start space-x-3 max-w-3xl">
        <AlertCircle className="h-5 w-5 text-fuchsia-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-fuchsia-300">Escrow Refund Protection</span>
          <p className="text-[11px] text-fuchsia-400/80 leading-relaxed">
            When you place a bid, your MATIC tokens are held in the escrow contract. If you are outbid, the contract instantly refunds your bid to your wallet. If you win, the NFT is transferred to your wallet and the funds are split to the seller and the creator royalty recipient.
          </p>
        </div>
      </div>

      {/* Grid gallery */}
      {activeAuctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl py-24 text-center px-4">
          <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4">
            <Grid className="h-6 w-6" />
          </div>
          <h3 className="text-md font-bold text-white font-rajdhani">No Active Auctions Found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            There are currently no listed items under active bidding parameters. You can create an auction by minting a new NFT and selecting "Live Auction Drop".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeAuctions.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              nft={nft}
              onSelect={handleSelectNft}
            />
          ))}
        </div>
      )}
    </div>
  );
}
