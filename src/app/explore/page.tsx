'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import { NFTCard } from '../../components/NFTCard';
import { Search, Grid3x3, List, ChevronDown, X, SlidersHorizontal } from 'lucide-react';

export default function ExplorePage() {
  const router = useRouter();
  const { nfts } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'listed' | 'auction'>('all');

  const categories = ['All', 'Art', 'Gaming', 'Music', 'Photography', 'Virtual Worlds', 'Cyberpunk'];

  const filtered = useMemo(() => {
    return nfts
      .filter(nft => {
        const match = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      nft.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      nft.tokenId.toString() === searchTerm;
        const catMatch = selectedCategory === 'All' || nft.category === selectedCategory;
        const statusMatch = statusFilter === 'all' || 
                           (statusFilter === 'listed' && nft.isListed) ||
                           (statusFilter === 'auction' && nft.isAuction);
        const price = nft.isAuction ? (nft.highestBid || nft.minBid || 0) : nft.price;
        const minMatch = !priceMin || price >= parseFloat(priceMin);
        const maxMatch = !priceMax || price <= parseFloat(priceMax);
        return match && catMatch && statusMatch && minMatch && maxMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'price-low') {
          const ap = a.isAuction ? (a.highestBid || a.minBid || 0) : a.price;
          const bp = b.isAuction ? (b.highestBid || b.minBid || 0) : b.price;
          return ap - bp;
        }
        if (sortBy === 'price-high') {
          const ap = a.isAuction ? (a.highestBid || a.minBid || 0) : a.price;
          const bp = b.isAuction ? (b.highestBid || b.minBid || 0) : b.price;
          return bp - ap;
        }
        if (sortBy === 'views') return b.views - a.views;
        return 0;
      });
  }, [nfts, searchTerm, selectedCategory, sortBy, priceMin, priceMax, statusFilter]);

  const activeFilterCount = (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (selectedCategory !== 'All' ? 1 : 0);

  const handleSelectNft = (tokenId: number) => {
    router.push(`/details/${tokenId}`);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Marketplace</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tighter">Explore NFTs</h1>
        <p className="text-white/50 text-sm">Discover {nfts.length} unique digital assets from creators worldwide</p>
      </div>

      {/* Search & controls */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, creator, or token ID..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-400/50 focus:bg-white/[0.05] outline-none transition text-sm text-white"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition text-sm cursor-pointer ${
            showFilters || activeFilterCount > 0 ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-white/10 hover:bg-white/5'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-400 text-black text-[10px] font-bold">{activeFilterCount}</span>
          )}
        </button>

        <div className="relative">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="appearance-none pl-4 pr-10 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm outline-none cursor-pointer hover:bg-white/5 text-white"
          >
            <option value="newest" className="bg-zinc-950">Newest first</option>
            <option value="oldest" className="bg-zinc-950">Oldest first</option>
            <option value="price-low" className="bg-zinc-950">Price: Low to High</option>
            <option value="price-high" className="bg-zinc-950">Price: High to Low</option>
            <option value="views" className="bg-zinc-950">Most viewed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-white/40" />
        </div>

        <div className="flex border border-white/10 rounded-2xl p-1 bg-white/[0.01]">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="glass rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <div>
            <div className="text-xs font-medium text-white/60 mb-3">Status</div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'listed', label: 'Buy Now' },
                { id: 'auction', label: 'Auction' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    statusFilter === s.id ? 'bg-white text-black' : 'border border-white/10 hover:bg-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-white/60 mb-3">Price Range (MATIC)</div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white outline-none focus:border-cyan-400/50"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>

          <div className="md:text-right flex md:justify-end items-end">
            <button
              onClick={() => { setPriceMin(''); setPriceMax(''); setStatusFilter('all'); setSelectedCategory('All'); }}
              className="text-xs text-white/50 hover:text-white cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat 
                ? 'bg-white text-black' 
                : 'border border-white/10 hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results counter */}
      <div className="text-xs text-white/40">
        Showing {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
      </div>

      {/* Grid / List view */}
      {filtered.length === 0 ? (
        <div className="glass rounded-3xl py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <Search className="w-7 h-7 text-white/40" />
          </div>
          <div className="font-medium mb-2 text-white">No NFTs found</div>
          <div className="text-sm text-white/50">Try adjusting your filters or search query</div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(nft => (
            <NFTCard key={nft.tokenId} nft={nft} onSelect={handleSelectNft} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(nft => (
            <div 
              key={nft.tokenId}
              onClick={() => handleSelectNft(nft.tokenId)}
              className="flex items-center gap-4 p-3 rounded-2xl border border-white/10 hover:bg-white/5 cursor-pointer transition group bg-zinc-900/10"
            >
              <img src={nft.image} alt={nft.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{nft.name}</div>
                <div className="text-xs text-white/50 font-mono truncate">{nft.creator}</div>
              </div>
              <div className="hidden md:block">
                <div className="text-xs text-white/40">Category</div>
                <div className="text-sm text-white">{nft.category}</div>
              </div>
              <div className="hidden md:block">
                <div className="text-xs text-white/40">Rarity</div>
                <div className="text-sm text-white">{nft.rarity.level}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/40">{nft.isAuction ? 'Bid' : 'Price'}</div>
                <div className="font-display font-semibold text-white">{nft.isAuction ? (nft.highestBid || nft.minBid) : nft.price} MATIC</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
