pragma solidity 0.8.19;

import "./AnyNFTCollection.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract AnyNFTCollectionFactory is Ownable{


    event NFTCollectionCreated(address renter, string renterCollectionName, string renterCollectionSymbol, address renterCollectionAddress, uint timestamp);
    

   function createAnyNFTCollection(address _renter, string memory _renterCollectionName, string memory _renterCollectionSymbol) external onlyOwner returns (address collectionAddress) {
        require(_renter != address(0), "address zero is not valid");
        require(!Utils.isEqualString(_renterCollectionName,""), "collection name can't be empty");
        require(!Utils.isEqualString(_renterCollectionSymbol,""), "collection symbol can't be empty");

        AnyNFTCollection collectionCreated  = new AnyNFTCollection(_renterCollectionName, _renterCollectionSymbol);

        emit NFTCollectionCreated(_renter, _renterCollectionName, _renterCollectionSymbol,  collectionAddress, block.timestamp);

        collectionCreated.setFactoryAddress(msg.sender);
        collectionCreated.transferOwnership(_renter);
        return address(collectionCreated);
    }

}
