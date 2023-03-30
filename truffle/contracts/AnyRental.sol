// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IAnyRental.sol";
import "./AnyNFTCollectionFactory.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./Utils.sol";

contract AnyRental is Ownable, IAnyRental{

    AnyNFTCollectionFactory public factory;

    // Rentals : a user rent some tools
    mapping (address => Rental[]) private rentals;

    //renter : for an address => NFT collection Address
    mapping (address => address) private rentersCollection;


    constructor(){
        factory = new AnyNFTCollectionFactory();
    }



 /*  
    /* ***********************************************
    *   Modifiers 
    *********************************************** */

    /// @dev check that a a renter can create only one collection and is no address 0
    modifier onlyOneCollectionByRenter() {
        require(msg.sender != address(0), "address zero is not valid");
        require(rentersCollection[msg.sender]==address(0), "You already have created your collection");
        _;
    }

    
   function createNFTCollection(string memory _renterCollectionName, string memory _renterCollectionSymbol) external onlyOneCollectionByRenter returns (address collectionAddress) {
        require(keccak256(abi.encode(_renterCollectionName)) != keccak256(abi.encode("")), "Collection name can't be empty");
        require(keccak256(abi.encode(_renterCollectionSymbol)) != keccak256(abi.encode("")), "Collection symbol can't be empty");

       AnyNFTCollection collection = new AnyNFTCollection(_renterCollectionName, _renterCollectionSymbol, msg.sender);
       _rentersCollection[msg.sender]=address(collection);

        //Could use transferOwnerShip but want to differentiate the roles
        // maybee need owner methods to manage collections
        //collection.transferOwnership(msg.sender);

       emit NFTCollectionCreated(msg.sender, _renterCollectionName, collectionAddress, block.timestamp);
        
        return address(collection);
    }


    function getRenterNFTCollection(address _address) public view returns (address) {
        //pour le moment address
        //return NFTCollection.getUserNFT(_address);
    }

*/


  
}
