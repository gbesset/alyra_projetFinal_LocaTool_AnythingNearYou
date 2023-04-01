// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IAnyRental.sol";
import "./IAnyNFTCollection.sol";
import "./AnyNFTCollection.sol";
//import "./AnyNFTCollectionFactory.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./Utils.sol";
import "../node_modules/@ganache/console.log/console.sol";

/**
 * @title Rental Any  contract 
 * @author https://github.com/gbesset
 * @notice contract to generate NFT of tool to locate, and manage the rental
 * @dev Implements NFT gneration, and rental process
 */
contract AnyRental is Ownable, IAnyRental{

   using Counters for Counters.Counter;

    //AnyNFTCollectionFactory public factory;

    Counters.Counter private rentalIds;

    // TODO a supprimer ??
    Rental[] rentals;


    // mapping of  a user address to the rented tools
    mapping (address => Rental[]) private userRentals;



    // list of all the renters address
    address[] rentersList;

    // mapping of a renter address to its collection
    mapping (address => CollectionNFT) private rentersCollection;
    
    // mapping of a renter address to its rentals
    mapping (address => Rental[]) private rentersRentals;
    uint256 public constant MAX_TOOLS = 3;



    constructor(){
        // Instantiate and deploy NFT Factory
        //factory = new AnyNFTCollectionFactory();
    }


    /* ***********************************************
    *   Modifiers 
    *********************************************** */

    /**
    * @dev Only renter can call
    */

    modifier onlyRenter() {
        require(rentersCollection[msg.sender].owner==msg.sender, "You are not the renter of the collection");
        _;
    }



    /* ***********************************************
    *   Getters 
    *********************************************** */
     /**
     * @dev get collection from renter Address
     */
    function getCollection(address renter) external view returns(Utils.Tool[] memory){
        //return factory._rentersCollection().tools();
        IAnyNFTCollection collec = IAnyNFTCollection(rentersCollection[renter].collection);
        return collec.getTools();
    }

    function getCollectionAddress(address renter) external view returns(address){
        return rentersCollection[renter].collection;
    }

    function getCollections()external view returns(Utils.Tool[] memory){
        // pour toutes les addresses
        // concatener les collections
        // renvoyer l'ensemble
        //ou en js appeler les differentes collections pour les addresses..?
    }



    /* ***********************************************
    *   Functions 
    *********************************************** */
    /**
     * @notice Create the NFT Collection of a renter
     * @return collectionCreated : colletion address deployed
     */
    function createCollection(string memory _collectionName) external returns(address){
        require(msg.sender != address(0), "address zero is not valid");
        require(rentersCollection[msg.sender].collection==address(0), "You already have created your collection");
        require(!Utils.isEqualString(_collectionName,""), "collection name can't be empty");

        AnyNFTCollection collectionCreated  = new AnyNFTCollection(_collectionName, "ANY");
        
        // update Renters Collection
        rentersCollection[msg.sender].collection = address(collectionCreated);
        rentersCollection[msg.sender].owner =  msg.sender;

        //update the list of renters
        rentersList.push(msg.sender);

        emit NFTCollectionCreated(msg.sender, _collectionName , address(collectionCreated), block.timestamp);
        collectionCreated.transferOwnership(msg.sender);
        return address(collectionCreated);
    }

    /**
     * @notice drenter delete its NFT Collection of a
     */
    function deleteCollection() external {
        require(msg.sender != address(0), "address zero is not valid");
        require(rentersCollection[msg.sender].collection!=address(0), "You don't have any collection");
      
        AnyNFTCollection collec = AnyNFTCollection(rentersCollection[msg.sender].collection);

        uint id;
         for (uint i; i < rentersList.length; i++) {
            if(rentersList[i] == msg.sender){
                id=i;
                break;
            }
        }

        //delete element in list of renters
        rentersList[id] = rentersList[rentersList.length-1];
        rentersList.pop();

        //delete rentals in mapping 
        delete rentersCollection[msg.sender];
        /*
        //TODO supprimer l'instance en transféréant au préalbale les fonds présents....
        selfdestruct(collec);
       */
        emit NFTCollectionDeleted(msg.sender , address(collec), block.timestamp);

    }


    function addToolToCollection(string calldata _tokenURI, uint _serialId, string memory _title, string memory _description ) external returns(uint tokenId){
        require(rentersCollection[msg.sender].collection!=address(0), "You don't have any collection");
        //require(rentersCollection[msg.sender].owner==msg.sender, "You are not the owner of the collection");
        require(rentersRentals[msg.sender].length < MAX_TOOLS, "Maximum number of tools reached");
        
        IAnyNFTCollection collec = IAnyNFTCollection(rentersCollection[msg.sender].collection);
        uint256 tokenID = collec.mint(_tokenURI, _serialId, _title, _description, msg.sender);


        emit NFTToolAddedToCollection(msg.sender, rentersCollection[msg.sender].collection, tokenID, block.timestamp);
        return tokenID;
    }
    function addToolToRentals(Rental memory _rental, uint _tokenID, string memory _tokenURI) external {
        require(rentersCollection[msg.sender].collection!=address(0), "You don't have any collection");
        require(rentersRentals[msg.sender].length < MAX_TOOLS, "Maximum number of tools reached");

         uint newRentalIds = rentalIds.current();

        Rental memory rental;
        rental.rentalID = newRentalIds;
        rental.dayPrice = _rental.dayPrice;
        rental.caution = _rental.caution;
        rental.start = _rental.start;
        rental.end = _rental.end;
        rental.rentalStatus = RentalStatus.AVAILABLE;
        rental.isCautionDeposed = false;
        rental.isNFTDelegated = false;
        rental.isDispute = false;
        rental.isRedeemed = false;
        rental.collection = rentersCollection[msg.sender];
        rental.tokenID = _tokenID;
        rental.tokenURI = _tokenURI; 

        rentersRentals[msg.sender].push(rental);

        rentalIds.increment();
        emit ToolAddedToRentals(msg.sender, newRentalIds , block.timestamp);
    }


    /**
     * @dev delete a tool into collection . onlyRenter
     */
     /*function deleteToolIntoCollection(uint _tokenID)external {
         require(rentals[msg.sender].length < MAX_TOOLS, "Maximum number of tools reached");
        
        IAnyNFTCollection collec = IAnyNFTCollection(rentersCollection[msg.sender].collection);

         collec.burn(_tokenID, msg.sender);

        emit NFTToolDeletedFromCollection(msg.sender, rentersCollection[msg.sender].collection, _tokenID, block.timestamp);
     }*/

    /**
     * @dev delegate the NFT to a user . onlyRenter
     */
    function delegateNFT(uint _tokenId, address _to, uint64 _expires) external {
        require(rentersCollection[msg.sender].collection!=address(0), "You don't have any collection");
        require(rentersCollection[msg.sender].owner==msg.sender, "You are not the owner of the collection");

        
        //Si pas de approve passer par I
         AnyNFTCollection collec = AnyNFTCollection(rentersCollection[msg.sender].collection);
        
        //collec.approve(msg.sender, _tokenId);
         collec.rentTool(_tokenId, _to, _expires, msg.sender);

        emit rentalNFTToolDelegated(msg.sender, _to, rentersCollection[msg.sender].collection, _tokenId, block.timestamp);
    }

  
}
