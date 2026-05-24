const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`ERROR: No deployment file found at ${deploymentFile}`);
    console.error(`Run 'npx hardhat run scripts/deploy.js --network ${network}' first.`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const { contracts, deployer } = deployment;

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  NEXORA — Standalone Contract Verification");
  console.log(`  Network: ${network} | Deployer: ${deployer}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // Verify CyberNFTMarketplace
  try {
    console.log(`[1/3] Verifying CyberNFTMarketplace at ${contracts.CyberNFTMarketplace.address}...`);
    await hre.run("verify:verify", {
      address: contracts.CyberNFTMarketplace.address,
      constructorArguments: [],
    });
    console.log("  ✓ CyberNFTMarketplace verified\n");
  } catch (err) {
    console.warn(`  ⚠ ${err.message}\n`);
  }

  // Verify CyberNFT
  try {
    console.log(`[2/3] Verifying CyberNFT at ${contracts.CyberNFT.address}...`);
    await hre.run("verify:verify", {
      address: contracts.CyberNFT.address,
      constructorArguments: [contracts.CyberNFTMarketplace.address],
    });
    console.log("  ✓ CyberNFT verified\n");
  } catch (err) {
    console.warn(`  ⚠ ${err.message}\n`);
  }

  // Verify CyberNFTAuction
  try {
    console.log(`[3/3] Verifying CyberNFTAuction at ${contracts.CyberNFTAuction.address}...`);
    await hre.run("verify:verify", {
      address: contracts.CyberNFTAuction.address,
      constructorArguments: [deployer],
    });
    console.log("  ✓ CyberNFTAuction verified\n");
  } catch (err) {
    console.warn(`  ⚠ ${err.message}\n`);
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  VERIFICATION COMPLETE");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Marketplace: ${contracts.CyberNFTMarketplace.explorerUrl}`);
  console.log(`  NFT:         ${contracts.CyberNFT.explorerUrl}`);
  console.log(`  Auction:     ${contracts.CyberNFTAuction.explorerUrl}`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
