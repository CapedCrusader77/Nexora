const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const EXPLORER_URLS = {
  80002: "https://amoy.polygonscan.com",
  11155111: "https://sepolia.etherscan.io",
};

async function main() {
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  const explorerBase = EXPLORER_URLS[chainId] || "https://amoy.polygonscan.com";

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  NEXORA NFT MARKETPLACE — Contract Deployment Suite");
  console.log("  EtherAuthority Internship Project");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Network:  ${network} (Chain ID: ${chainId})`);
  console.log(`  Explorer: ${explorerBase}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  const [deployer] = await hre.ethers.getSigners();
  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer:  ${deployer.address}`);
  console.log(`Balance:   ${hre.ethers.formatEther(deployerBalance)} ${network === "amoy" ? "MATIC" : "ETH"}\n`);

  if (deployerBalance === 0n) {
    console.error("ERROR: Deployer wallet has zero balance. Fund it with testnet tokens first.");
    process.exit(1);
  }

  // ── Step 1: Deploy Marketplace ──────────────────────────────────────
  console.log("[1/3] Deploying CyberNFTMarketplace...");
  const CyberNFTMarketplace = await hre.ethers.getContractFactory("CyberNFTMarketplace");
  const marketplace = await CyberNFTMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  const marketplaceTx = marketplace.deploymentTransaction();
  console.log(`  ✓ CyberNFTMarketplace deployed to: ${marketplaceAddress}`);
  console.log(`    TX: ${explorerBase}/tx/${marketplaceTx?.hash}\n`);

  // ── Step 2: Deploy NFT Contract ─────────────────────────────────────
  console.log("[2/3] Deploying CyberNFT (linked to marketplace)...");
  const CyberNFT = await hre.ethers.getContractFactory("CyberNFT");
  const nft = await CyberNFT.deploy(marketplaceAddress);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  const nftTx = nft.deploymentTransaction();
  console.log(`  ✓ CyberNFT deployed to: ${nftAddress}`);
  console.log(`    TX: ${explorerBase}/tx/${nftTx?.hash}\n`);

  // ── Step 3: Deploy Auction Contract ─────────────────────────────────
  console.log("[3/3] Deploying CyberNFTAuction...");
  const CyberNFTAuction = await hre.ethers.getContractFactory("CyberNFTAuction");
  const auction = await CyberNFTAuction.deploy(deployer.address);
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  const auctionTx = auction.deploymentTransaction();
  console.log(`  ✓ CyberNFTAuction deployed to: ${auctionAddress}`);
  console.log(`    TX: ${explorerBase}/tx/${auctionTx?.hash}\n`);

  // ── Save Deployment Data ────────────────────────────────────────────
  const deployment = {
    network,
    chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    explorerBaseUrl: explorerBase,
    contracts: {
      CyberNFTMarketplace: {
        address: marketplaceAddress,
        txHash: marketplaceTx?.hash || "",
        explorerUrl: `${explorerBase}/address/${marketplaceAddress}`,
      },
      CyberNFT: {
        address: nftAddress,
        txHash: nftTx?.hash || "",
        explorerUrl: `${explorerBase}/address/${nftAddress}`,
      },
      CyberNFTAuction: {
        address: auctionAddress,
        txHash: auctionTx?.hash || "",
        explorerUrl: `${explorerBase}/address/${auctionAddress}`,
      },
    },
    envVars: {
      NEXT_PUBLIC_NFT_ADDRESS: nftAddress,
      NEXT_PUBLIC_MARKETPLACE_ADDRESS: marketplaceAddress,
      NEXT_PUBLIC_AUCTION_ADDRESS: auctionAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
  console.log(`Deployment data saved to: ${deploymentFile}\n`);

  // ── Summary ─────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE — Contract Addresses");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  CyberNFTMarketplace: ${marketplaceAddress}`);
  console.log(`  CyberNFT:           ${nftAddress}`);
  console.log(`  CyberNFTAuction:    ${auctionAddress}`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\n  Explorer Links:");
  console.log(`  Marketplace: ${explorerBase}/address/${marketplaceAddress}`);
  console.log(`  NFT:         ${explorerBase}/address/${nftAddress}`);
  console.log(`  Auction:     ${explorerBase}/address/${auctionAddress}`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\n  Add these to your .env file:");
  console.log(`  NEXT_PUBLIC_NFT_ADDRESS="${nftAddress}"`);
  console.log(`  NEXT_PUBLIC_MARKETPLACE_ADDRESS="${marketplaceAddress}"`);
  console.log(`  NEXT_PUBLIC_AUCTION_ADDRESS="${auctionAddress}"`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // ── Contract Verification ───────────────────────────────────────────
  if (network !== "hardhat" && network !== "localhost") {
    console.log("Starting contract verification on block explorer...\n");
    console.log("Waiting 30 seconds for block explorer to index contracts...");
    await new Promise((r) => setTimeout(r, 30000));

    try {
      console.log("Verifying CyberNFTMarketplace...");
      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [],
      });
      console.log("  ✓ CyberNFTMarketplace verified\n");
    } catch (err) {
      console.warn(`  ⚠ Marketplace verification: ${err.message}\n`);
    }

    try {
      console.log("Verifying CyberNFT...");
      await hre.run("verify:verify", {
        address: nftAddress,
        constructorArguments: [marketplaceAddress],
      });
      console.log("  ✓ CyberNFT verified\n");
    } catch (err) {
      console.warn(`  ⚠ NFT verification: ${err.message}\n`);
    }

    try {
      console.log("Verifying CyberNFTAuction...");
      await hre.run("verify:verify", {
        address: auctionAddress,
        constructorArguments: [deployer.address],
      });
      console.log("  ✓ CyberNFTAuction verified\n");
    } catch (err) {
      console.warn(`  ⚠ Auction verification: ${err.message}\n`);
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log("  VERIFICATION COMPLETE");
    console.log("═══════════════════════════════════════════════════════════\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
