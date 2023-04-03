// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IAnyRental.sol";
import "./IAnyNFTCollection.sol";
import "./AnyNFTCollection.sol";
import "./AnyNFTCollectionFactory.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./Utils.sol";
//import "../node_modules/@ganache/console.log/console.sol";

/**
 * @title Rental Any  contract 
 * @author https://github.com/gbesset
 * @notice contract to generate NFT of tool to locate, and manage the rental
 * @dev Implements NFT gneration, and rental process
 */
contract AnyRental is Ownable, IAnyRental{

   using Counters for Counters.Counter;

    AnyNFTCollectionFactory public factory;

    Counters.Counter private rentalIds;


    // mapping of  a user address to the rented tools
    mapping (address => Rental[]) private userRentals;



    // list of all the renters address
    address[] rentersList;

    // mapping of a renter address to its collection
    mapping (address => CollectionNFT) private rentersCollection;
    
    // mapping of a renter address to its rentals
    mapping (address => Rental[]) public rentersRentals;
    uint256 public nbRentalMax = 20;



    constructor(address _anyNFTFactory){
        // Instantiate the Any NFT Factory from its address
        factory = AnyNFTCollectionFactory(_anyNFTFactory);
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
    modifier renterMustExist(address _renter) {
        require(renterExists(_renter), "Renter does not exist");
        _;
    }
             


    function setNbRentalMax(uint _nb) external onlyOwner{
        nbRentalMax = _nb;
    }

    function renterExists(address _renter) internal view returns(bool) {
        return rentersRentals[_renter].length>0;
    }

    /* ***********************************************
    *   Getters 
    *********************************************** */
     /** 
     * @notice return the NFT Tools from a renter address
     * @dev get collection from renter Address
     * @return Tool[]  (NFT attributes)
     */
    function getToolsCollection(address _renter) renterMustExist(_renter) external view returns(Utils.Tool[] memory){
        //return factory._rentersCollection().tools();
        IAnyNFTCollection collec = IAnyNFTCollection(rentersCollection[_renter].collection);
        return collec.getTools();
    }
    /** 
     * @notice return the NFT Collection address from a renter address
     * @dev get collection address a from renter Address
     * @return address of the collection NFT
     */
    function getToolsCollectionAddress(address _renter)  external view returns(address){
        return rentersCollection[_renter].collection;
    }
    


    /*function getCollections()external view returns(Utils.Tool[] memory){
        // pour toutes les addresses
        // concatener les collections
        // renvoyer l'ensemble
        //ou en js appeler les differentes collections pour les addresses..?
    }*/

    /** 
     * @notice return the Rentals from a renter address
     * @dev get rentals array from an renter address
     * @return Rental[]
     */
    function getRentalsByRenter(address _renter) renterMustExist(_renter) external view returns(Rental[] memory){
        return rentersRentals[_renter];
    }

    /** 
     * @notice return the Rental by the renter address and rentalId
     * @dev return a rental from an address and a rentalID
     * @return Rental 
     */
    function getRentalByRenterAddressAndRentalID(address _renter, uint _rentalId) renterMustExist(_renter) external view returns(Rental memory){
        uint found;
         for(uint i; i< rentersRentals[_renter].length; i++){
            if(rentersRentals[_renter][i].rentalID == _rentalId){
                 found=i;
                 break;
            }   
        }
        return rentersRentals[_renter][found];
    }
        function getRentalIndexByRenterAddressAndRentalID(address _renter, uint _rentalId) renterMustExist(_renter) internal view returns(uint){
        uint found;
         for(uint i; i< rentersRentals[_renter].length; i++){
            if(rentersRentals[_renter][i].rentalID == _rentalId){
                 found=i;
                 break;
            }   
        }
        return found;
    }

    /** 
     * @notice return a Rental by the  rentalId
     * @dev Internal ! very bad complexity.... don't use often !
     * @return Rental 
     */
    /* function getRentalByRentalId(uint _rentalId) internal view returns(Rental memory){
        Rental memory rentalFound;
         for(uint i; i< rentersList.length; i++){
            Rental[] memory rentalsTmp = rentersRentals[rentersList[i]];
            for(uint j; j<rentalsTmp.length; j++){
                if(rentalsTmp[j].rentalID == _rentalId){
                     rentalFound=rentalsTmp[j];
                    break;
                }
            }   
        }
        return rentalFound;
     }*/
    



    /* ***********************************************
    *   Functions  - NFT Managment
    *********************************************** */
    /**
     * @notice Create the NFT Collection of a renter
     * @return collectionCreated : colletion address deployed
     */
    function createCollection(string memory _collectionName, string memory _collectionSymbol) external returns(address){
        require(msg.sender != address(0), "address zero is not valid");
        require(rentersCollection[msg.sender].collection==address(0), "You already have created your collection");
        require(!Utils.isEqualString(_collectionName,""), "collection name can't be empty");

         address collectionAddress = factory.createAnyNFTCollection(msg.sender, _collectionName, _collectionSymbol);
         //AnyNFTCollection collectionCreated = AnyNFTCollection(collectionAddress);

        // update Renters Collection
        rentersCollection[msg.sender].collection = collectionAddress;
        rentersCollection[msg.sender].owner =  msg.sender;

        //update the list of renters
        rentersList.push(msg.sender);

        emit NFTCollectionCreated(msg.sender, _collectionName , collectionAddress, block.timestamp);
        
        return collectionAddress;
    }

    /**
     * @notice renter delete its NFT Collection of a
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
        require(rentersRentals[msg.sender].length < nbRentalMax, "Maximum number of tools reached");
        
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

        emit RentalNFTToolDelegated(msg.sender, _to, rentersCollection[msg.sender].collection, _tokenId, block.timestamp);
    }


    /* ***********************************************
    *   Functions  - Rental Managment
    *********************************************** */

    function addToolToRentals(uint64 _dayPrice, uint64 _caution, uint _tokenID, string memory _tokenURI) external {
        require(rentersCollection[msg.sender].collection!=address(0), "You don't have any collection");
        require(rentersRentals[msg.sender].length < nbRentalMax, "Maximum number of tools reached");
        require(_dayPrice > 0, "number must be > 0");
        require(_caution > 0, "number must be > 0");

         uint newRentalIds = rentalIds.current();

        CollectionNFT memory collec;
        collec.collection = rentersCollection[msg.sender].collection;
        collec.owner = rentersCollection[msg.sender].owner;

        //All rentalData.is* false by default
        RentalData memory rentalData;

        Rental memory rental;
        rental.rentalID = newRentalIds;
        rental.dayPrice =_dayPrice;
        rental.caution = _caution;
        rental.rentalStatus = RentalStatus.AVAILABLE;
        rental.rentalData = rentalData;
        rental.collection = collec;
        rental.tokenID = _tokenID;
        rental.tokenURI = _tokenURI; 

        rentersRentals[msg.sender].push(rental);

        rentalIds.increment();
        emit ToolAddedToRentals(msg.sender, newRentalIds , _tokenID, block.timestamp);
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
         require(rentersCollection[msg.sender].collection!=address(0), "You don't have any collection");
        require(rentersRentals[msg.sender].length < nbRentalMax, "Maximum number of tools reached");
        
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
     * @notice user send the location and caution which in order to ask for the rental of a Rental
     * - the caution and location is secured until
     * @dev user send caution and location price for rent a Rental
     */
     function sendPaiementForRental(address _renter, uint _rentalID, uint64 _begin, uint64 _end) renterMustExist(_renter) external{
         require(rentalIds.current() >= _rentalID, "Tool does not exist");
         require(_begin > 0, "begin must be a valid date");
         require(_end > 0, "end must be a valid date");
         require(_begin < _end, "End of rental can't be before begin");

         uint found = getRentalIndexByRenterAddressAndRentalID(_renter, _rentalID);
        Rental storage rental = rentersRentals[_renter][found];
        require(rental.rentalID == _rentalID, "The rental is not available.");
        require(rental.rentalStatus == RentalStatus.AVAILABLE, "The rental status is incorrect.");
        
        //gestion caution et paiement

        rental.start = _begin;
        rental.end = _end;
        rental.rentalStatus = RentalStatus.RENTAL_REQUESTED;
        rental.rentalData.isCautionDeposed = true;
        rental.renter = msg.sender;

         emit RentalRequested(rental.collection.owner, msg.sender,  rental.collection.collection, rental.tokenID, block.timestamp);
     }

   /**
     * @notice renter delegate the NFT in order to validate the rental asking
     * - the caution and location is still secured
     * @dev renter validate the delagation of the NFT
     */
     function validateNFTDelegationForRental(uint _rentalID, uint _tokenID) renterMustExist(msg.sender)  external{
         require(rentalIds.current() >= _rentalID, "Tool does not exist");
         require(_tokenID > 0, "token ID must be valid");


        uint found = getRentalIndexByRenterAddressAndRentalID(msg.sender, _rentalID);
        Rental storage rental = rentersRentals[msg.sender][found];
        require(rental.rentalID == _rentalID, "The rental is not available.");
        require(rental.tokenID == _tokenID, "Error... the tokenId isn't the correct one.");
        require(rental.rentalStatus == RentalStatus.RENTAL_REQUESTED, "The rental status is incorrect.");
        
        rental.rentalStatus = RentalStatus.RENTAL_ACCEPTED_NFT_SENT;
        rental.rentalData.isNFTDelegated = true;
        
        emit RentalAccepted(rental.collection.owner, rental.renter,  rental.collection.collection, rental.tokenID, block.timestamp);
     }   


    /**
     * @notice user get the tool in real life, has the NFT and valiate the transaction
     * - the caution is still secured, the location is payed
     * @dev user validate having the NFT, annd receipt the tool
     */
     function validateNFTandToolReception(address _renter, uint _rentalID) renterMustExist(_renter)  external{
         require(rentalIds.current() >= _rentalID, "Tool does not exist");
 
        uint found = getRentalIndexByRenterAddressAndRentalID(_renter, _rentalID);
        Rental storage rental = rentersRentals[_renter][found];
        require(rental.rentalID == _rentalID, "The rental is not available.");
        require(rental.renter==msg.sender, "Problem on the renter and the one who asks");
        require(rental.rentalStatus == RentalStatus.RENTAL_ACCEPTED_NFT_SENT, "The rental status is incorrect.");
        
        rental.rentalStatus = RentalStatus.VALIDATE_RECEIPT_PAYMENT;

        //TODO mettre le tool is availabe a false dans Collection
        
        emit RentalNFTToolDelegated(rental.collection.owner, rental.renter,  rental.collection.collection, rental.tokenID, block.timestamp);

     }

    /**
     * @notice user give back the toool at the end of renting
     * - the caution is still secured, the location is already payed
     * @dev user give bak th etool
     */
     function giveBackToolAfterRental(address _renter, uint _rentalID) renterMustExist(_renter) external{
        require(rentalIds.current() >= _rentalID, "Tool does not exist");

        uint found = getRentalIndexByRenterAddressAndRentalID(_renter, _rentalID);
        Rental storage rental = rentersRentals[_renter][found];
        require(rental.rentalID == _rentalID, "The rental is not available.");
        require(rental.renter==msg.sender, "Problem on the renter and the one who asks");
        require(rental.rentalStatus == RentalStatus.VALIDATE_RECEIPT_PAYMENT, "The rental status is incorrect.");
        
        rental.rentalStatus = RentalStatus.COMPLETED_USER;
        rental.rentalData.isToolReturned = true;

        //TODO mettre le tool is availabe a truue dans Collection
        
        emit RentalCompletedByUser(rental.collection.owner, msg.sender,  rental.collection.collection, rental.tokenID, block.timestamp);

     }  
     
    /**
     * @notice renter validate the return of the tool
     * - the caution is given back
     * @dev renter validae the return of the tool
     */
     function validateReturnToolAfterRental(uint _rentalID)renterMustExist(msg.sender)  external{
        require(rentalIds.current() >= _rentalID, "Tool does not exist");

        uint found = getRentalIndexByRenterAddressAndRentalID(msg.sender, _rentalID);
        Rental storage rental = rentersRentals[msg.sender][found];
        require(rental.rentalID == _rentalID, "The rental is not available.");
        require(rental.rentalStatus == RentalStatus.COMPLETED_USER, "The rental status is incorrect.");
        
        rental.rentalStatus = RentalStatus.RETURN_ACCEPTED_BY_OWNER;
        rental.rentalData.isReturnValidated = true;
        
        emit RentalCompletedByRenter(rental.collection.owner, rental.renter,  rental.collection.collection, rental.tokenID, block.timestamp);

     } 

    /**
     * @notice renter doens't validate the return of the tool. Problem. dispute creation
     * - the caution still secured
     * @dev renter doesn't validate the return of the tool, because of a problem
     */
     function refuseReturnToolAfterRental(uint _rentalID, string memory message)renterMustExist(msg.sender)  external{
        require(rentalIds.current() >= _rentalID, "Tool does not exist");

        uint found = getRentalIndexByRenterAddressAndRentalID(msg.sender, _rentalID);
        Rental storage rental = rentersRentals[msg.sender][found];
        require(rental.rentalID == _rentalID, "The rental is not available.");
        require(rental.rentalStatus == RentalStatus.COMPLETED_USER, "The rental status is incorrect.");
        
        rental.rentalStatus = RentalStatus.DISPUTE;
        rental.rentalData.isDispute = true;
        
        emit RentalDisputeCreated(rental.collection.owner, rental.renter,  rental.collection.collection, rental.tokenID, message, block.timestamp);

     }

    /**
     * @notice user confirm dispute and expose its point of view
     * - the caution still secured
     * @dev user confirm dispute and expose its point of view
     */
     function confirmDisputeAfterRental(address _renter, uint _rentalID, string memory message)renterMustExist(_renter)  external{
         require(rentalIds.current() >= _rentalID, "Tool does not exist");

        uint found = getRentalIndexByRenterAddressAndRentalID(_renter, _rentalID);
        Rental storage rental = rentersRentals[_renter][found];
        require(rental.rentalID == _rentalID, "The rental is not available.");
        require(rental.renter==msg.sender, "Problem on the renter and thr one who asks");
        require(rental.rentalStatus == RentalStatus.DISPUTE, "The rental status is incorrect.");
               
        rental.rentalData.isDispute = true;

        emit RentalDisputelConfirmedByUser(rental.collection.owner, _renter,  rental.collection.collection, rental.tokenID, message, block.timestamp);

     }

    /**
     * @notice user redeem its caution or caution and location
     * - the caution is given back at the end of rental or because the renter refuse the rental
     * @dev user redeem its caution
     */
     function redeemPaymentForRental(uint _rentalID, string memory message) external{
         require(rentalIds.current() >= _rentalID, "Tool does not exist");

        uint found = getRentalIndexByRenterAddressAndRentalID(msg.sender, _rentalID);
        Rental storage rental = rentersRentals[msg.sender][found];
        require(rental.rentalID == _rentalID, "The rental is not available.");
        require(rental.rentalStatus == RentalStatus.RETURN_ACCEPTED_BY_OWNER, "The rental status is incorrect.");
        
        // recuperer sa caution
       

        rental.rentalStatus = RentalStatus.RENTAL_ENDED;
        rental.rentalData.isRedeemed = true;
        rental.rentalData.isCautionDeposed = false;
        
        emit RentalEnded(rental.collection.owner, msg.sender,  rental.collection.collection, rental.tokenID, block.timestamp);

     }  


  
  
}
