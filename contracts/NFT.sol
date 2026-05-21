// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CyberNFT
 * @author CyberSpace Labs
 * @notice Standard ERC721 NFT contract with royalty support (ERC2981)
 */
contract CyberNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId;
    address public marketplaceAddress;

    // Custom errors
    error URIEmpty();
    error RoyaltyFeeTooHigh();

    event NFTMinted(
        uint256 indexed tokenId, 
        string tokenURI, 
        address indexed creator, 
        address indexed royaltyReceiver, 
        uint96 royaltyFeeBps
    );

    constructor(address _marketplaceAddress) 
        ERC721("CyberSpace NFT", "CYBER") 
        Ownable(msg.sender) 
    {
        marketplaceAddress = _marketplaceAddress;
        // Set default royalty to 5% (500 basis points)
        _setDefaultRoyalty(msg.sender, 500);
    }

    /**
     * @notice Mints a new NFT to the creator
     * @param tokenURI The metadata URL on IPFS
     * @param royaltyReceiver The address to receive royalty payments
     * @param royaltyFeeBps Royalty basis points (e.g., 500 = 5%)
     */
    function mint(
        string memory tokenURI, 
        address royaltyReceiver, 
        uint96 royaltyFeeBps
    ) public returns (uint256) {
        if (bytes(tokenURI).length == 0) revert URIEmpty();
        if (royaltyFeeBps > 2000) revert RoyaltyFeeTooHigh(); // max 20%

        _nextTokenId++;
        uint256 newItemId = _nextTokenId;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        if (royaltyReceiver != address(0) && royaltyFeeBps > 0) {
            _setTokenRoyalty(newItemId, royaltyReceiver, royaltyFeeBps);
        }

        // Approve marketplace to transfer this token
        approve(marketplaceAddress, newItemId);

        emit NFTMinted(newItemId, tokenURI, msg.sender, royaltyReceiver, royaltyFeeBps);
        
        return newItemId;
    }

    /**
     * @notice Override to support ERC721 and ERC2981 interfaces
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
