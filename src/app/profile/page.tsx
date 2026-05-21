'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import { NFTCard } from '../../components/NFTCard';
import { 
  User, 
  Coins, 
  Layers, 
  Grid, 
  History, 
  ExternalLink,
  Edit2,
  Check,
  Globe,
  Wallet
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { isConnected, walletAddress, balance, nfts, transactions } = useWeb3();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // User details state (locally persisted editable profile info)
  const [username, setUsername] = useState('Cyber Collector');
  const [bio, setBio] = useState('Digital curator of high-rarity metaverse artwork and cryptographic artifacts.');
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempBio, setTempBio] = useState(bio);
  
  const [activeSubTab, setActiveSubTab] = useState<'owned' | 'created' | 'activity'>('owned');

  const saveProfile = () => {
    setUsername(tempUsername);
    setBio(tempBio);
    setIsEditing(false);
  };

  // Filter owned NFTs
  const ownedNfts = useMemo(() => {
    if (!walletAddress) return [];
    return nfts.filter(nft => nft.owner.toLowerCase() === walletAddress.toLowerCase());
  }, [nfts, walletAddress]);

  // Filter created NFTs
  const createdNfts = useMemo(() => {
    if (!walletAddress) return [];
    return nfts.filter(nft => nft.creator.toLowerCase() === walletAddress.toLowerCase());
  }, [nfts, walletAddress]);

  // Filter user transactions
  const userTransactions = useMemo(() => {
    if (!walletAddress) return [];
    return transactions.filter(
      tx => tx.from.toLowerCase() === walletAddress.toLowerCase() || 
            tx.to.toLowerCase() === walletAddress.toLowerCase()
    );
  }, [transactions, walletAddress]);

  const handleSelectNft = (tokenId: number) => {
    router.push(`/details/${tokenId}`);
  };

  if (!mounted || !isConnected || !walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl py-24 text-center px-4 max-w-xl mx-auto space-y-6">
        <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
          <User className="h-6 w-6" />
        </div>
        <h3 className="text-md font-bold text-white font-rajdhani">Profile Connection Required</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Please connect your Web3 wallet using the top menu to view your collected assets, design portfolio, or recent transaction history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Banner / Header */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-fuchsia-500/5 to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${walletAddress}`} 
              alt="Avatar" 
              className="h-24 w-24 rounded-2xl border-2 border-zinc-800 p-1 bg-zinc-900 shadow-2xl" 
            />
            <span className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 rounded-full border-2 border-zinc-950"></span>
          </div>

          {/* Info Details */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {isEditing ? (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="bg-zinc-900 border border-zinc-850 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <button 
                    onClick={saveProfile}
                    className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <h2 className="text-2xl font-extrabold text-white font-rajdhani flex items-center gap-2">
                  <span>{username}</span>
                  <button 
                    onClick={() => {
                      setTempUsername(username);
                      setTempBio(bio);
                      setIsEditing(true);
                    }}
                    className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </h2>
              )}

              <span className="text-[10px] text-zinc-500 font-mono bg-zinc-900 border border-zinc-850 px-2 py-1 rounded-full flex items-center">
                <Wallet className="h-3 w-3 mr-1 text-zinc-500" />
                {walletAddress}
              </span>
            </div>

            {isEditing ? (
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            ) : (
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                {bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-xs pt-2">
              <div className="flex items-center space-x-1.5 text-zinc-500">
                <Coins className="h-4 w-4 text-cyan-400" />
                <span className="text-white font-bold">{balance.toFixed(3)} MATIC</span>
              </div>
              
              <div className="h-1 w-1 bg-zinc-800 rounded-full hidden sm:block"></div>

              <div className="flex items-center space-x-1.5 text-zinc-500">
                <Globe className="h-4 w-4 text-fuchsia-400" />
                <span className="text-white font-semibold">Polygon Amoy Testnet</span>
              </div>

              <div className="h-1 w-1 bg-zinc-800 rounded-full hidden sm:block"></div>

              <a 
                href={`https://amoy.polygonscan.com/address/${walletAddress}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-zinc-500 hover:text-cyan-400 transition"
              >
                <span>PolygonScan</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: 'owned', label: 'Collected NFTs', count: ownedNfts.length, icon: Grid },
          { id: 'created', label: 'Created Portfolio', count: createdNfts.length, icon: Layers },
          { id: 'activity', label: 'Activity Logs', count: userTransactions.length, icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-4 px-6 text-xs font-bold transition cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'border-b-2 border-cyan-400 text-cyan-400 bg-zinc-900/10' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full text-[10px] border border-zinc-850">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {activeSubTab === 'owned' && (
          ownedNfts.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl py-20 text-center text-xs text-zinc-500">
              Your wallet holds no CyberSpace NFTs. Visit the explore page to browse and acquire listed items.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ownedNfts.map((nft) => (
                <NFTCard 
                  key={nft.tokenId} 
                  nft={nft} 
                  onSelect={handleSelectNft} 
                />
              ))}
            </div>
          )
        )}

        {activeSubTab === 'created' && (
          createdNfts.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl py-20 text-center text-xs text-zinc-500">
              You haven't minted any items under this address yet. Visit the creation studio to deploy your first NFT.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {createdNfts.map((nft) => (
                <NFTCard 
                  key={nft.tokenId} 
                  nft={nft} 
                  onSelect={handleSelectNft} 
                />
              ))}
            </div>
          )
        )}

        {activeSubTab === 'activity' && (
          userTransactions.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl py-20 text-center text-xs text-zinc-500">
              No recent blockchain records registered for this address.
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-2xl bg-zinc-900/10 divide-y divide-zinc-800/80 overflow-hidden max-w-3xl">
              {userTransactions.map((tx) => (
                <div key={tx.hash} className="p-4 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                      tx.type === 'Mint' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      tx.type === 'List' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' :
                      tx.type === 'Buy' ? 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' :
                      tx.type === 'Bid' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-zinc-400 border-zinc-800'
                    }`}>
                      {tx.type}
                    </span>
                    <span className="text-zinc-400 ml-3">
                      {tx.type === 'Mint' && `Minted CyberNFT #${tx.tokenId}`}
                      {tx.type === 'List' && `Listed CyberNFT #${tx.tokenId} for ${tx.amount} MATIC`}
                      {tx.type === 'Buy' && `Purchased CyberNFT #${tx.tokenId} for ${tx.amount} MATIC`}
                      {tx.type === 'Bid' && `Placed bid of ${tx.amount} MATIC on #${tx.tokenId}`}
                      {tx.type === 'Cancel' && `Canceled listing of #${tx.tokenId}`}
                      {tx.type === 'End Auction' && `Completed auction for #${tx.tokenId}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-zinc-500 block">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                    <a 
                      href={`https://amoy.polygonscan.com/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-400 hover:underline inline-flex items-center mt-0.5 font-mono"
                    >
                      Explorer link <ExternalLink className="h-3 w-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
