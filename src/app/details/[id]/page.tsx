'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3, NFT } from '../../../context/Web3Context';
import { 
  ArrowLeft, 
  Clock, 
  Tag, 
  Hammer, 
  Layers, 
  Coins, 
  User,
  Heart,
  Share2,
  Sparkles,
  ExternalLink,
  MessageSquareCode,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DetailsPageProps {
  params: {
    id: string;
  };
}

export default function DetailsPage({ params }: DetailsPageProps) {
  const router = useRouter();
  const tokenId = parseInt(params.id);
  
  const { 
    nfts, 
    isConnected, 
    walletAddress, 
    buyNFT, 
    placeBid, 
    listNFT, 
    cancelListing,
    endAuction
  } = useWeb3();

  const [nft, setNft] = useState<NFT | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  const [bidAmount, setBidAmount] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);
  const [listPrice, setListPrice] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(45);

  // Sync NFT state from context
  useEffect(() => {
    const currentNft = nfts.find(n => n.tokenId === tokenId);
    if (currentNft) {
      setNft(currentNft);
    }
  }, [nfts, tokenId]);

  // Auction Countdown
  useEffect(() => {
    if (!nft || !nft.isAuction || !nft.auctionEndTime || nft.auctionEnded) return;

    const calculateTimeLeft = () => {
      const difference = nft.auctionEndTime! - Date.now();
      if (difference <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [nft]);

  const handleBack = () => {
    router.push('/explore');
  };

  if (!nft) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <span className="text-sm">NFT not found in contract storage.</span>
        <button onClick={handleBack} className="mt-4 text-cyan-400 flex items-center space-x-1 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </button>
      </div>
    );
  }

  const isOwner = mounted && walletAddress && walletAddress.toLowerCase() === nft.owner.toLowerCase();
  const isCreator = mounted && walletAddress && walletAddress.toLowerCase() === nft.creator.toLowerCase();
  const minRequiredBid = nft.highestBid ? nft.highestBid * 1.05 : (nft.minBid || 0.1);

  const handleBuy = async () => {
    setIsPending(true);
    try {
      await buyNFT(nft.tokenId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(bidAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    setIsPending(true);
    try {
      const success = await placeBid(nft.tokenId, parsed);
      if (success) setBidAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  const handleListForSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(listPrice);
    if (isNaN(parsed) || parsed <= 0) return;

    setIsPending(true);
    try {
      const success = await listNFT(nft.tokenId, parsed);
      if (success) setListPrice('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  const handleCancelListing = async () => {
    setIsPending(true);
    try {
      await cancelListing(nft.tokenId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  const handleEndAuction = async () => {
    setIsPending(true);
    try {
      await endAuction(nft.tokenId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  // Simulated AI Description Generation
  const generateAiDescription = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const cyberQuotes = [
        `Forged in the silicon valleys of the Amoy grid, this digital entity integrates neural network core layers with Ethers protocol verification. Its traits (${nft.rarity.traits.map(t => t.value).join(', ')}) establish its priority status in sovereign databases.`,
        `A rare digital artifact representing the intersection of autonomous agents and generative vector logic. With a rarity index score of ${nft.rarity.score}, this unit stands as an elite sentinel in the decentralized metaverse.`,
        `Synthesized using quantum computing simulations on the Polygon network. Contains encrypted metadata layers pinning its raw visual parameters to decentralized storage archives. Highly resistant to sovereign decryption.`
      ];
      
      const randomQuote = cyberQuotes[Math.floor(Math.random() * cyberQuotes.length)];
      setNft(prev => {
        if (!prev) return null;
        return {
          ...prev,
          description: randomQuote
        };
      });
      setAiGenerating(false);
    }, 1500);
  };

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Back CTA */}
      <button 
        onClick={handleBack}
        className="inline-flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Gallery</span>
      </button>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Image / Visuals */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <img 
              src={nft.image} 
              alt={nft.name} 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Top traits badges overlay */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 bg-zinc-950/80 border border-cyan-500/20 px-3 py-1 rounded-full backdrop-blur-md">
                Rarity Rank: {nft.rarity.level}
              </span>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="grid grid-cols-3 gap-4 border border-zinc-800/80 bg-zinc-900/10 p-4 rounded-2xl">
            <div className="text-center">
              <span className="text-[10px] text-zinc-500 block font-semibold uppercase">Token ID</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5">#{nft.tokenId}</span>
            </div>
            <div className="text-center border-x border-zinc-850">
              <span className="text-[10px] text-zinc-500 block font-semibold uppercase">Rarity Score</span>
              <span className="text-sm font-bold text-cyan-400 font-rajdhani mt-0.5">{nft.rarity.score}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-zinc-500 block font-semibold uppercase">Total Views</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5">{nft.views}</span>
            </div>
          </div>

          {/* Social interactives */}
          <div className="flex gap-4">
            <button 
              onClick={toggleLike}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl border transition cursor-pointer ${
                liked 
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-400' 
                  : 'border-zinc-800 bg-zinc-900/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="text-xs font-semibold">{likesCount} Likes</span>
            </button>
            
            <button className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl border border-zinc-800 bg-zinc-900/10 text-zinc-400 hover:text-white transition cursor-pointer">
              <Share2 className="h-4 w-4" />
              <span className="text-xs font-semibold">Share Metadata</span>
            </button>
          </div>
        </div>

        {/* Right: Info, Price, Bidding & Actions */}
        <div className="lg:col-span-7 space-y-8">
          {/* Title & Creator */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>{nft.category} Drop</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white font-rajdhani leading-tight">
              {nft.name}
            </h1>
            
            {/* Owner & Creator breakdown */}
            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <div className="flex items-center space-x-3 bg-zinc-900/20 border border-zinc-850 p-2.5 rounded-xl flex-1">
                <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Creator</span>
                  <span className="text-xs font-mono text-zinc-300 block truncate">{nft.creator}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-zinc-900/20 border border-zinc-850 p-2.5 rounded-xl flex-1">
                <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Current Owner</span>
                  <span className="text-xs font-mono text-zinc-300 block truncate">
                    {isOwner ? 'You (Current Wallet)' : nft.owner}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & AI generation */}
          <div className="border border-zinc-800/80 bg-zinc-900/10 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metadata Description</h3>
              {mounted && isConnected && (isOwner || isCreator) && (
                <button
                  onClick={generateAiDescription}
                  disabled={aiGenerating}
                  className="flex items-center space-x-1 bg-cyan-950/30 hover:bg-cyan-500 hover:text-black border border-cyan-500/20 hover:border-cyan-400 px-3 py-1.5 rounded-lg text-[10px] font-bold text-cyan-400 transition disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{aiGenerating ? 'AI Generating...' : 'Optimize with AI'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {nft.description}
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
              <span>IPFS CID:</span>
              <span className="text-zinc-400 hover:underline cursor-pointer">QmXoypizjW3WknFixtdKLwznw71tbF1T2wD5vQP3G8v2Yg</span>
              <ExternalLink className="h-3 w-3 text-zinc-600" />
            </div>
          </div>

          {/* Financials / Actions Box */}
          <div className="border border-zinc-800 bg-zinc-950 p-6 rounded-2xl space-y-6">
            {/* Price Details */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-5">
              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                  {nft.isAuction ? 'Current High Bid' : 'Listing Status'}
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  {nft.isAuction ? (
                    <>
                      <Hammer className="h-5 w-5 text-fuchsia-400" />
                      <span className="text-2xl font-extrabold text-white font-rajdhani">
                        {nft.highestBid && nft.highestBid > 0 ? `${nft.highestBid} MATIC` : `${nft.minBid} MATIC (Min)`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Tag className="h-5 w-5 text-cyan-400" />
                      <span className="text-2xl font-extrabold text-white font-rajdhani">
                        {nft.price > 0 ? `${nft.price} MATIC` : 'Not Listed'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Rarity levels details */}
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Royalty Compliance</span>
                <span className="text-xs font-semibold text-emerald-400 mt-1 block">
                  {nft.royaltyFee}% Creator Royalty
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Receiver: {nft.royaltyReceiver.substring(0, 8)}...</span>
              </div>
            </div>

            {/* Auction specific details */}
            {nft.isAuction && !nft.auctionEnded && (
              <div className="flex items-center justify-between bg-zinc-900/20 p-4 rounded-xl border border-zinc-850">
                <span className="text-xs text-zinc-400 font-semibold flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-fuchsia-400 animate-pulse" />
                  Auction Countdown Timer:
                </span>
                <span className="font-mono text-sm font-extrabold text-white">{timeLeft}</span>
              </div>
            )}

            {/* CTA Interaction Logic */}
            {!mounted || !isConnected ? (
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-center text-xs text-zinc-500">
                Please connect your Web3 wallet to bid, purchase, list, or cancel listings for this NFT.
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Buying flow (if listed and user is not owner) */}
                {!nft.isAuction && nft.isListed && !isOwner && (
                  <button
                    onClick={handleBuy}
                    disabled={isPending}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 py-4 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Coins className="h-4 w-4" />
                    <span>{isPending ? 'Confirming Purchase...' : `Purchase Now for ${nft.price} MATIC`}</span>
                  </button>
                )}

                {/* 2. Place Bid flow (if in auction, not ended, user is not owner) */}
                {nft.isAuction && !nft.auctionEnded && timeLeft !== 'Ended' && !isOwner && (
                  <form onSubmit={handlePlaceBid} className="space-y-3">
                    <div className="flex items-stretch gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">MATIC</span>
                        <input
                          type="number"
                          step="0.01"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Min bid ${minRequiredBid.toFixed(2)}`}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-14 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:brightness-110 px-6 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                      >
                        {isPending ? 'Bidding...' : 'Submit Bid'}
                      </button>
                    </div>
                    <span className="text-[10px] text-zinc-500 block leading-relaxed">
                      *Note: Each bid must be at least 5% higher than the previous highest bid. Funds will be escrowed. Outbid users are automatically refunded.
                    </span>
                  </form>
                )}

                {/* 3. Claim NFT flow (if auction ended and needs payout) */}
                {nft.isAuction && !nft.auctionEnded && timeLeft === 'Ended' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-fuchsia-950/20 border border-fuchsia-900/30 rounded-xl text-xs text-fuchsia-400">
                      The countdown timer has expired. The highest bidder must trigger the claim function.
                    </div>
                    <button
                      onClick={handleEndAuction}
                      disabled={isPending}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 py-4 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      <Zap className="h-4 w-4" />
                      <span>{isPending ? 'Claiming...' : 'Finalize Auction & Transfer NFT'}</span>
                    </button>
                  </div>
                )}

                {/* 4. Owner listing options (if not listed and user is owner) */}
                {!nft.isListed && !nft.isAuction && isOwner && (
                  <form onSubmit={handleListForSale} className="space-y-3">
                    <span className="text-xs font-bold text-white block">List this asset for sale</span>
                    <div className="flex items-stretch gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">Price</span>
                        <input
                          type="number"
                          step="0.01"
                          value={listPrice}
                          onChange={(e) => setListPrice(e.target.value)}
                          placeholder="e.g. 1.5 MATIC"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        {isPending ? 'Listing...' : 'List NFT'}
                      </button>
                    </div>
                  </form>
                )}

                {/* 5. Owner cancel listing options (if listed and user is owner) */}
                {nft.isListed && !nft.isAuction && isOwner && (
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 text-[11px] text-zinc-400">
                      Your NFT is currently listed for sale at <b>{nft.price} MATIC</b>. You can cancel the listing to reclaim it.
                    </div>
                    <button
                      onClick={handleCancelListing}
                      disabled={isPending}
                      className="w-full flex items-center justify-center space-x-2 bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-950/40 py-3.5 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                    >
                      Cancel Listing (Return NFT)
                    </button>
                  </div>
                )}

                {/* 6. Owner auction options (if auction is active, but isOwner) */}
                {nft.isAuction && !nft.auctionEnded && timeLeft !== 'Ended' && isOwner && (
                  <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl text-center text-xs text-zinc-400">
                    You have listed this asset in a live auction. You can monitor the bids below in real-time. Bids cannot be canceled.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Traits Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attributes & Traits Rarity</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {nft.rarity.traits.map((trait, i) => (
                <div key={i} className="border border-zinc-850 bg-zinc-900/10 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">{trait.trait_type}</span>
                  <span className="text-xs text-white font-bold block mt-1">{trait.value}</span>
                  <span className="text-[10px] text-cyan-400 block mt-0.5">{trait.rarityScore}% have this trait</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bidding History / Activity Log */}
          {nft.isAuction && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bid History Log</h3>
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden divide-y divide-zinc-850">
                {nft.bids.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No bids have been submitted for this auction yet. Be the first to place a bid!
                  </div>
                ) : (
                  nft.bids.map((bid, index) => (
                    <div key={index} className="flex justify-between items-center p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <MessageSquareCode className="h-4.5 w-4.5 text-zinc-500" />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-zinc-300 block">
                            {bid.bidder === walletAddress ? 'You' : bid.bidder}
                          </span>
                          <span className="text-[9px] text-zinc-500 block">
                            {new Date(bid.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-fuchsia-400 font-mono">
                        {bid.amount} MATIC
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
