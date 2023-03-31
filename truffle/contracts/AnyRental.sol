// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IAnyRental.sol";
import "./IAnyNFTCollection.sol";
import "./AnyNFTCollection.sol";
//import "./AnyNFTCollectionFactory.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./Utils.sol";


/**
 * @title Rental Any  contract 
 * @author https://github.com/gbesset
 * @notice contract to generate NFT of tool to locate, and manage the rental
 * @dev Implements NFT gneration, and rental process
 */
contract AnyRental is Ownable, IAnyRental{

    //AnyNFTCollectionFactory public factory;

    // mapping of  a user address to the rented tools
    mapping (address => Rental[]) private rentals;
    uint256 public constant MAX_TOOLS = 100;

    // mapping of a renter address to the NFT Collection address
    mapping (address => address) private rentersCollection;


    constructor(){
        // Instantiate and deploy NFT Factory
        //factory = new AnyNFTCollectionFactory();
    }



 /*  
    /* ***********************************************
    *   Modifiers 
    *********************************************** */

//TODO ????
    /// @dev check that a a renter can create only one collection and is no address 0
    modifier onlyOneCollectionByRenter() {
        require(msg.sender != address(0), "address zero is not valid");
        require(rentersCollection[msg.sender]==address(0), "You already have created your collection");
        _;
    }

    /**
     * @notice Create the NFT Collection of a renter
     * @return collectionCreated : colletion address deployed
     */
    function createCollection(string memory _collectionName) external returns(address collectionCreated){
        require(msg.sender != address(0), "address zero is not valid");
        require(rentersCollection[msg.sender]==address(0), "You already have created your collection");
        require(!Utils.isEqualString(_collectionName,""), "collection name can't be empty");

        AnyNFTCollection collectionCreated  = new AnyNFTCollection(_collectionName, "ANY", msg.sender);
        rentersCollection[msg.sender]=address(collectionCreated);

        emit NFTCollectionCreated(msg.sender, "Any Collection" , address(collectionCreated), block.timestamp);
        return address(collectionCreated);
    }


  /**
     * @dev get collection from renter Address
     */
    function getCollection(address renter) external view returns(Utils.Tool[] memory){
        //return factory._rentersCollection().tools();
        IAnyNFTCollection collec = IAnyNFTCollection(rentersCollection[renter]);
        return collec.getTools();
    }

    function getCollectionAddress(address renter) external view returns(address){
        return rentersCollection[renter];
    }

    function getCollections()external view returns(Utils.Tool[] memory){
        // pour toutes les addresses
        // concatener les collections
        // renvoyer l'ensemble
        //ou en js appeler les differentes collections pour les addresses..?
    }


    //function addToolToCollection(Utils.Tool memory _tool, string memory _tokenURI ) external returns(uint tokenId){
    function addToolToCollection(string calldata _tokenURI, uint _serialId, string memory _title, string memory _description ) external returns(uint tokenId){
        require(rentals[msg.sender].length < MAX_TOOLS, "Maximum number of tools reached");
        
        IAnyNFTCollection collec = IAnyNFTCollection(rentersCollection[msg.sender]);
        //uint256 tokenID = collec.mint(_tokenURI, _tool.serialID, _tool.title, _tool.description);
        uint256 tokenID = collec.mint(_tokenURI, _serialId, _title, _description, msg.sender);

        emit NFTToolAddedToCollection(msg.sender, rentersCollection[msg.sender], tokenID, block.timestamp);
        return tokenID;
    }

    /**
     * @dev delete a tool into collection . onlyRenter
     */
     /*function deleteToolIntoCollection(uint _tokenID)external {
         require(rentals[msg.sender].length < MAX_TOOLS, "Maximum number of tools reached");
        
        IAnyNFTCollection collec = IAnyNFTCollection(rentersCollection[msg.sender]);

         collec.burn(_tokenID, msg.sender);

        emit NFTToolDeletedFromCollection(msg.sender, rentersCollection[msg.sender], _tokenID, block.timestamp);
     }*/

    /**
     * @dev delegate the NFT to a user . onlyRenter
     */
    function delegateNFT(uint _tokenId, address _to, uint64 _expires) external {
        require(rentersCollection[msg.sender]!=address(0), "No NFT collection for this user");
        
        //Si pas de approve passer par I
         AnyNFTCollection collec = AnyNFTCollection(rentersCollection[msg.sender]);
 
        //collec.approve(msg.sender, _tokenId);
         collec.rentTool(_tokenId, _to, _expires, msg.sender);

        emit rentalNFTToolDelegated(msg.sender, _to, rentersCollection[msg.sender], _tokenId, block.timestamp);
    }

  
}
