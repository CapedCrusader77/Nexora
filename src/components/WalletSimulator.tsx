'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { 
  X, 
  Terminal, 
  Coins, 
  RefreshCw, 
  FileCode, 
  Layers, 
  Database,
  ExternalLink,
  Copy,
  Check,
  User,
  AlertCircle
} from 'lucide-react';

export const WalletSimulator: React.FC = () => {
  const { 
    isSimulatorOpen, 
    setSimulatorOpen, 
    isConnected, 
    walletAddress, 
    network,
    transactions,
    addBalance,
    connectWallet,
    clearTransactions
  } = useWeb3();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number>(14298710);
  const [activeSubTab, setActiveSubTab] = useState<'explorer' | 'contracts' | 'faucet'>('explorer');

  // Increment blocks simulated
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlock(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!isSimulatorOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getTxColor = (type: string) => {
    switch (type) {
      case 'Mint': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'List': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Buy': return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20';
      case 'Bid': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Cancel': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'End Auction': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  // Preset accounts to simulate
  const simulatedAccounts = [
    { name: 'Developer / Creator', address: '0x7a89e1C52Ea7f4dB67A20d04c8f5A621376dfabC', balance: '4.285', role: 'Default Creator' },
    { name: 'Collector Account', address: '0x98A1b2c3d4E5F6a7b8C9d0e1f2a3B4C5D6E7F8a9', balance: '12.440', role: 'Active Buyer' },
    { name: 'High Bidder Account', address: '0x4bCda654B6f849cc6b84eb921c5d9a187e1b5a2b', balance: '25.000', role: 'Auction Enthusiast' }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <div className="flex items-center space-x-2.5">
          <Terminal className="h-5 w-5 text-cyan-400" />
          <h3 className="text-md font-bold text-white font-rajdhani uppercase tracking-wider">CyberSpace Web3 Simulator</h3>
        </div>
        <button 
          onClick={() => setSimulatorOpen(false)}
          className="rounded-lg bg-zinc-900 p-1.5 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Network / Status banner */}
      <div className="bg-zinc-900/40 p-4 border-b border-zinc-800/60 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-zinc-500" />
          <span className="text-xs text-zinc-400">Current Block:</span>
          <span className="font-mono text-xs font-semibold text-white">{currentBlock}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-zinc-500" />
          <span className="text-xs text-zinc-400">Network:</span>
          <span className="text-xs font-bold text-cyan-400 uppercase">{network}</span>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950">
        {[
          { id: 'explorer', label: 'Block Explorer', icon: Terminal },
          { id: 'contracts', label: 'Smart Contracts', icon: FileCode },
          { id: 'faucet', label: 'Test Faucet', icon: Coins }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-semibold transition ${
                activeSubTab === tab.id 
                  ? 'border-b-2 border-cyan-400 bg-zinc-900/40 text-cyan-400' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/20'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeSubTab === 'explorer' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Transaction History</span>
              {transactions.length > 0 && (
                <button 
                  onClick={clearTransactions}
                  className="text-[10px] text-rose-400 hover:underline flex items-center"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center text-xs text-zinc-500">
                No local blockchain transactions captured. Interact with the application to mint, bid, list, or switch accounts!
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.hash} className="border border-zinc-800/80 bg-zinc-900/20 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTxColor(tx.type)}`}>
                        {tx.type}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-300">
                      {tx.type === 'Mint' && `Minted NFT "${tx.tokenName}" (#${tx.tokenId})`}
                      {tx.type === 'List' && `Listed NFT #${tx.tokenId} for ${tx.amount} MATIC`}
                      {tx.type === 'Buy' && `Bought NFT #${tx.tokenId} for ${tx.amount} MATIC`}
                      {tx.type === 'Bid' && `Placed bid of ${tx.amount} MATIC on NFT #${tx.tokenId}`}
                      {tx.type === 'Cancel' && `Canceled listing of NFT #${tx.tokenId}`}
                      {tx.type === 'End Auction' && `Finalized auction for NFT #${tx.tokenId} to winner`}
                      {tx.type === 'Network Switch' && `Switched active account / network`}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-900/60 text-[10px] text-zinc-500 font-mono">
                      <div>
                        <span>Hash: </span>
                        <span className="text-zinc-400 cursor-pointer hover:underline" onClick={() => handleCopy(tx.hash)}>
                          {tx.hash.substring(0, 10)}...{tx.hash.substring(58)}
                        </span>
                      </div>
                      <span className="text-emerald-500 flex items-center">
                        <Check className="h-3 w-3 mr-0.5" /> Deployed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick account switching support */}
            <div className="border border-zinc-800 bg-zinc-900/10 p-4 rounded-xl space-y-3 mt-4">
              <span className="text-xs font-bold text-white block">Multi-User Testing Simulator</span>
              <p className="text-[11px] text-zinc-500">
                Swap identities to simulate auction bids, creator royalties, or secondary marketplace listing purchase flows.
              </p>
              <div className="space-y-2">
                {simulatedAccounts.map((account) => {
                  const isCurrent = isConnected && walletAddress?.toLowerCase() === account.address.toLowerCase();
                  return (
                    <button
                      key={account.address}
                      onClick={() => connectWallet('simulated', account.address, parseFloat(account.balance))}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition ${
                        isCurrent 
                          ? 'border-cyan-500 bg-cyan-950/20 text-white' 
                          : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="text-xs font-bold">{account.name}</span>
                          <span className="text-[9px] text-zinc-500 bg-zinc-800 px-1 rounded">{account.role}</span>
                        </div>
                        <span className="text-[10px] font-mono mt-0.5 block">{formatAddress(account.address)}</span>
                      </div>
                      <span className="text-xs font-bold text-cyan-400">{account.balance} MATIC</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'contracts' && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Deployed Contract Addresses</span>
            
            <div className="space-y-3">
              {[
                { name: 'CyberNFT Contract (ERC721)', address: '0x2D731c65d64849646b402857a82bE0C2Ff14a065' },
                { name: 'CyberNFTMarketplace Contract', address: '0x9E72aD652a65dF89f31bc0C2Ff128c65d6484964' },
                { name: 'CyberNFTAuction Contract', address: '0x15fD6542Ff128c65d64849646b4028578C2aE09c' }
              ].map((c) => (
                <div key={c.address} className="border border-zinc-800 bg-zinc-900/20 p-3 rounded-xl">
                  <span className="text-xs font-bold text-white block">{c.name}</span>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-mono text-xs text-zinc-400">{c.address}</span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleCopy(c.address)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      >
                        {copiedText === c.address ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <a 
                        href={`https://amoy.polygonscan.com/address/${c.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-950/20 border border-amber-900/30 p-3.5 rounded-xl flex items-start space-x-2.5">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300">Contract Verification</span>
                <p className="text-[10px] text-amber-400/80 leading-relaxed">
                  All contracts have been compiled using Solidity 0.8.20 and optimized for gas with 200 runs. You can view the full source code in the <b>Smart Contracts</b> tab.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'faucet' && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Polygon Amoy Test Faucet</span>
            
            <div className="border border-zinc-800 bg-zinc-900/20 p-5 rounded-2xl text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <Coins className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Need Test MATIC?</h4>
                <p className="text-xs text-zinc-400">
                  Request mock tokens to pay gas fees and purchase NFTs. Get 5 MATIC instantly.
                </p>
              </div>

              {isConnected ? (
                <div className="space-y-3 pt-2">
                  <div className="text-xs text-zinc-400">
                    Wallet Target: <span className="font-mono text-zinc-300">{walletAddress}</span>
                  </div>
                  <button
                    onClick={() => addBalance(5)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:brightness-110 py-3 rounded-xl text-xs font-bold text-white transition shadow-lg shadow-cyan-500/20"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Claim 5.0 MATIC</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-rose-400 pt-2 font-medium">
                  Connect your wallet to use the test faucet.
                </div>
              )}
            </div>
            
            <div className="text-[11px] text-zinc-500 text-center leading-relaxed">
              *Disclaimer: Tokens received on the simulator are purely for demonstration and local sandbox persistence.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
