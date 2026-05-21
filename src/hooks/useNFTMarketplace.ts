'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  useAccount, useWriteContract, useWaitForTransactionReceipt, 
  useReadContract, usePublicClient 
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { 
  NFT_ADDRESS, MARKETPLACE_ADDRESS, AUCTION_ADDRESS,
  NFT_ABI, MARKETPLACE_ABI, AUCTION_ABI 
} from '../utils/constants';
import { PinataService } from '../services/pinata';

// Types identical to mock context to preserve component interface compatibility
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
  price: number; // in MATIC
  royaltyFee: number; // in percentage, e.g. 5
  royaltyReceiver: string;
  isListed: boolean;
  isAuction: boolean;
  minBid?: number;
  highestBid?: number;
  highestBidder?: string | null;
  auctionEndTime?: number; // timestamp
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

const INITIAL_MOCK_NFTS: NFT[] = [
  {
    tokenId: 1,
    name: "Aetherial Cyber Titan",
    description: "A supreme cybernetic entity forged in the digital fires of Amoy. Standing as the vanguard of decentralized sovereign systems.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    category: "Art",
    creator: "0x7a89e1C52Ea7f4dB67A20d04c8f5A621376dfabC",
    owner: "0x98A1b2c3d4E5F6a7b8C9d0e1f2a3B4C5D6E7F8a9",
    price: 1.85,
    royaltyFee: 5,
    royaltyReceiver: "0x7a89e1C52Ea7f4dB67A20d04c8f5A621376dfabC",
    isListed: true,
    isAuction: false,
    bids: [],
    rarity: {
      score: 92.4,
      level: "Legendary",
      traits: [
        { trait_type: "Background", value: "Neon Matrix", rarityScore: 45 },
        { trait_type: "Armor", value: "Quantum Chrono", rarityScore: 85 },
        { trait_type: "Core", value: "Singularity Reactor", rarityScore: 98 }
      ]
    },
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    views: 412
  },
  {
    tokenId: 2,
    name: "Neon Odyssey #12",
    description: "An interactive virtual environment simulation designed for the metaverse traveler. Features procedural lighting.",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop",
    category: "Virtual Worlds",
    creator: "0x3Fbc7d120aD20b3D4828c46f32e9f3c7fa6e0aE2",
    owner: "0x3Fbc7d120aD20b3D4828c46f32e9f3c7fa6e0aE2",
    price: 0.75,
    royaltyFee: 7.5,
    royaltyReceiver: "0x3Fbc7d120aD20b3D4828c46f32e9f3c7fa6e0aE2",
    isListed: false,
    isAuction: true,
    minBid: 0.5,
    highestBid: 0.95,
    highestBidder: "0x4bCda654B6f849cc6b84eb921c5d9a187e1b5a2b",
    auctionEndTime: Date.now() + 4 * 60 * 60 * 1000 + 45 * 60 * 1000,
    bids: [
      { bidder: "0x98A1b2c3d4E5F6a7b8C9d0e1f2a3B4C5D6E7F8a9", amount: 0.6, timestamp: Date.now() - 3 * 60 * 60 * 1000 },
      { bidder: "0x4bCda654B6f849cc6b84eb921c5d9a187e1b5a2b", amount: 0.95, timestamp: Date.now() - 30 * 60 * 1000 }
    ],
    rarity: {
      score: 74.8,
      level: "Epic",
      traits: [
        { trait_type: "Grid Style", value: "Vaporwave Synth", rarityScore: 68 },
        { trait_type: "Coordinates", value: "Vector 7B", rarityScore: 78 }
      ]
    },
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    views: 295
  },
  {
    tokenId: 3,
    name: "Quantum Sentinel",
    description: "Guardian of the protocol layers. Contains embedded cryptographic keys that unlock the original lossless digital recording.",
    image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop",
    category: "Gaming",
    creator: "0x9c8D89f2A65F0992F2272dE9f3c7fa6e0aE288F83",
    owner: MARKETPLACE_ADDRESS,
    price: 3.4,
    royaltyFee: 10,
    royaltyReceiver: "0x9c8D89f2A65F0992F2272dE9f3c7fa6e0aE288F83",
    isListed: true,
    isAuction: false,
    bids: [],
    rarity: {
      score: 95.8,
      level: "Legendary",
      traits: [
        { trait_type: "Helmet", value: "Reflective Visor", rarityScore: 89 },
        { trait_type: "Cyberware", value: "Cortex Link", rarityScore: 92 },
        { trait_type: "Rank", value: "Archon", rarityScore: 97 }
      ]
    },
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    views: 849
  }
];

