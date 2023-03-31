pragma solidity 0.8.19;

import "./AnyNFTCollection.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract AnyNFTCollectionFactory is Ownable{


    /// @dev define renter address => collection address
    mapping (address => address) public _rentersCollection;

    event NFTCollectionCreated(address renter, string renterCollectionName, address renterCollectionAddress, uint timestamp);
    
    
    /// @dev check thata a renter can create only one collection and is no address 0
    modifier onlyOneCollectionByRenter() {
        require(msg.sender != address(0), "address zero is not valid");
        require(_rentersCollection[msg.sender]==address(0), "You already have created your collection");
        _;
    }

    
   function createNFTCollection(address _renter, string memory _renterCollectionName, string memory _renterCollectionSymbol) external onlyOneCollectionByRenter returns (address collectionAddress) {
        require(!Utils.isEqualString(_renterCollectionName,""), "collection name can't be empty");
        require(!Utils.isEqualString(_renterCollectionSymbol,""), "collection symbol can't be empty");
        
       AnyNFTCollection collection = new AnyNFTCollection(_renterCollectionName, _renterCollectionSymbol, _renter);
       _rentersCollection[_renter]=address(collection);

        //Could use transferOwnerShip but want to differentiate the roles
        // maybee need owner methods to manage collections
        //collection.transferOwnership(msg.sender);

       emit NFTCollectionCreated(_renter, _renterCollectionName, collectionAddress, block.timestamp);
        
        return address(collection);
    }


    /*
      owner method in case of trouble on collections
    */
}
