# CyberSpace Next-Gen NFT & Auction Marketplace

A premium, full-stack Web3 NFT Marketplace and Auction House optimized for the **Polygon Amoy Testnet** (Chain ID: `80002`). Featuring dynamic gas estimations, client-side IPFS pinning simulations, creators royalty compliance (EIP-2981), and an interactive developer playground console.

---

## 🚀 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Blockchain Smart Contracts:** Solidity v0.8.20, Hardhat Development Suite, Ethers.js
- **Token Specifications:** ERC-721 (Non-Fungible Token), ERC-2981 (Royalty Standard)
- **Decentralized Storage:** IPFS (via Pinata Pinning Nodes)

---

## 🏛️ Smart Contract Architecture

The core blockchain layers consist of three interconnected smart contracts designed with gas optimization and security in mind:

### 1. `CyberNFT.sol`
- Extends OpenZeppelin's standard `ERC721URIStorage` and `ERC2981` (Royalty Compliance).
- Features auto-incrementing `Counter` identifiers for token mints.
- Automatically approves the marketplace address during creation for gas-efficient single-hop sales.

### 2. `CyberNFTMarketplace.sol`
- Implements trustless escrow listing of ERC721 items.
- Compliant with **ReentrancyGuard** modifier protections on all transfer endpoints.
- Calculates and distributes platform commission fees (2.5% default) and creator royalties (EIP-2981) in native tokens on trade finalization.

### 3. `CyberNFTAuction.sol`
- Manages time-based bid parameters with time-lock checks.
- Enforces a minimum 5% bid increment to prevent spamming transactions.
- Uses pull-payment style mapping `_pendingWithdrawals` to safeguard against outbid refund locks and reentrancy vectors.

---

## 🔒 Security Compliance

1. **Reentrancy Protections:** All state mutations and balance updates are completed prior to transferring external funds (checks-effects-interactions pattern).
2. **Access Control:** Owner-restricted configuration variables (e.g., setting platform fees) utilize the OpenZeppelin `Ownable` pattern.
3. **Safe Transfers:** Utilizes `.transfer()` and token transfer checks, fully compatible with safe transfer standards.

---

## 🛠️ Local Development & Hardhat Setup

To compile, run unit tests, and deploy locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Solidity Smart Contracts
```bash
npx hardhat compile
```

### 3. Run Unit Tests (Chai & Mocha)
```bash
npx hardhat test
```

### 4. Deploy to Polygon Amoy Testnet
Setup your `.env` variables:
```env
PRIVATE_KEY="your_wallet_private_key"
POLYGONSCAN_API_KEY="your_polygonscan_developer_api_key"
```

Then run the Hardhat deploy script:
```bash
npx hardhat run scripts/deploy.js --network amoy
```

---

## 🌐 Front-End Features

- **Developer Simulator Panel:** Swap between three pre-funded mock profiles (Creator, Buyer, Bidder) to test auction outbidding and royalty distributions instantly without needing faucet funds.
- **AI Cyber Story Generation:** Utilize the AI engine mockup on the details and creation pages to generate rich cyberpunk descriptions based on attribute categories.
- **Block Explorer Integration:** Every transaction outputs a mock transactional hash link leading to the corresponding block search on PolygonScan.
- **Light/Dark & Glassmorphism Aesthetics:** Engineered with cyberpunk responsive elements and neon highlights.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
"# Nexora" 
