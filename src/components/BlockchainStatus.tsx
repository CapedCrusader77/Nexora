'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CHAIN_ID, EXPLORER_BASE_URL, getExplorerAddressUrl } from '../utils/constants';
import { Check, AlertCircle, Link2, Zap } from 'lucide-react';

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

/**
 * BlockchainStatus Component
 * Displays real-time blockchain status indicators
 */
export const BlockchainStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { address, isConnected } = useAccount();
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState<string | null>(null);

  useEffect(() => {
    // In production, fetch real block number and gas price
    // For now, show mock data
    setBlockNumber(Math.floor(Math.random() * 50000000 + 45000000));
    setGasPrice((Math.random() * 200 + 30).toFixed(1));
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Network Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-emerald-400 font-medium">Polygon Amoy</span>
      </div>

      {/* Connected Wallet */}
      {isConnected && address && (
        <a
          href={getExplorerAddressUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all"
          title={address}
        >
          <Check className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-blue-400 font-mono">{shortenAddress(address)}</span>
          <Link2 className="w-2.5 h-2.5 text-blue-400/60 ml-0.5" />
        </a>
      )}

      {/* Gas Price Indicator */}
      {gasPrice && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <Zap className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-orange-400 font-mono">{gasPrice} gwei</span>
        </div>
      )}

      {/* Contract Verification */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
        <Check className="w-3 h-3 text-cyan-400" />
        <span className="text-xs text-cyan-400 font-medium">Verified</span>
      </div>
    </div>
  );
};
