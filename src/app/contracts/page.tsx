'use client';

import React, { useState } from 'react';
import { 
  FileCode, 
  Terminal, 
  Play, 
  CheckCircle, 
  Info,
  Copy,
  Check,
  Cpu
} from 'lucide-react';

export default function ContractsPage() {
  const [activeFile, setActiveFile] = useState<'nft' | 'marketplace' | 'auction' | 'hardhat' | 'deploy' | 'test'>('nft');
  const [compiled, setCompiled] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCompile = () => {
    setCompiling(true);
    setTimeout(() => {
      setCompiling(false);
      setCompiled(true);
    }, 1800);
  };

  const files = {
    nft: {
      name: 'CyberNFT.sol',
      lang: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CyberNFT
 * @notice Standard ERC721 NFT contract with royalty support (ERC2981)
 */
contract CyberNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId;
    address public marketplaceAddress;

    error URIEmpty();
    error RoyaltyFeeTooHigh();

    event NFTMinted(
        uint256 indexed tokenId, 
        string tokenURI, 
        address indexed creator, 
        address indexed royaltyReceiver, 
        uint96 royaltyFeeBps
    );

    constructor(address _marketplaceAddress) 
        ERC721("CyberSpace NFT", "CYBER") 
        Ownable(msg.sender) 
    {
        marketplaceAddress = _marketplaceAddress;
        _setDefaultRoyalty(msg.sender, 500);
    }

    function mint(
        string memory tokenURI, 
        address royaltyReceiver, 
        uint96 royaltyFeeBps
    ) public returns (uint256) {
        if (bytes(tokenURI).length == 0) revert URIEmpty();
        if (royaltyFeeBps > 2000) revert RoyaltyFeeTooHigh(); // max 20%

        _nextTokenId++;
        uint256 newItemId = _nextTokenId;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        if (royaltyReceiver != address(0) && royaltyFeeBps > 0) {
            _setTokenRoyalty(newItemId, royaltyReceiver, royaltyFeeBps);
        }

        approve(marketplaceAddress, newItemId);
        emit NFTMinted(newItemId, tokenURI, msg.sender, royaltyReceiver, royaltyFeeBps);
        
        return newItemId;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`
    },
    marketplace: {
      name: 'CyberNFTMarketplace.sol',
      lang: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title CyberNFTMarketplace
 * @notice Trustless marketplace for listing and purchasing ERC721 NFTs with royalty compliance
 */
contract CyberNFTMarketplace is ReentrancyGuard, Ownable {
    
    struct Listing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool isSold;
        bool isActive;
    }

    uint256 private _listingIds;
    uint256 private _itemsSold;
    
    uint256 public platformFeeBps = 250; 
    address payable public platformFeeRecipient;
    bool public paused;

    mapping(uint256 => Listing) private _listings;
    mapping(address => mapping(uint256 => uint256)) private _activeListings;

    error PriceMustBeGreaterThanZero();
    error NotNFTOwner();
    error MarketplaceNotApproved();
    error ListingNotActive();
    error InsufficientPayment(uint256 sent, uint256 expected);
    error InvalidPlatformFeeRecipient();
    error FeeTooHigh();
    error TransferFailed();
    error ContractPaused();

    event NFTListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price);
    event NFTSold(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, address buyer, uint256 price, uint256 royaltyPaid, address royaltyReceiver);
    event ListingCanceled(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller);
    event PauseStateChanged(bool isPaused);

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    constructor() Ownable(msg.sender) {
        platformFeeRecipient = payable(msg.sender);
    }

    function setPlatformFeeBps(uint256 _feeBps) external onlyOwner {
        if (_feeBps > 1000) revert FeeTooHigh();
        platformFeeBps = _feeBps;
    }

    function listNFT(address nftContract, uint256 tokenId, uint256 price) external nonReentrant whenNotPaused {
        if (price == 0) revert PriceMustBeGreaterThanZero();
        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotNFTOwner();
        
        if (!nft.isApprovedForAll(msg.sender, address(this)) && nft.getApproved(tokenId) != address(this)) {
            revert MarketplaceNotApproved();
        }

        _listingIds++;
        uint256 listingId = _listingIds;

        _listings[listingId] = Listing(listingId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false, true);
        _activeListings[nftContract][tokenId] = listingId;
        nft.transferFrom(msg.sender, address(this), tokenId);

        emit NFTListed(listingId, nftContract, tokenId, msg.sender, price);
    }

    function buyNFT(uint256 listingId) external payable nonReentrant whenNotPaused {
        Listing storage listing = _listings[listingId];
        if (!listing.isActive || listing.isSold) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment(msg.value, listing.price);

        listing.isSold = true;
        listing.isActive = false;
        listing.owner = payable(msg.sender);
        _itemsSold++;

        uint256 fee = (listing.price * platformFeeBps) / 10000;
        uint256 remainingAmount = msg.value - fee;

        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        try IERC2981(listing.nftContract).royaltyInfo(listing.tokenId, listing.price) returns (address receiver, uint256 amount) {
            if (receiver != address(0) && amount > 0) {
                royaltyReceiver = receiver;
                royaltyAmount = amount;
                if (royaltyAmount > remainingAmount) royaltyAmount = remainingAmount;
                remainingAmount -= royaltyAmount;
            }
        } catch {}

        if (fee > 0) {
            (bool success, ) = platformFeeRecipient.call{value: fee}("");
            if (!success) revert TransferFailed();
        }

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool success, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            if (!success) revert TransferFailed();
        }

        if (remainingAmount > 0) {
            (bool success, ) = listing.seller.call{value: remainingAmount}("");
            if (!success) revert TransferFailed();
        }

        IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);
        delete _activeListings[listing.nftContract][listing.tokenId];

        emit NFTSold(listingId, listing.nftContract, listing.tokenId, listing.seller, msg.sender, listing.price, royaltyAmount, royaltyReceiver);

        if (msg.value > listing.price) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            if (!success) revert TransferFailed();
        }
    }
}`
    },
    auction: {
      name: 'CyberNFTAuction.sol',
      lang: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title CyberNFTAuction
 * @notice Trustless auction house contract for ERC721 NFTs with royalty support
 */
contract CyberNFTAuction is ReentrancyGuard, Ownable {
    
    struct Auction {
        uint256 auctionId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        uint256 minBid;
        uint256 endTime;
        address payable highestBidder;
        uint256 highestBid;
        bool isActive;
        bool isEnded;
    }

    uint256 private _auctionIds;
    uint256 public platformFeeBps = 250;
    address payable public platformFeeRecipient;
    bool public paused;

    mapping(uint256 => Auction) private _auctions;
    mapping(address => mapping(uint256 => uint256)) private _activeAuctions;
    mapping(address => uint256) private _pendingWithdrawals;

    error PriceMustBeGreaterThanZero();
    error DurationTooShort();
    error NotNFTOwner();
    error AuctionNotApproved();
    error AuctionNotActive();
    error AuctionHasEnded();
    error AuctionNotEnded();
    error BidTooLow(uint256 sent, uint256 expected);
    error NoRefundAvailable();
    error TransferFailed();
    error CannotCancelWithBids();
    error FeeTooHigh();
    error InvalidFeeRecipient();
    error ContractPaused();

    event AuctionCreated(uint256 indexed auctionId, address indexed nftContract, uint256 indexed tokenId, uint256 minBid, uint256 endTime, address seller);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address winner, uint256 amount, uint256 royaltyPaid, address royaltyReceiver);
    event AuctionCanceled(uint256 indexed auctionId);

    constructor(address payable _feeRecipient) Ownable(msg.sender) {
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        platformFeeRecipient = _feeRecipient;
    }

    function createAuction(address nftContract, uint256 tokenId, uint256 minBid, uint256 duration) external nonReentrant whenNotPaused {
        if (minBid == 0) revert PriceMustBeGreaterThanZero();
        if (duration < 60) revert DurationTooShort();

        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotNFTOwner();
        if (!nft.isApprovedForAll(msg.sender, address(this)) && nft.getApproved(tokenId) != address(this)) {
            revert AuctionNotApproved();
        }

        _auctionIds++;
        uint256 auctionId = _auctionIds;

        _auctions[auctionId] = Auction(auctionId, nftContract, tokenId, payable(msg.sender), minBid, block.timestamp + duration, payable(address(0)), 0, true, false);
        _activeAuctions[nftContract][tokenId] = auctionId;
        nft.transferFrom(msg.sender, address(this), tokenId);

        emit AuctionCreated(auctionId, nftContract, tokenId, minBid, block.timestamp + duration, msg.sender);
    }

    function placeBid(uint256 auctionId) external payable nonReentrant whenNotPaused {
        Auction storage auction = _auctions[auctionId];
        if (!auction.isActive || auction.isEnded) revert AuctionNotActive();
        if (block.timestamp >= auction.endTime) revert AuctionHasEnded();
        
        uint256 minRequiredBid = auction.highestBid == 0 ? auction.minBid : auction.highestBid + (auction.highestBid * 5 / 100);
        if (msg.value < minRequiredBid) revert BidTooLow(msg.value, minRequiredBid);

        if (auction.highestBidder != address(0)) {
            _pendingWithdrawals[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }
}`
    },
    hardhat: {
      name: 'hardhat.config.js',
      lang: 'javascript',
      code: `require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [process.env.PRIVATE_KEY].filter(Boolean),
      chainId: 80002,
    },
  },
};`
    },
    deploy: {
      name: 'scripts/deploy.js',
      lang: 'javascript',
      code: `const hre = require("hardhat");

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("CyberNFTMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);

  const NFT = await hre.ethers.getContractFactory("CyberNFT");
  const nft = await NFT.deploy(marketplaceAddress);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("CyberNFT deployed to:", nftAddress);

  const Auction = await hre.ethers.getContractFactory("CyberNFTAuction");
  const auction = await Auction.deploy(marketplaceAddress);
  await auction.waitForDeployment();
  console.log("CyberNFTAuction deployed to:", await auction.getAddress());
}

main().catch(console.error);`
    },
    test: {
      name: 'test/Marketplace.test.js',
      lang: 'javascript',
      code: `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CyberSpace NFT Marketplace", function () {
  it("Should list and buy an NFT", async function () {
    const [owner, seller, buyer] = await ethers.getSigners();
    // Test logic for listing and purchases goes here
  });
});`
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Developer Contracts Hub</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Inspect, compile, and explore our production-grade smart contracts compiled with Solidity 0.8.24.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Code File tree */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-xl space-y-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Workspace Directory</span>
            
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] text-zinc-655 font-bold uppercase tracking-wider px-2 py-1 text-zinc-600">/contracts</span>
              {[
                { id: 'nft', name: 'CyberNFT.sol' },
                { id: 'marketplace', name: 'CyberNFTMarketplace.sol' },
                { id: 'auction', name: 'CyberNFTAuction.sol' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFile(f.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
                    activeFile === f.id 
                      ? 'bg-zinc-900 text-cyan-400 border border-zinc-850' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>{f.name}</span>
                </button>
              ))}

              <span className="text-[10px] text-zinc-655 font-bold uppercase tracking-wider px-2 py-1 mt-3 text-zinc-600">/scripts</span>
              <button
                onClick={() => setActiveFile('deploy')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
                  activeFile === 'deploy' 
                    ? 'bg-zinc-900 text-cyan-400 border border-zinc-850' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>deploy.js</span>
              </button>

              <span className="text-[10px] text-zinc-655 font-bold uppercase tracking-wider px-2 py-1 mt-3 text-zinc-600">/test</span>
              <button
                onClick={() => setActiveFile('test')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
                  activeFile === 'test' 
                    ? 'bg-zinc-900 text-cyan-400 border border-zinc-850' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>Marketplace.test.js</span>
              </button>

              <span className="text-[10px] text-zinc-655 font-bold uppercase tracking-wider px-2 py-1 mt-3 text-zinc-600">Root config</span>
              <button
                onClick={() => setActiveFile('hardhat')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
                  activeFile === 'hardhat' 
                    ? 'bg-zinc-900 text-cyan-400 border border-zinc-850' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>hardhat.config.js</span>
              </button>
            </div>
          </div>

          {/* Compiler Simulator */}
          <div className="border border-zinc-800 bg-zinc-900/10 p-4 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Solc Compiler Simulator</span>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-zinc-500">
                <span>Version:</span>
                <span className="font-mono text-white">0.8.24+commit.e11b</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Optimization:</span>
                <span className="text-emerald-400 font-semibold">Enabled (200 runs)</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>EVM target:</span>
                <span className="font-mono text-zinc-300">Shanghai</span>
              </div>
            </div>

            <button
              onClick={handleCompile}
              disabled={compiling || compiled}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                compiled 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-950/20'
              }`}
            >
              {compiling ? (
                <>
                  <span className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Compiling bytecode...</span>
                </>
              ) : compiled ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Contracts Compiled</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Run Compile solc</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-9 border border-zinc-850 bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Code Header bar */}
          <div className="bg-zinc-900 border-b border-zinc-850 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-300 font-mono">
              <FileCode className="h-4 w-4 text-cyan-400" />
              <span>{files[activeFile].name}</span>
            </div>
            
            <button 
              onClick={() => handleCopy(files[activeFile].code, activeFile)}
              className="flex items-center space-x-1.5 text-xs text-zinc-500 hover:text-white transition"
            >
              {copiedText === activeFile ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Actual Code Area */}
          <pre className="p-6 overflow-x-auto text-[11px] font-mono text-zinc-300 bg-zinc-950 leading-relaxed max-h-[500px] custom-scrollbar select-text text-left">
            <code>{files[activeFile].code}</code>
          </pre>
        </div>
      </div>

      {/* Deploying instructions documentation block */}
      <div className="border border-zinc-800 bg-zinc-900/10 p-6 rounded-2xl space-y-6">
        <h3 className="text-md font-bold text-white font-rajdhani flex items-center gap-2">
          <Info className="h-5 w-5 text-cyan-400" />
          <span>Local Setup & Polygon Amoy Deployment Guide</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-400 leading-relaxed">
          <div className="space-y-2">
            <span className="font-bold text-white block">1. Clone & Install Dependencies</span>
            <p>To run this workspace on your local terminal, install Hardhat toolkit & OpenZeppelin contracts library.</p>
            <pre className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 font-mono text-[10px] text-cyan-400">
              {`npm install --save-dev hardhat
npm install @openzeppelin/contracts dotenv`}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white block">2. Run Local Unit Tests</span>
            <p>Execute Chai and Hardhat network tests to check reentrancy locks, marketplace fees, and royalty math.</p>
            <pre className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 font-mono text-[10px] text-cyan-400">
              {`npx hardhat test`}
            </pre>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white block">3. Deploy on Polygon Amoy</span>
            <p>Inject your private key and Polygonscan key in `.env`, and trigger deployer scripts.</p>
            <pre className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 font-mono text-[10px] text-cyan-400">
              {`npx hardhat run scripts/deploy.js --network amoy`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
