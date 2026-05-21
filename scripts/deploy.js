const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of CyberSpace NFT Marketplace Contracts...");

  // 1. Deploy Marketplace
  const CyberNFTMarketplace = await hre.ethers.getContractFactory("CyberNFTMarketplace");
  const marketplace = await CyberNFTMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`[Success] CyberNFTMarketplace deployed to: ${marketplaceAddress}`);

  // 2. Deploy NFT Contract
  const CyberNFT = await hre.ethers.getContractFactory("CyberNFT");
  const nft = await CyberNFT.deploy(marketplaceAddress);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`[Success] CyberNFT deployed to: ${nftAddress}`);

  // 3. Deploy Auction Contract
  const CyberNFTAuction = await hre.ethers.getContractFactory("CyberNFTAuction");
  const signers = await hre.ethers.getSigners();
  const feeRecipient = signers[0].address;
  const auction = await CyberNFTAuction.deploy(feeRecipient);
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  console.log(`[Success] CyberNFTAuction deployed to: ${auctionAddress}`);

  console.log("-----------------------------------------");
  console.log("DEPLOYMENT COMPLETE");
  console.log(`CyberNFTMarketplace: ${marketplaceAddress}`);
  console.log(`CyberNFT:            ${nftAddress}`);
  console.log(`CyberNFTAuction:     ${auctionAddress}`);
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