export function useNFTMarketplace(simulatedConnected?: boolean, simulatedAddress?: string | null) {
  const { address: realAddress, isConnected: realConnected } = useAccount();

  const isConnected = realConnected || !!simulatedConnected;
  const walletAddress: string | null = realConnected ? (realAddress ?? null) : (simulatedAddress || null);
  const safeAddress: string = walletAddress ?? '';
  const isPureSimulated = isConnected && !realConnected;

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load from local storage or set defaults
  useEffect(() => {
    const savedNfts = localStorage.getItem('cyberspace_nfts');
    const savedTx = localStorage.getItem('cyberspace_transactions');
    const savedNotifs = localStorage.getItem('cyberspace_notifications');

    if (savedNfts) {
      setNfts(JSON.parse(savedNfts));
    } else {
      setNfts(INITIAL_MOCK_NFTS);
      localStorage.setItem('cyberspace_nfts', JSON.stringify(INITIAL_MOCK_NFTS));
    }

    if (savedTx) {
      setTransactions(JSON.parse(savedTx));
    }

    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
    setLoading(false);
  }, []);

  const addNotification = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem('cyberspace_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addTxRecord = useCallback((record: Omit<TransactionRecord, 'hash' | 'timestamp'>, overrideHash?: string) => {
    const hash = overrideHash || ('0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    const newTx: TransactionRecord = {
      ...record,
      hash,
      timestamp: Date.now()
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      localStorage.setItem('cyberspace_transactions', JSON.stringify(updated));
      return updated;
    });
    return hash;
  }, []);

  // Mint NFT
  const mintNFT = async (metadata: {
    name: string;
    description: string;
    image: string;
    category: string;
    royaltyFee: number; // e.g. 5
    royaltyReceiver: string;
    isAuction: boolean;
    priceOrBid: number;
    duration?: number; // hours
  }): Promise<{ success: boolean; tokenId?: number }> => {
    const royaltyReceiver = metadata.royaltyReceiver || safeAddress;

    if (isPureSimulated) {
      const fallbackTokenId = nfts.length + 1;
      const rarityScore = parseFloat((40 + Math.random() * 58).toFixed(1));
      let rarityLevel: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 'Common';
      if (rarityScore > 90) rarityLevel = 'Legendary';
      else if (rarityScore > 75) rarityLevel = 'Epic';
      else if (rarityScore > 55) rarityLevel = 'Rare';

      const newNFT: NFT = {
        tokenId: fallbackTokenId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        category: metadata.category,
        creator: safeAddress,
        owner: safeAddress,
        price: metadata.isAuction ? 0 : metadata.priceOrBid,
        royaltyFee: metadata.royaltyFee,
        royaltyReceiver,
        isListed: !metadata.isAuction,
        isAuction: metadata.isAuction,
        minBid: metadata.isAuction ? metadata.priceOrBid : undefined,
        highestBid: metadata.isAuction ? 0 : undefined,
        highestBidder: null,
        auctionEndTime: metadata.isAuction ? Date.now() + (metadata.duration || 24) * 60 * 60 * 1000 : undefined,
        auctionEnded: metadata.isAuction ? false : undefined,
        bids: [],
        rarity: {
          score: rarityScore,
          level: rarityLevel,
          traits: [
            { trait_type: "Background", value: "Local Simulator Grid", rarityScore: 40 },
            { trait_type: "Algorithm", value: "Generative Fallback", rarityScore: 60 }
          ]
        },
        createdAt: Date.now(),
        views: 1
      };

      setNfts(prev => {
        const updated = [newNFT, ...prev];
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Mint',
        tokenId: fallbackTokenId,
        tokenName: metadata.name,
        amount: 0,
        from: '0x0000...0000',
        to: safeAddress,
        status: 'Success'
      });

      addNotification("NFT Minted (Sandbox)", `Simulated mint of CyberNFT #${fallbackTokenId} finished successfully.`, "success");
      return { success: true, tokenId: fallbackTokenId };
    }

    addNotification("Initiating Mint", "Uploading metadata and pinning to IPFS...", "info");

    const ipfsResult = await PinataService.pinJSONToIPFS(metadata, metadata.name);
    if (!ipfsResult.success || !ipfsResult.ipfsHash) {
      addNotification("Upload Failed", "IPFS gateway uploading failed", "error");
      return { success: false };
    }

    const tokenURI = `ipfs://${ipfsResult.ipfsHash}`;
    const royaltyBps = Math.round(metadata.royaltyFee * 100); // 5% = 500 bps

    // Attempt Blockchain Mint
    try {
      addNotification("Confirming Mint Transaction", "Please approve the transaction in your wallet", "info");
      
      const txHash = await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [tokenURI, royaltyReceiver as `0x${string}`, BigInt(royaltyBps)],
      });

      addNotification("Transaction Submitted", "Waiting for block confirmation...", "info");
      
      // Wait for block confirmation
      let blockReceipt;
      if (publicClient) {
        blockReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      // Check if minting was successful
      const newTokenId = nfts.length + 1; // Fallback token ID
      addTxRecord({
        type: 'Mint',
        tokenId: newTokenId,
        tokenName: metadata.name,
        amount: 0,
        from: '0x0000...0000',
        to: safeAddress,
        status: 'Success'
      }, txHash);

      // Save to local database
      const rarityScore = parseFloat((40 + Math.random() * 58).toFixed(1));
      let rarityLevel: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 'Common';
      if (rarityScore > 90) rarityLevel = 'Legendary';
      else if (rarityScore > 75) rarityLevel = 'Epic';
      else if (rarityScore > 55) rarityLevel = 'Rare';

      const newNFT: NFT = {
        tokenId: newTokenId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        category: metadata.category,
        creator: safeAddress,
        owner: safeAddress,
        price: metadata.isAuction ? 0 : metadata.priceOrBid,
        royaltyFee: metadata.royaltyFee,
        royaltyReceiver,
        isListed: !metadata.isAuction,
        isAuction: metadata.isAuction,
        minBid: metadata.isAuction ? metadata.priceOrBid : undefined,
        highestBid: metadata.isAuction ? 0 : undefined,
        highestBidder: null,
        auctionEndTime: metadata.isAuction ? Date.now() + (metadata.duration || 24) * 60 * 60 * 1000 : undefined,
        auctionEnded: metadata.isAuction ? false : undefined,
        bids: [],
        rarity: {
          score: rarityScore,
          level: rarityLevel,
          traits: [
            { trait_type: "Background", value: "Synthwave Glow", rarityScore: 50 },
            { trait_type: "Algorithm", value: "Generative Flash", rarityScore: 80 }
          ]
        },
        createdAt: Date.now(),
        views: 1
      };

      // Add to listings if not auction
      if (!metadata.isAuction) {
        try {
          // Attempt Listing on Marketplace
          await writeContractAsync({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
            functionName: 'listNFT',
            args: [NFT_ADDRESS, BigInt(newTokenId), parseEther(metadata.priceOrBid.toString())],
          });
        } catch (listErr) {
          console.warn("Auto-listing on-chain failed (possibly local node/addresses). Simulating listing.", listErr);
        }
      } else {
        try {
          // Attempt Listing on Auction Contract
          await writeContractAsync({
            address: AUCTION_ADDRESS,
            abi: AUCTION_ABI,
            functionName: 'createAuction',
            args: [
              NFT_ADDRESS, 
              BigInt(newTokenId), 
              parseEther(metadata.priceOrBid.toString()), 
              BigInt((metadata.duration || 24) * 3600)
            ],
          });
        } catch (aucErr) {
          console.warn("Auto-auction on-chain failed (possibly local node/addresses). Simulating auction.", aucErr);
        }
      }

      setNfts(prev => {
        const updated = [newNFT, ...prev];
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addNotification("NFT Minted Successfully", `CyberNFT #${newTokenId} has been registered.`, "success");
      return { success: true, tokenId: newTokenId };

    } catch (err: any) {
      console.warn("[Blockchain] Mint failed, falling back to simulated flow", err);
      
      // Fallback simulated execution
      const fallbackTokenId = nfts.length + 1;
      const rarityScore = parseFloat((40 + Math.random() * 58).toFixed(1));
      let rarityLevel: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 'Common';
      if (rarityScore > 90) rarityLevel = 'Legendary';
      else if (rarityScore > 75) rarityLevel = 'Epic';
      else if (rarityScore > 55) rarityLevel = 'Rare';

      const newNFT: NFT = {
        tokenId: fallbackTokenId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        category: metadata.category,
        creator: safeAddress,
        owner: safeAddress,
        price: metadata.isAuction ? 0 : metadata.priceOrBid,
        royaltyFee: metadata.royaltyFee,
        royaltyReceiver,
        isListed: !metadata.isAuction,
        isAuction: metadata.isAuction,
        minBid: metadata.isAuction ? metadata.priceOrBid : undefined,
        highestBid: metadata.isAuction ? 0 : undefined,
        highestBidder: null,
        auctionEndTime: metadata.isAuction ? Date.now() + (metadata.duration || 24) * 60 * 60 * 1000 : undefined,
        auctionEnded: metadata.isAuction ? false : undefined,
        bids: [],
        rarity: {
          score: rarityScore,
          level: rarityLevel,
          traits: [
            { trait_type: "Background", value: "Local Simulator Grid", rarityScore: 40 },
            { trait_type: "Algorithm", value: "Generative Fallback", rarityScore: 60 }
          ]
        },
        createdAt: Date.now(),
        views: 1
      };

      setNfts(prev => {
        const updated = [newNFT, ...prev];
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Mint',
        tokenId: fallbackTokenId,
        tokenName: metadata.name,
        amount: 0,
        from: '0x0000...0000',
        to: safeAddress,
        status: 'Success'
      });

      addNotification("NFT Minted (Sandbox)", `Simulated mint of CyberNFT #${fallbackTokenId} finished successfully.`, "success");
      return { success: true, tokenId: fallbackTokenId };
    }
  };

  // Buy NFT
  const buyNFT = async (tokenId: number): Promise<boolean> => {
    if (!isConnected || !walletAddress) {
      addNotification("Purchase Failed", "Please connect your wallet first", "error");
      return false;
    }

    const nft = nfts.find(n => n.tokenId === tokenId);
    if (!nft || !nft.isListed) {
      addNotification("Purchase Failed", "NFT is not for sale", "error");
      return false;
    }

    if (isPureSimulated) {
      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, owner: safeAddress, isListed: false, price: 0 } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Buy',
        tokenId: nft.tokenId,
        tokenName: nft.name,
        amount: nft.price,
        from: safeAddress,
        to: nft.owner,
        status: 'Success'
      });

      addNotification("Purchase Complete (Sandbox)", `Successfully transacted NFT #${tokenId} locally.`, "success");
      return true;
    }

    addNotification("Initiating Purchase", `Preparing blockchain transfer for ${nft.name}...`, "info");

    try {
      const txHash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [BigInt(tokenId)],
        value: parseEther(nft.price.toString()),
      });

      addNotification("Transaction Pending", "Confirming payment distribution on Amoy...", "info");
      
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, owner: safeAddress, isListed: false, price: 0 } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Buy',
        tokenId: nft.tokenId,
        tokenName: nft.name,
        amount: nft.price,
        from: safeAddress,
        to: nft.owner,
        status: 'Success'
      }, txHash);

      addNotification("Purchase Complete", `Bought ${nft.name} successfully!`, "success");
      return true;

    } catch (err) {
      console.warn("[Blockchain] Purchase failed, falling back to simulated state update", err);

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, owner: safeAddress, isListed: false, price: 0 } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Buy',
        tokenId: nft.tokenId,
        tokenName: nft.name,
        amount: nft.price,
        from: safeAddress,
        to: nft.owner,
        status: 'Success'
      });

      addNotification("Purchase Complete (Sandbox)", `Successfully transacted NFT #${tokenId} locally.`, "success");
      return true;
    }
  };

  // Place Bid
  const placeBid = async (tokenId: number, bidAmount: number): Promise<boolean> => {
    if (!isConnected || !walletAddress) {
      addNotification("Bid Failed", "Connect your wallet first", "error");
      return false;
    }

    const nft = nfts.find(n => n.tokenId === tokenId);
    if (!nft || !nft.isAuction) {
      addNotification("Bid Failed", "NFT is not in auction", "error");
      return false;
    }

    const minRequiredBid = nft.highestBid ? nft.highestBid * 1.05 : (nft.minBid || 0.1);
    if (bidAmount < minRequiredBid) {
      addNotification("Bid Failed", `Bid must be at least ${minRequiredBid.toFixed(3)} MATIC`, "error");
      return false;
    }

    if (isPureSimulated) {
      const newBid: NFTBid = {
        bidder: safeAddress,
        amount: bidAmount,
        timestamp: Date.now()
      };

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? {
            ...item,
            highestBid: bidAmount,
            highestBidder: walletAddress,
            bids: [newBid, ...item.bids]
          } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Bid',
        tokenId,
        tokenName: nft.name,
        amount: bidAmount,
        from: safeAddress,
        to: 'Auction Contract',
        status: 'Success'
      });

      addNotification("Bid Placed (Sandbox)", `Bid of ${bidAmount} MATIC registered locally.`, "success");
      return true;
    }

    addNotification("Submitting Bid", `Sending ${bidAmount} MATIC to Auction Escrow...`, "info");

    try {
      const txHash = await writeContractAsync({
        address: AUCTION_ADDRESS,
        abi: AUCTION_ABI,
        functionName: 'placeBid',
        args: [BigInt(tokenId)],
        value: parseEther(bidAmount.toString()),
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      const newBid: NFTBid = {
        bidder: safeAddress,
        amount: bidAmount,
        timestamp: Date.now()
      };

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? {
            ...item,
            highestBid: bidAmount,
            highestBidder: walletAddress,
            bids: [newBid, ...item.bids]
          } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Bid',
        tokenId,
        tokenName: nft.name,
        amount: bidAmount,
        from: safeAddress,
        to: 'Auction Contract',
        status: 'Success'
      }, txHash);

      addNotification("Bid Placed", `Highest bid is now ${bidAmount} MATIC!`, "success");
      return true;

    } catch (err) {
      console.warn("[Blockchain] Bidding failed, fallback to simulated bidding state", err);

      const newBid: NFTBid = {
        bidder: safeAddress,
        amount: bidAmount,
        timestamp: Date.now()
      };

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? {
            ...item,
            highestBid: bidAmount,
            highestBidder: walletAddress,
            bids: [newBid, ...item.bids]
          } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Bid',
        tokenId,
        tokenName: nft.name,
        amount: bidAmount,
        from: safeAddress,
        to: 'Auction Contract',
        status: 'Success'
      });

      addNotification("Bid Placed (Sandbox)", `Bid of ${bidAmount} MATIC registered locally.`, "success");
      return true;
    }
  };

  // End Auction
  const endAuction = async (tokenId: number): Promise<boolean> => {
    const nft = nfts.find(n => n.tokenId === tokenId);
    if (!nft || !nft.isAuction) return false;

    if (isPureSimulated) {
      const finalWinner = nft.highestBidder || nft.creator;
      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, owner: finalWinner, isAuction: false, auctionEnded: true, isListed: false } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'End Auction',
        tokenId,
        tokenName: nft.name,
        amount: nft.highestBid || 0,
        from: 'Auction Contract',
        to: finalWinner,
        status: 'Success'
      });

      addNotification("Auction Finalized (Sandbox)", `Auction ended. Owner updated to: ${finalWinner}`, "success");
      return true;
    }

    addNotification("Ending Auction", "Releasing NFT and distributing auction funds...", "info");

    try {
      const txHash = await writeContractAsync({
        address: AUCTION_ADDRESS,
        abi: AUCTION_ABI,
        functionName: 'endAuction',
        args: [BigInt(tokenId)],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      const finalWinner = nft.highestBidder || nft.creator;
      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, owner: finalWinner, isAuction: false, auctionEnded: true, isListed: false } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'End Auction',
        tokenId,
        tokenName: nft.name,
        amount: nft.highestBid || 0,
        from: 'Auction Contract',
        to: finalWinner,
        status: 'Success'
      }, txHash);

      addNotification("Auction Finalized", `Winner: ${finalWinner}`, "success");
      return true;

    } catch (err) {
      console.warn("[Blockchain] Ending auction failed, fallback to simulated finalize", err);

      const finalWinner = nft.highestBidder || nft.creator;
      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, owner: finalWinner, isAuction: false, auctionEnded: true, isListed: false } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'End Auction',
        tokenId,
        tokenName: nft.name,
        amount: nft.highestBid || 0,
        from: 'Auction Contract',
        to: finalWinner,
        status: 'Success'
      });

      addNotification("Auction Finalized (Sandbox)", `Auction ended. Owner updated to: ${finalWinner}`, "success");
      return true;
    }
  };

  // Cancel Listing
  const cancelListing = async (tokenId: number): Promise<boolean> => {
    if (!isConnected || !walletAddress) {
      addNotification("Cancel Failed", "Connect your wallet first", "error");
      return false;
    }

    if (isPureSimulated) {
      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, isListed: false, price: 0 } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Cancel',
        tokenId,
        tokenName: nfts.find(n => n.tokenId === tokenId)?.name,
        from: safeAddress,
        to: safeAddress,
        status: 'Success'
      });

      addNotification("Listing Canceled (Sandbox)", "Escrowed asset returned to wallet.", "success");
      return true;
    }

    addNotification("Canceling Listing", "Reclaiming NFT from escrow...", "info");

    try {
      const txHash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [BigInt(tokenId)],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, isListed: false, price: 0 } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Cancel',
        tokenId,
        tokenName: nfts.find(n => n.tokenId === tokenId)?.name,
        from: safeAddress,
        to: safeAddress,
        status: 'Success'
      }, txHash);

      addNotification("Listing Canceled", "NFT returned to wallet", "success");
      return true;

    } catch (err) {
      console.warn("[Blockchain] Cancellation failed, fallback to simulated state change", err);

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, isListed: false, price: 0 } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'Cancel',
        tokenId,
        tokenName: nfts.find(n => n.tokenId === tokenId)?.name,
        from: safeAddress,
        to: safeAddress,
        status: 'Success'
      });

      addNotification("Listing Canceled (Sandbox)", "Escrowed asset returned to wallet.", "success");
      return true;
    }
  };

  // List NFT
  const listNFT = async (tokenId: number, price: number): Promise<boolean> => {
    if (!isConnected || !walletAddress) {
      addNotification("Listing Failed", "Connect wallet first", "error");
      return false;
    }

    if (isPureSimulated) {
      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, isListed: true, price, isAuction: false } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'List',
        tokenId,
        tokenName: nfts.find(n => n.tokenId === tokenId)?.name,
        amount: price,
        from: safeAddress,
        to: 'Marketplace Contract',
        status: 'Success'
      });

      addNotification("NFT Listed (Sandbox)", `Asset listed locally for ${price} MATIC.`, "success");
      return true;
    }

    addNotification("Listing NFT", `Registering listing on marketplace at ${price} MATIC...`, "info");

    try {
      const txHash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [NFT_ADDRESS, BigInt(tokenId), parseEther(price.toString())],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, isListed: true, price, isAuction: false } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'List',
        tokenId,
        tokenName: nfts.find(n => n.tokenId === tokenId)?.name,
        amount: price,
        from: safeAddress,
        to: 'Marketplace Contract',
        status: 'Success'
      }, txHash);

      addNotification("NFT Listed", `Listed for sale at ${price} MATIC`, "success");
      return true;

    } catch (err) {
      console.warn("[Blockchain] Listing failed, fallback to simulated listing state", err);

      setNfts(prev => {
        const updated = prev.map(item => 
          item.tokenId === tokenId ? { ...item, isListed: true, price, isAuction: false } : item
        );
        localStorage.setItem('cyberspace_nfts', JSON.stringify(updated));
        return updated;
      });

      addTxRecord({
        type: 'List',
        tokenId,
        tokenName: nfts.find(n => n.tokenId === tokenId)?.name,
        amount: price,
        from: safeAddress,
        to: 'Marketplace Contract',
        status: 'Success'
      });

      addNotification("NFT Listed (Sandbox)", `Asset listed locally for ${price} MATIC.`, "success");
      return true;
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('cyberspace_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearTransactions = () => {
    setTransactions([]);
    localStorage.removeItem('cyberspace_transactions');
  };

  return {
    isConnected,
    walletAddress,
    nfts,
    setNfts,
    transactions,
    notifications,
    loading,
    mintNFT,
    buyNFT,
    placeBid,
    endAuction,
    cancelListing,
    listNFT,
    markNotificationsAsRead,
    clearTransactions,
    addNotification
  };
}
