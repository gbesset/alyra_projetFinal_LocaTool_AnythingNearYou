// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "./Utils.sol";

interface IAnyRental {


     enum RentalStatus {
        AVAILABLE,                          // initiate state : tool available
        RENTAL_REQUESTED,                   // User ask to rent a tool (send the caution and the location)
        RENTAL_ACCEPTED_NFT_SENT,           // Owner accept. (delegate the NFT)
        VALIDATE_RECEIPT_PAYMENT,           // User alrrady have the NFT, receipt the tool and confirm payment. Rental is ON GOING
        COMPLETED_USER,                     // User give back the tool to the owner
        RETURN_ACCEPTED_BY_OWNER,           // Owner accept the return of the tool
        DISPUTE,                            // Owner doesn't accept the return and initiate a dispute
        DISPUTE_SOLVED,                     // DAO manage the dispute
        RENTAL_ENDED                       // Rental colpleted
    }

  struct RentalReference {
        address collection;
        uint rentalID;
   }

  struct CollectionNFT {
        address collection;
        address owner;
        string name;
        string symbol;
   }

     struct RentalData {
        bool isCautionDeposed;
        bool isNFTDelegated;
        bool isToolReturned;
        bool isReturnValidated;
        bool isDispute;
        bool isDisputeConfirmed;
        bool isRedeemed;
     }

    struct Rental {
        uint256 rentalID;
        string title;
        string description;
        uint64 dayPrice;
        uint64 caution;
        uint64 start;
        uint64 end;
        RentalStatus rentalStatus;
        RentalData rentalData;
        address renter;
        CollectionNFT collection;
        uint tokenID;
        string tokenImgURI; 
    }



    /** ****************************************************
     *  EVENTS
     **************************************************** */

    /**
     * @dev Emitted when a renter create its NFT Collection.
     * give RenterAddress, CollectionName, CollectionAddress, timestamp
     */
    event NFTCollectionCreated(address renter, string renterCollectionName, address renterCollectionAddress,  uint timestamp);
    /**
     * @dev Emitted when a renter delete its NFT Collection.
     * give RenterAddress, CollectionName, CollectionAddress, timestamp
     */
    event NFTCollectionDeleted(address renter,  address renterCollectionAddress,  uint timestamp);
    
    /**
     * @dev Emitted when a renter add a tool to its NFT Collection.
     */
    event NFTToolAddedToCollection(address renter, address renterCollectionAddress, uint tokenId, uint timestamp);
       /**
     * @dev Emitted when a renter add a tool to its NFT Collection.
     */
    event ToolAddedToRentals(address renter, uint rentalID, uint tokenID, string title, string description, string tokenImgURI, uint dayPrice, uint caution, uint timestamp);
    
    /**
     * @dev Emitted when a renter delete a tool into its NFT Collection.
     */
    event ToolDeletedFromRentals(address renter, uint toolID, uint timestamp);
    /**
     * @dev Emitted when a renter aduptate a tool to its NFT Collection.
     */
    event ToolUpdatedFromRentals(address renter, uint toolID, uint timestamp);




    /**
     * @dev Emitted when a renter update a tool into its NFT Collection.
     */
//    event NFTToolUpdatedIntoCollection(address renter, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a renter delete a tool into its NFT Collection.
     */
//    event NFTToolDeletedFromCollection(address renter, address renterCollectionAddress, uint tokenId, uint timestamp);
    



