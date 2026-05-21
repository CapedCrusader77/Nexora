const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CyberSpace NFT Marketplace", function () {
  let NFT;
  let nft;
  let Marketplace;
  let marketplace;
  let owner;
  let seller;
  let buyer;
  let royaltyReceiver;

  beforeEach(async function () {
    [owner, seller, buyer, royaltyReceiver] = await ethers.getSigners();

    // Deploy Marketplace
    Marketplace = await ethers.getContractFactory("CyberNFTMarketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();

    // Deploy NFT
    NFT = await ethers.getContractFactory("CyberNFT");
    nft = await NFT.deploy(await marketplace.getAddress());
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner for the marketplace", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Should set the right marketplace address in the NFT contract", async function () {
      expect(await nft.marketplaceAddress()).to.equal(await marketplace.getAddress());
    });
  });

  describe("Minting and Royalties", function () {
    it("Should mint an NFT and set correct royalty info", async function () {
      const tokenURI = "ipfs://QmXoypizjW3WknFixtdKLwznw71tbF1T2wD5vQP3G8v2Yg";
      const royaltyFeeBps = 1000; // 10%

      // Mint NFT from seller account
      await expect(
        nft.connect(seller).mint(tokenURI, royaltyReceiver.address, royaltyFeeBps)
      ).to.emit(nft, "NFTMinted");

      const tokenId = 1;
      expect(await nft.ownerOf(tokenId)).to.equal(seller.address);

      // Verify royalty info (sale price 100 ETH should yield 10 ETH royalty)
      const salePrice = ethers.parseEther("100");
      const [receiver, amount] = await nft.royaltyInfo(tokenId, salePrice);
      expect(receiver).to.equal(royaltyReceiver.address);
      expect(amount).to.equal(ethers.parseEther("10"));
    });
  });

  describe("Marketplace Transactions", function () {
    const tokenURI = "ipfs://QmMetadataCID";
    const royaltyFeeBps = 500; // 5%
    const salePrice = ethers.parseEther("2"); // 2 ETH

    beforeEach(async function () {
      // Mint NFT
      await nft.connect(seller).mint(tokenURI, royaltyReceiver.address, royaltyFeeBps);
      // Approve marketplace to transfer the token
      await nft.connect(seller).approve(await marketplace.getAddress(), 1);
    });

    it("Should list and sell an NFT with royalties and platform fees", async function () {
      // List NFT
      await expect(
        marketplace.connect(seller).listNFT(await nft.getAddress(), 1, salePrice)
      ).to.emit(marketplace, "NFTListed");

      // Verify that marketplace now owns the NFT (escrowed)
      expect(await nft.ownerOf(1)).to.equal(await marketplace.getAddress());

      // Buy NFT from buyer
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      const initialRoyaltyBalance = await ethers.provider.getBalance(royaltyReceiver.address);
      const initialPlatformFeeRecipientBalance = await ethers.provider.getBalance(owner.address);

      // Purchase NFT
      const tx = await marketplace.connect(buyer).buyNFT(1, { value: salePrice });
      await tx.wait();

      // Verify ownership has transferred to the buyer
      expect(await nft.ownerOf(1)).to.equal(buyer.address);

      // Verify platform fee (2.5% of 2 ETH = 0.05 ETH)
      // Royalty (5% of 2 ETH = 0.10 ETH)
      // Remaining for Seller (2 - 0.05 - 0.1 = 1.85 ETH)
      const expectedSellerProfit = ethers.parseEther("1.85");
      const expectedRoyalty = ethers.parseEther("0.1");

      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      const finalRoyaltyBalance = await ethers.provider.getBalance(royaltyReceiver.address);

      expect(finalSellerBalance - initialSellerBalance).to.equal(expectedSellerProfit);
      expect(finalRoyaltyBalance - initialRoyaltyBalance).to.equal(expectedRoyalty);
    });

    it("Should allow seller to cancel their listing", async function () {
      // List
      await marketplace.connect(seller).listNFT(await nft.getAddress(), 1, salePrice);
      // Cancel
      await expect(
        marketplace.connect(seller).cancelListing(1)
      ).to.emit(marketplace, "ListingCanceled");

      // Verify NFT returned to seller
      expect(await nft.ownerOf(1)).to.equal(seller.address);
    });
  });
});
