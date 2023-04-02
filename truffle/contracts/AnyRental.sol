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
    mapping (address => Rental[]) public rentersRentals;
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
    function getToolsCollection(address _renter) external view returns(Utils.Tool[] memory){
        //return factory._rentersCollection().tools();
        IAnyNFTCollection collec = IAnyNFTCollection(rentersCollection[_renter].collection);
        return collec.getTools();
    }

    function getToolsCollectionAddress(address _renter) external view returns(address){
        return rentersCollection[_renter].collection;
    }

    /*function getCollections()external view returns(Utils.Tool[] memory){
        // pour toutes les addresses
        // concatener les collections
        // renvoyer l'ensemble
        //ou en js appeler les differentes collections pour les addresses..?
    }*/

    function getRenterTools(address _renter) external view returns(Rental[] memory){
        return rentersRentals[_renter];
    }
    function getRenterToolByID(address _renter, uint _rentalId) external view returns(Rental memory){
        uint found;
         for(uint i; i< rentersRentals[msg.sender].length; i++){
            if(rentersRentals[msg.sender][i].rentalID == _rentalId){
                 found=i;
            }   
        }
        return rentersRentals[_renter][found];
    }
    



    /* ***********************************************
    *   Functions  - NFT Managment
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


    /* ***********************************************
    *   Functions  - Rental Managment
    *********************************************** */

    function addToolToRentals(uint64 _dayPrice, uint64 _caution, uint _tokenID, string memory _tokenURI) external {
        require(rentersCollection[msg.sender].collection!=address(0), "You don't have any collection");
        require(rentersRentals[msg.sender].length < MAX_TOOLS, "Maximum number of tools reached");
        require(_dayPrice > 0, "number must be > 0");
        require(_caution > 0, "number must be > 0");

         uint newRentalIds = rentalIds.current();

        CollectionNFT memory collec;
        collec.collection = rentersCollection[msg.sender].collection;
        collec.owner = rentersCollection[msg.sender].owner;

        Rental memory rental;
        rental.rentalID = newRentalIds;
        rental.dayPrice =_dayPrice;
        rental.caution = _caution;
        rental.rentalStatus = RentalStatus.AVAILABLE;
        rental.isCautionDeposed = false;
        rental.isNFTDelegated = false;
        rental.isDispute = false;
        rental.isRedeemed = false;
        rental.collection = collec;
        rental.tokenID = _tokenID;
        rental.tokenURI = _tokenURI; 

        rentersRentals[msg.sender].push(rental);

        rentalIds.increment();
        emit ToolAddedToRentals(msg.sender, newRentalIds , block.timestamp);
    }

     /**
     * @dev update a tool into collection . onlyRenter
     */
     function updateToolIntoRentals(uint _rentalID, uint64 _dayPrice, uint64 _caution) external{
        require(rentersCollection[msg.sender].collection!=address(0), "You don't have any collection");
        require(_dayPrice > 0, "number must be > 0");
        require(_caution > 0, "number must be > 0");

        for(uint i; i< rentersRentals[msg.sender].length; i++){
            if(rentersRentals[msg.sender][i].rentalID == _rentalID){
                 rentersRentals[msg.sender][i].dayPrice = _dayPrice;
                 rentersRentals[msg.sender][i].caution = _caution;
                 break;
            }   
        }

        emit ToolUpdatedFromRentals(msg.sender, _rentalID, block.timestamp);
     }
      /**
     * @dev delete a tool into collection . onlyRenter
     */
     function deleteToolIntoRentals(uint _rentalID) external{
        require(rentersRentals[msg.sender].length < MAX_TOOLS, "Maximum number of tools reached");
        
        uint id;
        for(uint i; i< rentersRentals[msg.sender].length; i++){
            if(rentersRentals[msg.sender][i].rentalID == _rentalID){
                id = i;
                 break;
            }   
        }
        rentersRentals[msg.sender][id] = rentersRentals[msg.sender][rentersRentals[msg.sender].length-1];
        rentersRentals[msg.sender].pop();


         
        emit ToolDeletedFromRentals(msg.sender, _rentalID, block.timestamp);
     }


 /**
     * @notice user send thr location and caution which in order to ask for the rental of a Rental
     * - the caution and location is secured until
     * @dev user send caution and location price for rent a Rental
     */
     function sendPaiementForRental(uint _rentalID) external{
        //TODO
     }

   /**
     * @notice renter delegate the NFT in order to validate the rental asking
     * - the caution and location is still secured
     * @dev renter validate the delagation of the NFT
     */
     function validateNFTDelegationForRental(uint _rentalID, uint _tokenID) external{
        //TODO
     }   


    /**
     * @notice user get the tool in real life, has the NFT and valiate the transaction
     * - the caution is still secured, the location is payed
     * @dev user validate having the NFT, annd receipt the tool
     */
     function validateNFTandToolReception(uint _rentalID, uint _tokenID) external{
        //TODO
     }

    /**
     * @notice user give back the toool at the end of renting
     * - the caution is still secured, the location is already payed
     * @dev user give bak th etool
     */
     function giveBackToolAfterRental(uint _rentalID) external{
        //TODO
     }  
     
    /**
     * @notice renter validate the return of the tool
     * - the caution is given back
     * @dev renter validae the return of the tool
     */
     function validateReturnToolAfterRental(uint _rentalID) external{
        //TODO
     } 

    /**
     * @notice renter doens't validate the return of the tool. Problem. dispute creation
     * - the caution still secured
     * @dev renter doesn't validate the return of the tool, because of a problem
     */
     function refuseReturnToolAfterRental(uint _rentalID, string memory message) external{
        //TODO
     }

    /**
     * @notice user confirm dispute and expose its point of view
     * - the caution still secured
     * @dev user confirm dispute and expose its point of view
     */
     function confirmReturnToolAfterRental(uint _rentalID, string memory message) external{
        //TODO
     }

    /**
     * @notice user redeem its caution or caution and location
     * - the caution is given back at the end of rental or because the renter refuse the rental
     * @dev user redeem its caution
     */
     function redeemPaymentForRental(uint _rentalID, string memory message) external{
        //TODO
     }  


  
  
}
