// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title CyberNFTAuction
 * @author CyberSpace Labs
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
    
    // Platform fee basis points (e.g. 2.5% = 250 bps)
    uint256 public platformFeeBps = 250;
    address payable public platformFeeRecipient;

    // Pause state
    bool public paused;

    // Auction ID => Auction details
    mapping(uint256 => Auction) private _auctions;
    // nftContract => tokenId => auctionId
    mapping(address => mapping(uint256 => uint256)) private _activeAuctions;

    // User address => pending withdrawals for outbid amounts
    mapping(address => uint256) private _pendingWithdrawals;

    // Custom errors
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

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 minBid,
        uint256 endTime,
        address seller
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address winner,
        uint256 amount,
        uint256 royaltyPaid,
        address royaltyReceiver
    );

    event AuctionCanceled(uint256 indexed auctionId);
    event PauseStateChanged(bool isPaused);

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    constructor(address payable _feeRecipient) Ownable(msg.sender) {
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        platformFeeRecipient = _feeRecipient;
    }

    /**
     * @notice Updates the auction fee rate
     */
    function setPlatformFeeBps(uint256 _feeBps) external onlyOwner {
        if (_feeBps > 1000) revert FeeTooHigh();
        platformFeeBps = _feeBps;
    }

    /**
     * @notice Updates the recipient of marketplace fees
     */
    function setPlatformFeeRecipient(address payable _recipient) external onlyOwner {
        if (_recipient == address(0)) revert InvalidFeeRecipient();
        platformFeeRecipient = _recipient;
    }

    /**
     * @notice Pauses/unpauses auction creations and bidding
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PauseStateChanged(_paused);
    }

    /**
     * @notice Create an auction for an NFT
     * @param nftContract Address of the ERC721 NFT contract
     * @param tokenId ID of the token
     * @param minBid Minimum bid amount in Wei
     * @param duration Duration of the auction in seconds
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 minBid,
        uint256 duration
    ) external nonReentrant whenNotPaused {
        if (minBid == 0) revert PriceMustBeGreaterThanZero();
        if (duration < 60) revert DurationTooShort(); // at least 1 minute

        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotNFTOwner();
        if (!nft.isApprovedForAll(msg.sender, address(this)) && 
            nft.getApproved(tokenId) != address(this)) {
            revert AuctionNotApproved();
        }

        _auctionIds++;
        uint256 auctionId = _auctionIds;

        _auctions[auctionId] = Auction(
            auctionId,
            nftContract,
            tokenId,
            payable(msg.sender),
            minBid,
            block.timestamp + duration,
            payable(address(0)),
            0,
            true,
            false
        );

        _activeAuctions[nftContract][tokenId] = auctionId;

        // Escrow the NFT in this contract
        nft.transferFrom(msg.sender, address(this), tokenId);

        emit AuctionCreated(auctionId, nftContract, tokenId, minBid, block.timestamp + duration, msg.sender);
    }

    /**
     * @notice Place a bid on an active auction
     */
    function placeBid(uint256 auctionId) external payable nonReentrant whenNotPaused {
        Auction storage auction = _auctions[auctionId];
        if (!auction.isActive || auction.isEnded) revert AuctionNotActive();
        if (block.timestamp >= auction.endTime) revert AuctionHasEnded();
        
        uint256 minRequiredBid = auction.highestBid == 0 
            ? auction.minBid 
            : auction.highestBid + (auction.highestBid * 5 / 100); // 5% bid increment
        
        if (msg.value < minRequiredBid) revert BidTooLow(msg.value, minRequiredBid);

        // Refund the previous highest bidder
        if (auction.highestBidder != address(0)) {
            _pendingWithdrawals[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * @notice Withdraw funds from being outbid
     */
    function withdrawRefund() external nonReentrant {
        uint256 amount = _pendingWithdrawals[msg.sender];
        if (amount == 0) revert NoRefundAvailable();

        _pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Complete an auction, transfer NFT to winner, pay seller and royalty
     */
    function endAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = _auctions[auctionId];
        if (!auction.isActive || auction.isEnded) revert AuctionNotActive();
        if (block.timestamp < auction.endTime) revert AuctionNotEnded();

        auction.isActive = false;
        auction.isEnded = true;

        IERC721 nft = IERC721(auction.nftContract);

        if (auction.highestBidder == address(0)) {
            // No bids, return NFT to the seller
            nft.transferFrom(address(this), auction.seller, auction.tokenId);
            emit AuctionEnded(auctionId, address(0), 0, 0, address(0));
        } else {
            // Calculate fees and royalties
            uint256 fee = (auction.highestBid * platformFeeBps) / 10000;
            uint256 remainingAmount = auction.highestBid - fee;

            // Royalty distribution (ERC2981)
            uint256 royaltyAmount = 0;
            address royaltyReceiver = address(0);
            try IERC2981(auction.nftContract).royaltyInfo(auction.tokenId, auction.highestBid) returns (
                address receiver,
                uint256 amount
            ) {
                if (receiver != address(0) && amount > 0) {
                    royaltyReceiver = receiver;
                    royaltyAmount = amount;
                    if (royaltyAmount > remainingAmount) {
                        royaltyAmount = remainingAmount;
                    }
                    remainingAmount -= royaltyAmount;
                }
            } catch {}

            // Transfer platform fee
            if (fee > 0) {
                (bool success, ) = platformFeeRecipient.call{value: fee}("");
                if (!success) revert TransferFailed();
            }

            // Transfer royalty fee
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                (bool success, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
                if (!success) revert TransferFailed();
            }

            // Pay seller
            if (remainingAmount > 0) {
                (bool success, ) = auction.seller.call{value: remainingAmount}("");
                if (!success) revert TransferFailed();
            }

            // Transfer NFT to the highest bidder (winner)
            nft.transferFrom(address(this), auction.highestBidder, auction.tokenId);

            emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid, royaltyAmount, royaltyReceiver);
        }

        delete _activeAuctions[auction.nftContract][auction.tokenId];
    }

    /**
     * @notice Cancel an auction if no bids have been placed yet
     */
    function cancelAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = _auctions[auctionId];
        if (!auction.isActive || auction.isEnded) revert AuctionNotActive();
        if (auction.seller != msg.sender) revert NotNFTOwner();
        if (auction.highestBidder != address(0)) revert CannotCancelWithBids();

        auction.isActive = false;
        auction.isEnded = true;

        // Return NFT
        IERC721(auction.nftContract).transferFrom(address(this), auction.seller, auction.tokenId);

        delete _activeAuctions[auction.nftContract][auction.tokenId];

        emit AuctionCanceled(auctionId);
    }

    // View functions
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return _auctions[auctionId];
    }

    function checkPendingRefund(address user) external view returns (uint256) {
        return _pendingWithdrawals[user];
    }
}
