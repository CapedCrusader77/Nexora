# NEXORA — Web3 NFT Marketplace & Auction House

> **EtherAuthority Internship Project** — A production-grade decentralized NFT Marketplace built on the Polygon Amoy Testnet.

![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)
![Polygon](https://img.shields.io/badge/Network-Polygon%20Amoy-8247E5?logo=polygon)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000?logo=next.js)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Project Overview

NEXORA is a full-stack Web3 NFT Marketplace and Auction House featuring:

- **Real blockchain transactions** on Polygon Amoy Testnet (Chain ID: `80002`)
- **ERC-721 NFT minting** with metadata pinned to IPFS via Pinata
- **ERC-2981 royalty compliance** — creators earn royalties on every resale
- **Trustless escrow marketplace** with platform fee distribution
- **Time-based auction system** with 5% bid increments and pull-payment refunds
- **RainbowKit wallet connection** supporting MetaMask, WalletConnect, Coinbase
- **Developer sandbox mode** for testing without real funds

---

## 🔗 Deployment Details

| Item | Details |
|------|---------|
| **Network** | Polygon Amoy Testnet (Chain ID: `80002`) |
| **NFT Contract** | `NEXT_PUBLIC_NFT_ADDRESS` — [View on Polygonscan](https://amoy.polygonscan.com) |
| **Marketplace Contract** | `NEXT_PUBLIC_MARKETPLACE_ADDRESS` — [View on Polygonscan](https://amoy.polygonscan.com) |
| **Auction Contract** | `NEXT_PUBLIC_AUCTION_ADDRESS` — [View on Polygonscan](https://amoy.polygonscan.com) |
| **Explorer** | [amoy.polygonscan.com](https://amoy.polygonscan.com) |

> **Note**: After deploying contracts with `npm run deploy:amoy`, the actual addresses will be saved to `deployments/amoy.json` and printed to console. Update the table above and your `.env` file with the deployed addresses.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS v4 |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin v5 |
| **Blockchain** | Polygon Amoy Testnet / Ethereum Sepolia |
| **Wallet** | RainbowKit v2, Wagmi v2, Viem |
| **Storage** | IPFS via Pinata |
| **Token Standards** | ERC-721 (NFT), ERC-2981 (Royalty) |
| **UI** | Framer Motion, Lucide Icons, Glassmorphism |

---

## 🏛️ Smart Contract Architecture

### 1. `CyberNFT.sol` (ERC-721 + ERC-2981)
- Extends OpenZeppelin's `ERC721URIStorage` and `ERC2981` for royalty compliance
- Auto-incrementing token IDs
- Auto-approves marketplace address during mint for gas-efficient single-hop sales
- Max royalty cap: 20% (2000 basis points)

### 2. `CyberNFTMarketplace.sol`
- Trustless escrow listing of ERC-721 tokens
- `ReentrancyGuard` on all transfer endpoints
- Platform fee: 2.5% (configurable by owner, max 10%)
- Automatic royalty distribution via ERC-2981 on every sale
- Pause functionality for emergency stops

### 3. `CyberNFTAuction.sol`
- Time-based auctions with configurable duration (minimum 60 seconds)
- 5% minimum bid increment to prevent spam
- Pull-payment pattern (`_pendingWithdrawals`) for safe outbid refunds
- Automatic royalty + platform fee distribution on auction end

---

## 🔒 Security Features

1. **Reentrancy Protection**: `ReentrancyGuard` on all state-changing functions
2. **Checks-Effects-Interactions**: All state mutations before external calls
3. **Access Control**: `Ownable` pattern for admin functions
4. **Custom Errors**: Gas-efficient error handling with descriptive messages
5. **Pause Mechanism**: Owner can pause marketplace in emergencies
6. **Pull Payments**: Auction refunds use withdrawal pattern to prevent griefing

---

## 🛠️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) browser extension
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

Edit `.env` and add your credentials:

```env
# Required for deployment
PRIVATE_KEY="your_deployer_wallet_private_key"
POLYGONSCAN_API_KEY="your_polygonscan_api_key"

# Optional but recommended
NEXT_PUBLIC_PINATA_JWT="your_pinata_jwt_token"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"
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

This will:
- Deploy all 3 contracts to Polygon Amoy
- Save addresses to `deployments/amoy.json`
- Auto-verify contracts on Polygonscan
- Print `NEXT_PUBLIC_*` env vars to add to your `.env`

### 6. Update Frontend Constants

After deployment, copy the printed `NEXT_PUBLIC_*` values to your `.env` file, then:

```bash
npm run generate-constants
```

### 7. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🦊 MetaMask Wallet Setup

1. Install [MetaMask](https://metamask.io/) browser extension
2. Add **Polygon Amoy Testnet** network:
   | Setting | Value |
   |---------|-------|
   | Network Name | Polygon Amoy Testnet |
   | RPC URL | `https://rpc-amoy.polygon.technology` |
   | Chain ID | `80002` |
   | Currency Symbol | MATIC |
   | Block Explorer | `https://amoy.polygonscan.com` |
3. Get free testnet MATIC from [Alchemy Faucet](https://www.alchemy.com/faucets/polygon-amoy)
4. Connect your wallet on the NEXORA website

---

## 📁 Project Structure

```
├── contracts/            # Solidity smart contracts
│   ├── NFT.sol           # ERC-721 + ERC-2981 NFT contract
│   ├── NFTMarketplace.sol # Trustless marketplace with escrow
│   └── NFTAuction.sol    # Time-based auction system
├── scripts/
│   ├── deploy.js         # Deployment + verification script
│   ├── verify.js         # Standalone contract verification
│   └── generate-constants.js  # ABI & address generator
├── deployments/          # Auto-saved deployment data (JSON)
├── test/                 # Hardhat unit tests
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React UI components
│   ├── context/          # Web3 provider & context
│   ├── hooks/            # Blockchain interaction hooks
│   ├── services/         # IPFS pinning service
│   └── utils/            # Constants & helpers
└── hardhat.config.js     # Hardhat configuration
```

---

## 🌐 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run compile` | Compile Solidity contracts |
| `npm run test-contracts` | Run Hardhat unit tests |
| `npm run deploy:amoy` | Deploy to Polygon Amoy + verify |
| `npm run deploy:sepolia` | Deploy to Ethereum Sepolia + verify |
| `npm run verify:amoy` | Re-verify contracts on Polygonscan |
| `npm run generate-constants` | Regenerate frontend constants |

---

## 🎓 EtherAuthority

This project was developed as part of the **EtherAuthority Internship Training Program**.

- **Website**: [etherauthority.io](https://etherauthority.io)
- **Program**: Blockchain Development Internship
- **Focus**: Smart Contract Development, DApp Architecture, Web3 Integration

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
