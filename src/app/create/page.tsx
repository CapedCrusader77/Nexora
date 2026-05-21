'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import { 
  Upload, 
  Sparkles, 
  Coins, 
  ShieldAlert, 
  Tag, 
  Hammer,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function CreatePage() {
  const router = useRouter();
  const { isConnected, walletAddress, mintNFT } = useWeb3();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Art');
  const [image, setImage] = useState('');
  const [isAuction, setIsAuction] = useState(false);
  const [priceOrBid, setPriceOrBid] = useState('');
  const [duration, setDuration] = useState('24');
  const [royaltyFee, setRoyaltyFee] = useState('5');
  const [royaltyReceiver, setRoyaltyReceiver] = useState('');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Gas and Status States
  const [gasEstimate, setGasEstimate] = useState<number>(0.0028);
  const [isPending, setIsPending] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Pre-loaded premium artwork options
  const preloadArtworks = [
    { name: 'Solitude Neon', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop' },
    { name: 'Abstract Grid', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop' },
    { name: 'Cyber Sentinel', url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=400&auto=format&fit=crop' }
  ];

  // Auto-fill royalty receiver on wallet connection
  useEffect(() => {
    if (walletAddress) {
      setRoyaltyReceiver(walletAddress);
    }
  }, [walletAddress]);

  // Recalculate mock gas fee occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setGasEstimate(parseFloat((0.002 + Math.random() * 0.0015).toFixed(6)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImage(val);
    setPreviewError(false);
  };

  const selectPreload = (url: string) => {
    setImage(url);
    setPreviewError(false);
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      const results = [
        `Procedurally generated cyberpunk entity with ${category.toLowerCase()} overlays. Synthesized on-chain under the command: "${aiPrompt}". Authorized by CyberSpace neural nodes.`,
        `Autonomous virtual construct representing "${aiPrompt}". Engineered for maximum performance in high-density decentralised databases, featuring modular metadata extensions.`,
        `Cryptographic digital signature mapping out "${aiPrompt}" in raw vector frequencies. Optimized for compliance with standard ERC721 registry models.`
      ];
      setDescription(results[Math.floor(Math.random() * results.length)]);
      setAiGenerating(false);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !priceOrBid || !image) return;

    setIsPending(true);
    try {
      const response = await mintNFT({
        name,
        description: description || `A premium ${category.toLowerCase()} NFT on CyberSpace.`,
        image,
        category,
        royaltyFee: parseFloat(royaltyFee) || 5,
        royaltyReceiver: royaltyReceiver || walletAddress || '',
        isAuction,
        priceOrBid: parseFloat(priceOrBid) || 0.1,
        duration: isAuction ? parseInt(duration) : undefined
      });

      if (response.success) {
        // Redirect to explore/marketplace gallery
        router.push('/explore');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-rajdhani">Mint Cyber Asset</h1>
        <p className="text-sm text-zinc-500 mt-1">Create single ERC721 compliant digital collectibles with custom royalty layers.</p>
      </div>

      {!mounted || !isConnected ? (
        <div className="border border-zinc-800 bg-zinc-900/10 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-md font-bold text-white font-rajdhani">Wallet Connection Required</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              To write parameters to the smart contract, sign metadata IPFS pins, or estimate block fees, you must connect a Web3 wallet first.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-950/20 cursor-pointer"
          >
            Go to Connection Hub
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 bg-zinc-900/10 border border-zinc-850 p-6 rounded-2xl">
            
            {/* Asset Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-2">Asset Details</h3>
              
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1.5">Asset Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sentinel V1 Core"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1.5">Collection Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {['Art', 'Gaming', 'Music', 'Photography', 'Virtual Worlds', 'Cyberpunk'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* AI Description Generator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-400">Description Prompt (Optional)</label>
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={aiGenerating || !aiPrompt.trim()}
                    className="flex items-center space-x-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{aiGenerating ? 'Writing...' : 'Generate Description'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. A digital sentinel with red carbon armor..."
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a custom description or use the generator above to compose standard metadata context."
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Asset Media Source */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-2">Media & Storage</h3>
              
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1.5">Artwork Image URL *</label>
                <input
                  type="url"
                  value={image}
                  onChange={handleImageChange}
                  placeholder="Provide image link (https://...)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              {/* Preloaded artworks */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-semibold block">Select a premium template image:</span>
                <div className="flex gap-3">
                  {preloadArtworks.map((art, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectPreload(art.url)}
                      className={`flex-1 flex items-center space-x-2 border rounded-xl p-2 bg-zinc-950 hover:bg-zinc-900/60 transition text-left cursor-pointer ${
                        image === art.url ? 'border-cyan-500 bg-cyan-950/5' : 'border-zinc-800'
                      }`}
                    >
                      <img src={art.url} alt={art.name} className="h-8 w-8 rounded-lg object-cover" />
                      <span className="text-[10px] text-zinc-400 font-bold truncate">{art.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Listing Model */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-2">Listing Configuration</h3>
              
              <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsAuction(false)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    !isAuction 
                      ? 'bg-zinc-900 text-cyan-400 border border-zinc-800' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  <span>Fixed Sale Price</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuction(true)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isAuction 
                      ? 'bg-zinc-900 text-fuchsia-400 border border-zinc-850' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Hammer className="h-4 w-4" />
                  <span>Live Auction Drop</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1.5">
                    {isAuction ? 'Minimum Initial Bid *' : 'Listing Price *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">MATIC</span>
                    <input
                      type="number"
                      step="0.01"
                      value={priceOrBid}
                      onChange={(e) => setPriceOrBid(e.target.value)}
                      placeholder="e.g. 1.25"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-14 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                {isAuction && (
                  <div>
                    <label className="text-xs font-bold text-zinc-400 block mb-1.5">Auction Duration *</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-350 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="1">1 Hour (Testing)</option>
                      <option value="12">12 Hours</option>
                      <option value="24">24 Hours</option>
                      <option value="72">3 Days</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Royalties Setup */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-2">Creator Royalty Payout</h3>
              <p className="text-[11px] text-zinc-500">
                Configure royalty fees compliant with the ERC2981 standard. Payments are distributed automatically.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-zinc-400 block mb-1.5">Fee Percentage *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={royaltyFee}
                      onChange={(e) => setRoyaltyFee(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-6 pl-3 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">%</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-400 block mb-1.5">Royalty Receiver Wallet Address *</label>
                  <input
                    type="text"
                    value={royaltyReceiver}
                    onChange={(e) => setRoyaltyReceiver(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Review & Submit */}
            <div className="border-t border-zinc-800/80 pt-6 space-y-4">
              {/* Gas estimate info */}
              <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-850 text-xs">
                <span className="text-zinc-500 font-semibold flex items-center">
                  <Coins className="h-4 w-4 mr-1 text-cyan-400 animate-pulse" />
                  Estimated Gas Fee:
                </span>
                <span className="font-mono font-bold text-zinc-200">{gasEstimate.toFixed(6)} MATIC</span>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 hover:brightness-110 py-4 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
              >
                <span>{isPending ? 'Uploading to IPFS & Minting...' : 'Mint NFT & List on Marketplace'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </form>

          {/* Preview Side */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">On-chain Live Preview</span>
            
            {/* Simulated Card Preview */}
            <div className="border border-zinc-800 bg-zinc-950 p-3 rounded-2xl shadow-xl space-y-4">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center">
                {image && !previewError ? (
                  <img 
                    src={image} 
                    alt="NFT Preview" 
                    className="h-full w-full object-cover" 
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="text-center p-6 text-zinc-500 space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-zinc-700 animate-bounce" />
                    <span className="text-xs block">Preview will display here after you enter a valid URL</span>
                  </div>
                )}
                
                {/* Rarity Rank */}
                <div className="absolute top-3 left-3 bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md">
                  EPIC (Est.)
                </div>
              </div>

              <div className="p-2 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Category</span>
                    <span className="text-xs text-white font-bold">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Royalties</span>
                    <span className="text-xs text-emerald-400 font-bold">{royaltyFee || '5'}% Compliance</span>
                  </div>
                </div>

                <div className="border-t border-zinc-900/80 pt-3 flex justify-between items-end">
                  <div>
                    <h4 className="text-md font-bold text-white font-rajdhani leading-none truncate max-w-[200px]">
                      {name || 'Asset Title'}
                    </h4>
                    <span className="text-[10px] text-zinc-500 block mt-1 text-ellipsis overflow-hidden">
                      Creator: {walletAddress ? `${walletAddress.substring(0, 8)}...` : 'Not Connected'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 block uppercase font-semibold">
                      {isAuction ? 'Min Bid' : 'Price'}
                    </span>
                    <span className="text-sm font-extrabold text-white flex items-center">
                      {isAuction ? <Clock className="h-3.5 w-3.5 mr-0.5 text-fuchsia-400" /> : <Tag className="h-3.5 w-3.5 mr-0.5 text-cyan-400" />}
                      {priceOrBid ? `${priceOrBid} MATIC` : '0.00 MATIC'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage metadata simulation */}
            <div className="border border-zinc-800 bg-zinc-900/20 p-4 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-zinc-400 block">Simulated IPFS Pinata Info</span>
              <div className="space-y-1 font-mono text-[10px] text-zinc-500 leading-relaxed">
                <div>status: <span className="text-emerald-400">pinned</span></div>
                <div>hash: QmMetadataCID_{name.replace(/\s+/g, '') || 'Unnamed'}_Amoy</div>
                <div>version: IPFS v1.0.0</div>
                <div>gateway: https://gateway.pinata.cloud/ipfs/</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
