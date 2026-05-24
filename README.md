# NEXORA — Web3 NFT Marketplace & Auction House

> **EtherAuthority Internship Project** — A production-grade decentralized NFT Marketplace built on the Polygon Amoy Testnet.

![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)
![Polygon](https://img.shields.io/badge/Network-Polygon%20Amoy-8247E5?logo=polygon)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000?logo=next.js)
![Security](https://img.shields.io/badge/Audit-ReentrancyGuard%20%26%20ERC2981-green)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Project Overview

**NEXORA** is a full-stack Web3 NFT Marketplace and Auction House featuring real blockchain integration on Polygon Amoy Testnet. This project demonstrates production-grade decentralized application development with security best practices and user-friendly Web3 UX.

### ✨ Key Features

- ✅ **Real Blockchain Transactions** — Live on Polygon Amoy Testnet (Chain ID: `80002`)
- ✅ **ERC-721 NFT Minting** — Metadata pinned to IPFS via Pinata, auto-incremented token IDs
- ✅ **ERC-2981 Royalty Compliance** — Creators earn automatic royalties on every resale
- ✅ **Trustless Escrow Marketplace** — Smart contract-based listing and sales
- ✅ **Time-Based Auction System** — 5% bid increments, pull-payment refunds
- ✅ **Real Wallet Integration** — MetaMask, WalletConnect, Coinbase Wallet via RainbowKit
- ✅ **Production-Grade UI/UX** — Glassmorphism, animations, responsive design, Framer Motion
- ✅ **Smart Contract Security** — ReentrancyGuard, Ownable, Pausable, custom errors, gas optimization
- ✅ **Professional Branding** — EtherAuthority training program branding throughout

---

## 🔗 Deployment Details

| Item | Details |
|------|---------|
| **Network** | Polygon Amoy Testnet (Chain ID: `80002`) |
| **Explorer** | [amoy.polygonscan.com](https://amoy.polygonscan.com) |
| **Faucet** | [Alchemy Faucet](https://www.alchemy.com/faucets/polygon-amoy) |
| **RPC** | `https://rpc-amoy.polygon.technology` |

### ⛓️ Smart Contract Addresses

After deployment, contracts will be verified and accessible:

- **NFT Contract**: View on [Polygonscan](https://amoy.polygonscan.com) (address from deployment)
- **Marketplace Contract**: View on [Polygonscan](https://amoy.polygonscan.com) (address from deployment)
- **Auction Contract**: View on [Polygonscan](https://amoy.polygonscan.com) (address from deployment)

> Run `npm run deploy:amoy` to generate actual addresses and automatic Polygonscan verification

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS v4 |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin v5 |
| **Blockchain** | Polygon Amoy Testnet / Ethereum Sepolia |
| **Wallet** | RainbowKit v2, Wagmi v2, Viem |
| **Storage** | IPFS via Pinata (with fallback simulation) |
| **Token Standards** | ERC-721 (NFT), ERC-2981 (Royalty) |
| **UI/UX** | Framer Motion, Lucide Icons, Glassmorphism |
| **AI** | Gemini API for metadata generation (with fallback) |

---

## 🏛️ Smart Contract Architecture

### 1. **CyberNFT.sol** (ERC-721 + ERC-2981)
- Extends OpenZeppelin's `ERC721URIStorage` and `ERC2981` for royalty compliance
- Auto-incrementing token IDs (`tokenIdCounter`)
- Auto-approves marketplace address during mint for gas-efficient single-hop sales
- Maximum royalty cap: 20% (2000 basis points)
- **Events**: `NFTMinted`, `Transfer`
- **Security**: Custom errors, proper ownership checks

### 2. **CyberNFTMarketplace.sol**
- Trustless escrow listing of ERC-721 tokens
- `ReentrancyGuard` on all transfer endpoints
- Platform fee: 2.5% (250 bps, configurable by owner, max 10%)
- Automatic royalty distribution via ERC-2981 detection on every sale
- Pause functionality for emergency stops
- **Features**: List, Buy, Cancel, ERC-2981 detection
- **Events**: `NFTListed`, `NFTSold`, `ListingCanceled`, `PauseStateChanged`
- **Security**: Reentrancy protection, overflow checks, Ownable access control

### 3. **CyberNFTAuction.sol**
- Time-based English auctions with configurable duration (minimum 60 seconds)
- 5% minimum bid increment to prevent spam
- Pull-payment pattern (`_pendingWithdrawals`) for safe outbid refunds
- Automatic royalty + platform fee distribution on auction end
- **Features**: Create, Bid, End, Cancel, Withdraw refunds
- **Events**: `AuctionCreated`, `BidPlaced`, `AuctionEnded`, `AuctionCanceled`
- **Security**: Reentrancy guard, pull payments, access control

---

## 🔒 Security Features

### Smart Contracts
1. ✅ **Reentrancy Protection**: `ReentrancyGuard` on all state-changing functions
2. ✅ **Checks-Effects-Interactions**: All state mutations before external calls
3. ✅ **Access Control**: `Ownable` pattern for admin functions
4. ✅ **Custom Errors**: Gas-efficient error handling with descriptive messages
5. ✅ **Pause Mechanism**: Owner can pause marketplace in emergencies
6. ✅ **Pull Payments**: Auction refunds use withdrawal pattern to prevent griefing
7. ✅ **Input Validation**: All function parameters validated before execution
8. ✅ **ERC-2981 Compliance**: Royalty overflow protection, configurable max cap

### Frontend
1. ✅ **Wallet Verification**: Real cryptographic signatures, not mocked
2. ✅ **Network Validation**: Automatic chain switching to Polygon Amoy
3. ✅ **Transaction Confirmation**: Proper wait for block confirmation before UI update
4. ✅ **Error Handling**: Comprehensive error messages and fallbacks
5. ✅ **Development-Only Tools**: Wallet Simulator hidden in production builds

---

## 🛠️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) browser extension (or WalletConnect/Coinbase Wallet)
- [Git](https://git-scm.com/)
- Testnet MATIC from [Alchemy Faucet](https://www.alchemy.com/faucets/polygon-amoy)

### 1. Clone & Install

```bash
git clone https://github.com/CapedCrusader77/Nexora.git
cd Nexora
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# ═══ DEPLOYMENT ═══
PRIVATE_KEY="0x..."  # Deployer wallet private key
POLYGONSCAN_API_KEY="..."  # From polygonscan.com/apis

# ═══ FRONTEND ═══
NEXT_PUBLIC_NFT_ADDRESS="0x..."  # Auto-generated after deployment
NEXT_PUBLIC_MARKETPLACE_ADDRESS="0x..."  # Auto-generated
NEXT_PUBLIC_AUCTION_ADDRESS="0x..."  # Auto-generated
NEXT_PUBLIC_CHAIN_ID=80002

# ═══ OPTIONAL ═══
NEXT_PUBLIC_PINATA_JWT="..."  # For real IPFS pinning
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="..."  # For WalletConnect
REPORT_GAS=false  # Set to true for gas reports
```

### 3. Compile Smart Contracts

```bash
npm run compile
```

### 4. Run Unit Tests

```bash
npm run test-contracts
```

### 5. Deploy to Polygon Amoy

```bash
npm run deploy:amoy
```

**Output**: 
- Contracts deployed to Polygon Amoy
- Addresses saved to `deployments/amoy.json`
- Auto-verified on Polygonscan
- `NEXT_PUBLIC_*` values printed to console

### 6. Update Frontend Constants

Copy the deployed addresses from step 5 to `.env`:

```bash
npm run generate-constants
```

### 7. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 8. Build for Production

```bash
npm run build && npm run start
```

---

## 🦊 MetaMask Wallet Setup

### 1. Install MetaMask
Download from [metamask.io](https://metamask.io)

### 2. Add Polygon Amoy Network

| Setting | Value |
|---------|-------|
| **Network Name** | Polygon Amoy Testnet |
| **RPC URL** | `https://rpc-amoy.polygon.technology` |
| **Chain ID** | `80002` |
| **Currency Symbol** | MATIC |
| **Block Explorer** | `https://amoy.polygonscan.com` |

### 3. Get Testnet MATIC

Visit [Alchemy Faucet](https://www.alchemy.com/faucets/polygon-amoy) and request free MATIC (0.5 MATIC every 24 hours)

### 4. Connect to NEXORA

1. Go to [NEXORA Marketplace](http://localhost:3000) (or deployed URL)
2. Click "Connect Wallet" 
3. Select MetaMask
4. Approve connection in MetaMask popup
5. Ensure you're on Polygon Amoy (network selector shows it)

---

## 📁 Project Structure

```
nexora/
├── contracts/                    # Solidity smart contracts
│   ├── CyberNFT.sol            # ERC-721 + ERC-2981 NFT
│   ├── CyberNFTMarketplace.sol # Escrow marketplace
│   └── CyberNFTAuction.sol     # Auction system
├── deployments/                  # Auto-saved deployment JSON
├── hardhat.config.js            # Hardhat + networks config
├── scripts/
│   ├── deploy.js               # Deployment script
│   ├── verify.js               # Standalone verification
│   └── generate-constants.js   # ABI/address generator
├── test/                         # Hardhat unit tests
├── src/
│   ├── app/                     # Next.js pages
│   │   ├── page.tsx            # Hero + featured
│   │   ├── explore/            # Browse marketplace
│   │   ├── create/             # Mint NFTs
│   │   ├── dashboard/          # Analytics
│   │   ├── auctions/           # Active auctions
│   │   ├── activity/           # Transaction history
│   │   ├── collections/        # Collections
│   │   ├── profile/            # User profile
│   │   └── details/[id]/       # NFT detail view
│   ├── components/              # React components
│   │   ├── NEXORANavbar.tsx    # Navigation
│   │   ├── Footer.tsx          # Professional footer
│   │   ├── BlockchainStatus.tsx # Network status
│   │   ├── WalletSimulator.tsx # Dev-only simulator
│   │   ├── NFTCard.tsx         # NFT display
│   │   └── ...
│   ├── context/                 # Web3 providers
│   │   ├── Web3Provider.tsx    # Wagmi + RainbowKit
│   │   └── Web3Context.tsx     # App state
│   ├── hooks/                   # Custom hooks
│   │   ├── useNFTMarketplace.ts # Contract interactions
│   │   ├── useContractData.ts  # Real contract reads
│   │   └── useLocalStorage.ts
│   ├── services/
│   │   ├── pinata.ts           # IPFS pinning
│   │   └── gemini.ts           # AI metadata
│   └── utils/
│       ├── constants.ts         # Contract ABIs & addresses
│       └── cn.ts               # Utility helpers
├── public/                       # Static assets
├── package.json                 # Dependencies
└── README.md                     # This file
```

---

## 🌐 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run compile` | Compile Solidity contracts |
| `npm run test-contracts` | Run Hardhat unit tests |
| `npm run deploy:amoy` | Deploy to Polygon Amoy + verify |
| `npm run deploy:sepolia` | Deploy to Ethereum Sepolia + verify |
| `npm run verify:amoy` | Re-verify contracts on Polygonscan |
| `npm run verify:sepolia` | Re-verify contracts on Etherscan |
| `npm run generate-constants` | Regenerate frontend constants from ABIs |

---

## 🎨 UI/UX Features

### Design System
- **Glassmorphism**: Frosted glass effect on cards and modals
- **Animated Gradients**: Smooth color transitions with Framer Motion
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Dark Theme**: Professional dark UI optimized for Web3
- **Icons**: Lucide React icon library
- **Typography**: Premium font weights and spacing

### Components
- ✅ Navbar with wallet connection and network status
- ✅ Hero section with animated background
- ✅ NFT cards with glassmorphism and hover effects
- ✅ Marketplace listing with search and filters
- ✅ NFT creation form with validation
- ✅ Dashboard with analytics
- ✅ Auction bidding interface
- ✅ Activity feed with transaction history
- ✅ Professional footer with links
- ✅ Blockchain status indicators
- ✅ Skeleton loaders for async data

---

## 🚀 Deployment to Production

### Option 1: Vercel (Recommended)

```bash
npm run build
vercel deploy --prod
```

### Option 2: Self-Hosted

```bash
npm run build
npm run start  # Runs on http://localhost:3000
```

Use a reverse proxy (Nginx, Apache) for SSL and domain mapping.

---

## 📊 Features Overview

### For Creators
- ✅ Mint ERC-721 NFTs with metadata and royalties
- ✅ List NFTs on marketplace or create auctions
- ✅ Earn royalties on secondary sales
- ✅ View portfolio and sales analytics
- ✅ Withdraw platform fees (for contract owner)

### For Collectors
- ✅ Browse all listed NFTs and active auctions
- ✅ Purchase NFTs directly or bid in auctions
- ✅ View transaction history and activity feed
- ✅ Manage portfolio and owned NFTs
- ✅ Filter by category, price, rarity

### For Developers
- ✅ Well-documented smart contracts with natspec
- ✅ Hardhat test suite with examples
- ✅ Deployment scripts with auto-verification
- ✅ React hooks for contract interaction
- ✅ TypeScript for type safety
- ✅ ABI generation for frontend

---

## 🎓 EtherAuthority

This project was developed as part of the **EtherAuthority Internship Training Program**.

- **Website**: [etherauthority.io](https://etherauthority.io)
- **Program**: Blockchain Development & Web3 DApp Architecture
- **Focus**: Smart Contracts, Frontend Integration, Best Practices

---

## 📄 Smart Contract Licenses

All smart contracts are compatible with:
- OpenZeppelin Contracts v5 (MIT License)
- Solidity 0.8.24 (GPL-3.0)

---

## 🐛 Bug Reports & Contributing

Found an issue? Want to contribute?

1. Open an issue with detailed description
2. Submit a pull request with fixes
3. Follow existing code style and patterns

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com) — Smart contract libraries
- [Polygon](https://polygon.technology) — Amoy testnet infrastructure
- [RainbowKit](https://www.rainbowkit.com/) — Wallet connection UI
- [Pinata](https://www.pinata.cloud/) — IPFS pinning service
- [EtherAuthority](https://etherauthority.io) — Mentorship & resources

---

**Built with ❤️ under the EtherAuthority Training Program**
