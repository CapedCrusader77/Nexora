// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title CyberNFTMarketplace
 * @author CyberSpace Labs
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
    
    // Platform fee percentage (e.g. 250 bps = 2.5%)
    uint256 public platformFeeBps = 250; 
    address payable public platformFeeRecipient;

    // Pause state
    bool public paused;

    // ListingId => Listing details
    mapping(uint256 => Listing) private _listings;
    // nftContract => tokenId => listingId
    mapping(address => mapping(uint256 => uint256)) private _activeListings;

    // Custom errors
    error PriceMustBeGreaterThanZero();
    error NotNFTOwner();
    error MarketplaceNotApproved();
    error ListingNotActive();
    error InsufficientPayment(uint256 sent, uint256 expected);
    error InvalidPlatformFeeRecipient();
    error FeeTooHigh();
    error TransferFailed();
    error ContractPaused();

    event NFTListed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event NFTSold(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
        uint256 royaltyPaid,
        address royaltyReceiver
    );

    event ListingCanceled(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller
    );

    event PauseStateChanged(bool isPaused);

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    constructor() Ownable(msg.sender) {
        platformFeeRecipient = payable(msg.sender);
    }

    /**
     * @notice Updates the marketplace fee rate
     * @param _feeBps Fee in basis points (e.g. 250 for 2.5%)
     */
    function setPlatformFeeBps(uint256 _feeBps) external onlyOwner {
        if (_feeBps > 1000) revert FeeTooHigh(); // Fee cannot exceed 10%
        platformFeeBps = _feeBps;
    }

    /**
     * @notice Updates the recipient of marketplace fees
     */
    function setPlatformFeeRecipient(address payable _recipient) external onlyOwner {
        if (_recipient == address(0)) revert InvalidPlatformFeeRecipient();
        platformFeeRecipient = _recipient;
    }

    /**
     * @notice Pauses/unpauses the marketplace
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PauseStateChanged(_paused);
    }

    /**
     * @notice Places an NFT on the marketplace list
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant whenNotPaused {
        if (price == 0) revert PriceMustBeGreaterThanZero();
        
        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotNFTOwner();
        
        if (!nft.isApprovedForAll(msg.sender, address(this)) && 
            nft.getApproved(tokenId) != address(this)) {
            revert MarketplaceNotApproved();
        }

        _listingIds++;
        uint256 listingId = _listingIds;

        _listings[listingId] = Listing(
            listingId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            true
        );

        _activeListings[nftContract][tokenId] = listingId;

        // Escrow the NFT in the marketplace contract
        nft.transferFrom(msg.sender, address(this), tokenId);

        emit NFTListed(listingId, nftContract, tokenId, msg.sender, price);
    }

    /**
     * @notice Purchases a listed NFT, distributing platform fees and royalties
     */
    function buyNFT(uint256 listingId) external payable nonReentrant whenNotPaused {
        Listing storage listing = _listings[listingId];
        if (!listing.isActive || listing.isSold) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment(msg.value, listing.price);

        listing.isSold = true;
        listing.isActive = false;
        listing.owner = payable(msg.sender);
        _itemsSold++;

        // Calculate marketplace platform fee
        uint256 fee = (listing.price * platformFeeBps) / 10000;
        uint256 remainingAmount = msg.value - fee;

        // Query royalty info using ERC2981
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        try IERC2981(listing.nftContract).royaltyInfo(listing.tokenId, listing.price) returns (
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
        } catch {
            // Contract doesn't support ERC2981 royalties
        }

        // Pay marketplace fee
        if (fee > 0) {
            (bool success, ) = platformFeeRecipient.call{value: fee}("");
            if (!success) revert TransferFailed();
        }

        // Pay royalty to creator
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool success, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            if (!success) revert TransferFailed();
        }

        // Pay seller
        if (remainingAmount > 0) {
            (bool success, ) = listing.seller.call{value: remainingAmount}("");
            if (!success) revert TransferFailed();
        }

        // Transfer NFT to the buyer
        IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);

        delete _activeListings[listing.nftContract][listing.tokenId];

        emit NFTSold(
            listingId,
            listing.nftContract,
            listing.tokenId,
            listing.seller,
            msg.sender,
            listing.price,
            royaltyAmount,
            royaltyReceiver
        );

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            if (!success) revert TransferFailed();
        }
    }

    /**
     * @notice Cancels an active listing, returning the NFT to the seller
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = _listings[listingId];
        if (!listing.isActive || listing.isSold) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotNFTOwner();

        listing.isActive = false;

        // Return NFT to the seller
        IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);

        delete _activeListings[listing.nftContract][listing.tokenId];

        emit ListingCanceled(listingId, listing.nftContract, listing.tokenId, msg.sender);
    }

    /**
     * @notice Fetch a single listing by ID
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return _listings[listingId];
    }

    /**
     * @notice Fetch all active listings
     */
    function fetchMarketItems() external view returns (Listing[] memory) {
        uint256 totalItemCount = _listingIds;
        uint256 activeCount = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_listings[i].isActive) {
                activeCount++;
            }
        }

        Listing[] memory items = new Listing[](activeCount);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_listings[i].isActive) {
                items[currentIndex] = _listings[i];
                currentIndex++;
            }
        }
        return items;
    }
}
