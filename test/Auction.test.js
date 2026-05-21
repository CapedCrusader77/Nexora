const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CyberSpace NFT Auction", function () {
  let NFT;
  let nft;
  let Auction;
  let auction;
  let owner;
  let seller;
  let bidder1;
  let bidder2;
  let royaltyReceiver;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, royaltyReceiver] = await ethers.getSigners();

    // Deploy Auction
    Auction = await ethers.getContractFactory("CyberNFTAuction");
    auction = await Auction.deploy(owner.address);
    await auction.waitForDeployment();

    // Deploy NFT
    NFT = await ethers.getContractFactory("CyberNFT");
    nft = await NFT.deploy(await auction.getAddress());
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner for the auction contract", async function () {
      expect(await auction.owner()).to.equal(owner.address);
    });

    it("Should set the right platform fee recipient", async function () {
      expect(await auction.platformFeeRecipient()).to.equal(owner.address);
    });
  });

  describe("Auction Operations", function () {
    const tokenURI = "ipfs://QmMetadataCID";
    const royaltyFeeBps = 500; // 5%
    const minBid = ethers.parseEther("1"); // 1 ETH
    const duration = 3600; // 1 hour

    beforeEach(async function () {
      // Mint NFT
      await nft.connect(seller).mint(tokenURI, royaltyReceiver.address, royaltyFeeBps);
      // Approve auction house to transfer the token
      await nft.connect(seller).approve(await auction.getAddress(), 1);
    });

    it("Should create an auction and escrow the NFT", async function () {
      await expect(
        auction.connect(seller).createAuction(await nft.getAddress(), 1, minBid, duration)
      ).to.emit(auction, "AuctionCreated");

      // Verify that auction contract now owns the NFT
      expect(await nft.ownerOf(1)).to.equal(await auction.getAddress());

      const activeAuction = await auction.getAuction(1);
      expect(activeAuction.isActive).to.be.true;
      expect(activeAuction.seller).to.equal(seller.address);
      expect(activeAuction.minBid).to.equal(minBid);
    });

    it("Should allow placing bids and refunding previous bidders", async function () {
      // Create auction
      await auction.connect(seller).createAuction(await nft.getAddress(), 1, minBid, duration);

      // Bidder 1 places bid of 1 ETH
      await expect(
        auction.connect(bidder1).placeBid(1, { value: ethers.parseEther("1") })
      ).to.emit(auction, "BidPlaced");

      const auctionAfterBid1 = await auction.getAuction(1);
      expect(auctionAfterBid1.highestBidder).to.equal(bidder1.address);
      expect(auctionAfterBid1.highestBid).to.equal(ethers.parseEther("1"));

      // Bidder 2 tries to bid less than 1.05 ETH (must be 5% higher than 1 ETH)
      await expect(
        auction.connect(bidder2).placeBid(1, { value: ethers.parseEther("1.04") })
      ).to.be.revertedWithCustomError(auction, "BidTooLow");

      // Bidder 2 places bid of 1.1 ETH
      await expect(
        auction.connect(bidder2).placeBid(1, { value: ethers.parseEther("1.1") })
      ).to.emit(auction, "BidPlaced");

      // Check that bidder 1 has pending refund
      const refund = await auction.checkPendingRefund(bidder1.address);
      expect(refund).to.equal(ethers.parseEther("1"));

      // Bidder 1 withdraws refund
      const initialBalance = await ethers.provider.getBalance(bidder1.address);
      const tx = await auction.connect(bidder1).withdrawRefund();
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(bidder1.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("1") - gasSpent);
    });

    it("Should distribute payments correctly on auction completion", async function () {
      // Create auction
      await auction.connect(seller).createAuction(await nft.getAddress(), 1, minBid, duration);

      // Bidder 2 places bid of 2 ETH
      await auction.connect(bidder2).placeBid(1, { value: ethers.parseEther("2") });

      // Fast forward time to end the auction
      await ethers.provider.send("evm_increaseTime", [duration + 10]);
      await ethers.provider.send("evm_mine");

      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      const initialRoyaltyBalance = await ethers.provider.getBalance(royaltyReceiver.address);

      // End auction
      await expect(
        auction.connect(owner).endAuction(1)
      ).to.emit(auction, "AuctionEnded");

      // Verify that bidder 2 is now the owner of the NFT
      expect(await nft.ownerOf(1)).to.equal(bidder2.address);

      // Platform fee (2.5% of 2 ETH = 0.05 ETH)
      // Royalty fee (5% of 2 ETH = 0.1 ETH)
      // Seller profit (2 ETH - 0.05 ETH - 0.1 ETH = 1.85 ETH)
      const expectedSellerProfit = ethers.parseEther("1.85");
      const expectedRoyalty = ethers.parseEther("0.1");

      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      const finalRoyaltyBalance = await ethers.provider.getBalance(royaltyReceiver.address);

      expect(finalSellerBalance - initialSellerBalance).to.equal(expectedSellerProfit);
      expect(finalRoyaltyBalance - initialRoyaltyBalance).to.equal(expectedRoyalty);
    });

    it("Should allow canceling the auction before any bids", async function () {
      await auction.connect(seller).createAuction(await nft.getAddress(), 1, minBid, duration);

      // Cancel auction
      await expect(
        auction.connect(seller).cancelAuction(1)
      ).to.emit(auction, "AuctionCanceled");

      // Verify NFT returned to seller
      expect(await nft.ownerOf(1)).to.equal(seller.address);
    });

    it("Should prevent canceling the auction after a bid has been placed", async function () {
      await auction.connect(seller).createAuction(await nft.getAddress(), 1, minBid, duration);
      await auction.connect(bidder1).placeBid(1, { value: ethers.parseEther("1") });

      await expect(
        auction.connect(seller).cancelAuction(1)
      ).to.be.revertedWithCustomError(auction, "CannotCancelWithBids");
    });
  });
});
