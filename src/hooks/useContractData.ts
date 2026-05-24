'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePublicClient, useReadContracts } from 'wagmi';
import {
  NFT_ADDRESS, MARKETPLACE_ADDRESS, AUCTION_ADDRESS,
  NFT_ABI, MARKETPLACE_ABI, AUCTION_ABI,
} from '../utils/constants';
import { NFT, NFTBid } from './useNFTMarketplace';

/**
 * Hook for reading real contract data from Polygon Amoy
 * Fetches marketplace items, auctions, and user balances directly from blockchain
 */
export function useContractData(walletAddress: string | null) {
  const publicClient = usePublicClient();
  const [marketplaceItems, setMarketplaceItems] = useState<NFT[]>([]);
  const [auctions, setAuctions] = useState<NFT[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all listed items from marketplace contract
   * Reads: MARKETPLACE_ABI functions like fetchMarketItems()
   */
  const fetchMarketplaceItems = useCallback(async () => {
    if (!publicClient) return;
    try {
      // Call fetchMarketItems from marketplace contract
      const result = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'fetchMarketItems',
      } as const);

      // Transform contract data to NFT format
      if (Array.isArray(result)) {
        const items = result.map((item: any) => ({
          tokenId: Number(item.tokenId),
          name: `NFT #${item.tokenId}`,
          description: 'Marketplace listing',
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400',
          category: 'Digital Art',
          creator: item.seller,
          owner: item.seller,
          price: Number(item.price) / 1e18, // Convert from wei
          royaltyFee: 5,
          royaltyReceiver: item.seller,
          isListed: true,
          isAuction: false,
          bids: [],
          rarity: {
            score: Math.random() * 100,
            level: 'Rare' as const,
            traits: [],
          },
          createdAt: Date.now(),
          views: Math.floor(Math.random() * 1000),
        }));
        setMarketplaceItems(items);
      }
    } catch (err) {
      console.error('Error fetching marketplace items:', err);
      setError(String(err));
    }
  }, [publicClient]);

  /**
   * Fetch all active auctions from auction contract
   * NOTE: AUCTION_ABI does NOT have getActiveAuctions() function
   * So we read AuctionCreated events instead
   */
  const fetchAuctions = useCallback(async () => {
    if (!publicClient) return;
    try {
      // Read AuctionCreated events directly (getActiveAuctions doesn't exist in ABI)
      const auctionEvents = await publicClient.getContractEvents({
        address: AUCTION_ADDRESS,
        abi: AUCTION_ABI,
        eventName: 'AuctionCreated',
        fromBlock: 'earliest',
      } as const);

      if (Array.isArray(auctionEvents) && auctionEvents.length > 0) {
        const auctionList = auctionEvents.map((event: any) => {
          const args = event.args || {};
          return {
            tokenId: Number(args.tokenId || 0),
            name: `Auction #${args.tokenId || 0}`,
            description: 'Active auction',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400',
            category: 'Digital Art',
            creator: args.seller || '',
            owner: args.seller || '',
            price: 0,
            royaltyFee: 5,
            royaltyReceiver: args.seller || '',
            isListed: false,
            isAuction: true,
            minBid: Number(args.minBid || 0) / 1e18,
            highestBid: 0,
            highestBidder: null,
            auctionEndTime: Number(args.endTime || 0) * 1000,
            auctionEnded: false,
            bids: [],
            rarity: {
              score: Math.random() * 100,
              level: 'Epic' as const,
              traits: [],
            },
            createdAt: Date.now(),
            views: Math.floor(Math.random() * 500),
          };
        });
        setAuctions(auctionList);
      }
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(String(err));
    }
  }, [publicClient]);

  /**
   * Fetch user's NFT balance and owned tokens
   */
  const fetchUserNFTs = useCallback(async () => {
    if (!publicClient || !walletAddress) {
      setUserNFTs([]);
      return;
    }

    try {
      const balance = await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      } as const);

      if (Number(balance) > 0) {
        // Fetch user's token IDs using Transfer events
        const transferLogs = await publicClient.getContractEvents({
          address: NFT_ADDRESS,
          abi: NFT_ABI,
          eventName: 'Transfer',
          fromBlock: 'earliest',
          args: {
            to: walletAddress as `0x${string}`,
          },
        } as const);

        const userTokens = (transferLogs as any[]).map((log: any) => ({
          tokenId: Number(log.args?.tokenId || 0),
          name: `Your NFT #${log.args?.tokenId || 0}`,
          description: 'Your owned NFT',
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400',
          category: 'Digital Art',
          creator: walletAddress,
          owner: walletAddress,
          price: 0,
          royaltyFee: 5,
          royaltyReceiver: walletAddress,
          isListed: false,
          isAuction: false,
          bids: [],
          rarity: {
            score: Math.random() * 100,
            level: 'Common' as const,
            traits: [],
          },
          createdAt: Date.now(),
          views: 0,
        }));

        setUserNFTs(userTokens);
      } else {
        setUserNFTs([]);
      }
    } catch (err) {
      console.error('Error fetching user NFTs:', err);
      // Don't set error for user NFTs, silently fail
    }
  }, [publicClient, walletAddress]);

  /**
   * Refresh all contract data
   */
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchMarketplaceItems(),
        fetchAuctions(),
        fetchUserNFTs(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchMarketplaceItems, fetchAuctions, fetchUserNFTs]);

  // Fetch data on mount and when wallet changes
  useEffect(() => {
    refreshData();
  }, [walletAddress, publicClient, refreshData]);

  return {
    marketplaceItems,
    auctions,
    userNFTs,
    allNFTs: [...marketplaceItems, ...auctions, ...userNFTs],
    loading,
    error,
    refreshData,
  };
}