    /**
     * @dev Emitted when a user ask to rent a tool from a collection
     */
    event RentalRequested(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    
    /**
     * @dev Emitted when a renter accept to rent its tool
     */
     event RentalAccepted(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
     /**
     * @dev Emitted when a renter doesn't accept to rent its tool
     */
     event RentalRejected(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
   
       /* @dev Emitted when a user pay for the tental
     */
     event RentalNFTToolDelegated(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
     /**
     * @dev Emitted when a user give back the tool
     */
     event RentalCompletedByUser(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a renter accept thereturn of the tool
     */
     event RentalCompletedByRenter(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a renter doensn't accept the return of the tool
     */
     event RentalDisputeCreated(address renter, address user, address renterCollectionAddress, uint tokenId, string dispute, uint timestamp);
 /**
     * @dev Emitted when a renter doensn't accept the return of the tool
     */
     event RentalDisputelConfirmedByUser(address renter, address user, address renterCollectionAddress, uint tokenId, string dispute, uint timestamp);

    /**
     * @dev Emitted when a renter doensn't accept the return of the tool
     */
     event RentalDisputeSolved(address renter, address user, address renterCollectionAddress, uint tokenId, string disputeSolution, uint timestamp);

    /**
     * @dev Emitted when a renter redeem its causion and end the rental of the tool
     */
     event RentalEnded(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a user ask to extznd the rental duration
     */
    event RentalExtended(address renter, address user, address renterCollectionAddress, uint tokenId, uint duration ,uint timestamp);
    
    /**
     * @dev Emitted when a renter accept thereturn of the tool
     */
     event RentalReAvailable(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);

    function setNbRentalMax(uint _nb) external;

    /** ****************************************************
     *  Getters
     **************************************************** */

    function isAddressOwner(address _renter) external view returns(bool);
    function isAddressRenter(address _renter) external view returns(bool);

     //  getUserRentals
    // getUserRentalById  ?

    
     /** 
     * @notice return the NFT Tools from a owner address
     * @dev get collection from renter Address
     * @return Tool[]  (NFT attributes)
     */
     function getToolsCollection(address _owner) external returns(Utils.Tool[] memory);
     
    /** 
     * @notice return the NFT Collection address from a owner address
     * @dev get collection address a from owner Address
     * @return address of the collection NFT
     */
     function getToolsCollectionAddress(address _owner) external view returns(address);
     //function getCollections()external view returns(Utils.Tool[] memory){
    
    /** 
     * @notice return the Rentals from a owner address
     * @dev get collection from owner Address
     * @return Rental[]
     */
    function getRentalsByOwner(address _renter) external view returns(Rental[] memory);
    
      /** 
     * @notice return the Rental by the owner address and rentalId
     * @dev return a rental from an address and a rentalID
     * @return Rental 
     */
     function getRentalByOwnerAddressAndRentalID(address _owner, uint _rentalId) external view returns(Rental memory);
  
    // getUserToolById     ?
    // getToolRental        // pour un tool, renter, user, duree caution, etc

    /** ****************************************************
     *  functions   NFT Management
     **************************************************** */
   

     /**
     * @dev Create a new NFT collection
     */
    function createCollection(string memory _collectionName, string memory _collectionSymbol) external returns(address collectionCreated);
    function deleteCollection() external; 
    
    /**
     * @dev delegate the NFT to a user . onlyRenter
     */
    function delegateNFT(uint _tokenId, address _to, uint64 _expires) external;  

  /**
     * @dev add a tool to collection . onlyRenter
     */
     //function addToolToCollection(Utils.Tool memory, string memory _tokenURI) external returns(uint tokenId);    
     function addToolToCollection(string calldata _tokenURI, uint _serialId, string memory _title, string memory _description )external returns(uint tokenId);    

   /** ****************************************************
     *  functions   Rental Management
     **************************************************** */

    /**
     * @dev add a tool to collection . onlyRenter
     */
     function addToolToRentals(string calldata _tokenImgURI, uint64 _dayPrice, uint64 _caution, uint _tokenID) external;
  
     /**
     * @dev update a tool into collection . onlyRenter
     */
     function updateToolIntoRentals(uint _rentalID, uint64 _dayPrice,  uint64 _caution) external;
  
      /**
     * @dev delete a tool into collection . onlyRenter
     */
     function deleteToolIntoRentals(uint _rentalID) external;    


    /**
    * Managment of a rental 
    * workflow cf documentation
     */

    /**
     * @notice user send the location and caution which in order to ask for the rental of a Rental
     * - the caution and location is secured until
     * @dev user send caution and location price for rent a Rental
     */
     function sendPaiementForRental(address _renter, uint _rentalID, uint64 _begin, uint64 _end)  external;   

  /**
     * @notice renter refuse the rental
     * - the caution and location is still secured
     * @dev renter refuse to rent its tool
     */
     //function refuseRental(uint _rentalID, uint _tokenID, string message) external;   

   /**
     * @notice renter delegate the NFT in order to validate the rental asking
     * - the caution and location is still secured
     * @dev renter validate the delagation of the NFT
     */
     function validateNFTDelegationForRental(uint _rentalID, uint _tokenID) external;   


    /**
     * @notice user get the tool in real life, has the NFT and validate the transaction
     * - the caution is still secured, the location is payed
     * @dev user validate having the NFT, annd receipt the tool
     */
     function validateNFTandToolReception(address _renter, uint _rentalID) external;  

    /**
     * @notice user give back the toool at the end of renting
     * - the caution is still secured, the location is already payed
     * @dev user give bak th etool
     */
     function giveBackToolAfterRental(address _renter, uint _rentalID) external;  
     
    /**
     * @notice renter validate the return of the tool
     * - the caution is given back
     * @dev renter validae the return of the tool
     */
     function validateReturnToolAfterRental(uint _rentalID) external;  

    /**
     * @notice renter doens't validate the return of the tool. Problem. dispute creation
     * - the caution still secured
     * @dev renter doesn't validate the return of the tool, because of a problem
     */
     function refuseReturnToolAfterRental(uint _rentalID, string memory message) external;  

    /**
     * @notice user confirm dispute and expose its point of view
     * - the caution still secured
     * @dev user confirm dispute and expose its point of view
     */
     function confirmDisputeAfterRental(address _renter, uint _rentalID, string memory message) external;  

    /**
     * @notice user redeem its caution or caution and location
     * - the caution is given back at the end of rental or because the renter refuse the rental
     * @dev user redeem its caution
     */
     function redeemPaymentForRental(address _renter, uint _rentalID) external;  

    /**
     * @notice owner re rent its Rentak
     * - all fields a re reinit
     * @dev owner re rentRental
     */
    function rentAgainRental(uint _rentalID) external;
}
