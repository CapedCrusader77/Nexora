'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useBalance, useDisconnect, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { useNFTMarketplace } from '../hooks/useNFTMarketplace';

// Export all structural types to maintain complete component compatibility
export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'simulated';
export type NetworkType = 'polygon-amoy' | 'ethereum-mainnet' | 'arbitrum' | 'optimism';

export interface NFTBid {
  bidder: string;
  amount: number;
  timestamp: number;
}

export interface NFTRarity {
  score: number;
  level: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  traits: Array<{ trait_type: string; value: string; rarityScore: number }>;
}

export interface NFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  category: string;
  creator: string;
  owner: string;
  price: number;
  royaltyFee: number;
  royaltyReceiver: string;
  isListed: boolean;
  isAuction: boolean;
  minBid?: number;
  highestBid?: number;
  highestBidder?: string | null;
  auctionEndTime?: number;
  auctionEnded?: boolean;
  bids: NFTBid[];
  rarity: NFTRarity;
  createdAt: number;
  views: number;
}

export interface TransactionRecord {
  hash: string;
  type: 'Mint' | 'List' | 'Buy' | 'Bid' | 'Cancel' | 'End Auction' | 'Network Switch';
  tokenId?: number;
  tokenName?: string;
  amount?: number;
  from: string;
  to: string;
  timestamp: number;
  status: 'Pending' | 'Success' | 'Failed';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

interface Web3ContextType {
  isConnected: boolean;
  walletAddress: string | null;
  walletType: WalletType | null;
  balance: number;
  network: NetworkType;
  nfts: NFT[];
  transactions: TransactionRecord[];
  notifications: AppNotification[];
  isSimulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;
  connectWallet: (type: WalletType, address?: string, balance?: number) => Promise<boolean>;
  disconnectWallet: () => void;
  switchNetwork: (net: NetworkType) => Promise<void>;
  mintNFT: (metadata: {
    name: string;
    description: string;
    image: string;
    category: string;
    royaltyFee: number;
    royaltyReceiver: string;
    isAuction: boolean;
    priceOrBid: number;
    duration?: number;
  }) => Promise<{ success: boolean; tokenId?: number }>;
  buyNFT: (tokenId: number) => Promise<boolean>;
  listNFT: (tokenId: number, price: number) => Promise<boolean>;
  cancelListing: (tokenId: number) => Promise<boolean>;
  placeBid: (tokenId: number, bidAmount: number) => Promise<boolean>;
  endAuction: (tokenId: number) => Promise<boolean>;
  addBalance: (amount: number) => void;
  clearTransactions: () => void;
  markNotificationsAsRead: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const [simulatedAddress, setSimulatedAddress] = useState<string | null>(null);
  const [simulatedBalance, setSimulatedBalance] = useState<number>(100.0);
  const [isSimulatorOpen, setSimulatorOpen] = useState(false);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  
  const isSimulatedConnected = walletType === 'simulated' && !!simulatedAddress;
  const marketplace = useNFTMarketplace(isSimulatedConnected, simulatedAddress);

  // Retrieve real wallet balance natively from Polygon Amoy
  const { data: balanceData } = useBalance({
    address: address,
  });

  const balance = walletType === 'simulated' 
    ? simulatedBalance 
    : (balanceData ? parseFloat(balanceData.formatted) : 100.0);

  useEffect(() => {
    if (isConnected) {
      setWalletType('metamask');
      setSimulatedAddress(null);
    } else if (walletType !== 'simulated') {
      setWalletType(null);
      setSimulatedAddress(null);
    }
  }, [isConnected]);

  const [network, setNetwork] = useState<NetworkType>('polygon-amoy');

  const switchNetwork = async (net: NetworkType) => {
    if (net === 'polygon-amoy') {
      try {
        switchChain({ chainId: polygonAmoy.id });
        setNetwork('polygon-amoy');
      } catch (err) {
        console.warn("Chain switch error:", err);
      }
    } else {
      setNetwork(net);
    }
  };

  const connectWallet = async (type: WalletType, address?: string, initialBalance?: number): Promise<boolean> => {
    setWalletType(type);
    if (type === 'simulated' && address) {
      setSimulatedAddress(address);
      if (initialBalance !== undefined) {
        setSimulatedBalance(initialBalance);
      }
    }
    return true;
  };

  const disconnectWallet = () => {
    disconnect();
    setWalletType(null);
    setSimulatedAddress(null);
  };

  const addBalance = (amount: number) => {
    if (walletType === 'simulated') {
      setSimulatedBalance(prev => prev + amount);
    } else {
      console.log("[Sandbox] Simulated adding balance:", amount);
    }
  };

  return (
    <Web3Context.Provider value={{
      isConnected: marketplace.isConnected,
      walletAddress: marketplace.walletAddress,
      walletType,
      balance,
      network,
      nfts: marketplace.nfts,
      transactions: marketplace.transactions,
      notifications: marketplace.notifications,
      isSimulatorOpen,
      setSimulatorOpen,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      mintNFT: marketplace.mintNFT,
      buyNFT: marketplace.buyNFT,
      listNFT: marketplace.listNFT,
      cancelListing: marketplace.cancelListing,
      placeBid: marketplace.placeBid,
      endAuction: marketplace.endAuction,
      addBalance,
      clearTransactions: marketplace.clearTransactions,
      markNotificationsAsRead: marketplace.markNotificationsAsRead
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
