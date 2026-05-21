import React, { useState, useEffect } from 'react';
import { NFT, useWeb3 } from '../context/Web3Context';
import { Clock, Eye, Star, Zap } from 'lucide-react';

interface NFTCardProps {
  nft: NFT;
  onSelect: (tokenId: number) => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, onSelect }) => {
  const { isConnected, walletAddress, buyNFT, placeBid } = useWeb3();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!nft.isAuction || !nft.auctionEndTime || nft.auctionEnded) return;
    const calc = () => {
      const diff = nft.auctionEndTime! - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    calc();
    const i = setInterval(calc, 1000);
    return () => clearInterval(i);
  }, [nft]);

  const rarityColors: Record<string, string> = {
    Legendary: 'from-amber-400 to-orange-500',
    Epic: 'from-fuchsia-400 to-purple-500',
    Rare: 'from-cyan-400 to-blue-500',
    Common: 'from-zinc-400 to-zinc-500',
  };

  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPending(true);
    await buyNFT(nft.tokenId);
    setIsPending(false);
  };

  const handleBid = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const bid = nft.highestBid ? nft.highestBid * 1.05 : (nft.minBid || 0.1);
    setIsPending(true);
    await placeBid(nft.tokenId, bid);
    setIsPending(false);
  };

  const isOwner = walletAddress?.toLowerCase() === nft.owner.toLowerCase();

  return (
    <div
      onClick={() => onSelect(nft.tokenId)}
      className="nft-card group cursor-pointer relative rounded-3xl overflow-hidden glass"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-zinc-950 relative">
        <img 
          src={nft.image} 
          alt={nft.name} 
          className="nft-card-image w-full h-full object-cover" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${rarityColors[nft.rarity.level]} text-black text-[10px] font-bold uppercase tracking-wider`}>
            <Star className="w-3 h-3 fill-current" />
            {nft.rarity.level}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition"
          >
            <svg className={`w-4 h-4 transition ${liked ? 'fill-rose-500 text-rose-500' : 'fill-none text-white'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Auction Timer */}
        {nft.isAuction && !nft.auctionEnded && timeLeft && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-xl glass-strong">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
              <span className="text-white/70">Live</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono">
              <Clock className="w-3 h-3 text-white/50" />
              <span>{timeLeft}</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/40 truncate font-mono">{nft.creator.slice(0, 8)}...{nft.creator.slice(-4)}</span>
            <div className="flex items-center gap-1 text-xs text-white/40">
              <Eye className="w-3 h-3" />
              <span>{nft.views}</span>
            </div>
          </div>
          <div className="font-display font-semibold text-lg truncate group-hover:text-cyan-400 transition">{nft.name}</div>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-white/5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">
              {nft.isAuction ? 'Highest Bid' : 'Price'}
            </div>
            <div className="font-display font-semibold text-lg mt-0.5">
              {nft.isAuction 
                ? `${(nft.highestBid || nft.minBid || 0).toFixed(2)}`
                : nft.price > 0 ? nft.price.toFixed(2) : '—'} 
              <span className="text-xs text-white/40 ml-1">MATIC</span>
            </div>
          </div>

          {isConnected && !isOwner && nft.isListed && !nft.isAuction && (
            <button
              onClick={handleBuy}
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0 disabled:opacity-50"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Buy
            </button>
          )}

          {isConnected && !isOwner && nft.isAuction && !nft.auctionEnded && timeLeft !== 'Ended' && (
            <button
              onClick={handleBid}
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-black text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
            >
              Place Bid
            </button>
          )}

          {isOwner && (
            <div className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] text-white/60 font-medium">
              You own this
            </div>
          )}
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-r from-cyan-500/30 to-violet-500/30 blur-xl -z-10" />
    </div>
  );
};
