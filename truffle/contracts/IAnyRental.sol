// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "./Utils.sol";

interface IAnyRental {


     enum RentalStatus {
        AVAILABLE,                          // initiate state : tool available
        RENTAL_REQUESTED,                   // User ask to rent a tool (send the caution and the location)
        RENTAL_ACCEPTED,                    // Owner accept. (delegate the NFT)
        VALIDATE_TOOL_RECEIPT_AND_PAYMENT,  // User alrrady have the NFT, receipt the tool and confirm payment
        ON_GOING,                           // User has the tool and use it
        COMPLETED_USER,                     // User give back the tool to the owner
        RETURN_ACCEPTED_BY_OWNER,           // Owner accept the return of the tool
        DISPUTE,                            // Owner doesn't accept the return and initiate a dispute
        DISPUTE_SOLVED,                     // DAO manage the dispute
        RENTAL_ENDED                       // Rental colpleted
    }

  struct CollectionNFT {
        address collection;
        address owner;
   }

    struct Rental {
        uint256 rentalID;
        uint8 dayPrice;
        uint8 caution;
        uint64 start;
        uint64 end;
        RentalStatus rentalStatus;
        bool isCautionDeposed;
        bool isNFTDelegated;
        bool isDispute;
        bool isRedeemed;
        address renter;
        CollectionNFT collection;
        uint tokenID;
        string tokenURI;    // ou ca ?
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
    event ToolAddedToRentals(address renter, uint toolID, uint timestamp);
    
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
    event rentalRequested(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    
    /**
     * @dev Emitted when a renter accept to rent its tool
     */
     event rentalAccepted(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
     /**
     * @dev Emitted when a renter doesn't accept to rent its tool
     */
     event rentalRejected(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
     /**
     * @dev Emitted when a user pay for the tental
     */
     event rentalPaymentDone(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    /* @dev Emitted when a user pay for the tental
     */
     event rentalNFTToolDelegated(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
     /**
     * @dev Emitted when a user give back the tool
     */
     event rentalCompletedByUser(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a renter accept thereturn of the tool
     */
     event rentalCompletedByRenter(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a renter doensn't accept the return of the tool
     */
     event rentalDisputeCreated(address renter, address user, address renterCollectionAddress, uint tokenId, string dispute, uint timestamp);

    /**
     * @dev Emitted when a renter doensn't accept the return of the tool
     */
     event rentalDisputeSolved(address renter, address user, address renterCollectionAddress, uint tokenId, string disputeSolution, uint timestamp);

    /**
     * @dev Emitted when a renter doensn't accept the return of the tool
     */
     event rentalEnded(address renter, address user, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a user ask to extznd the rental duration
     */
    event RentalExtended(address renter, address user, address renterCollectionAddress, uint tokenId, uint duration ,uint timestamp);
    


    /** ****************************************************
     *  functions
     **************************************************** */
   

     /**
     * @dev Create a new NFT collection
     */
    function createCollection(string memory collectionName) external returns(address collectionCreated);
    function deleteCollection() external; 
    
    
    /**
     * @notice  
     * @dev get collection from renter Address
     */
     function getCollection(address renter) external returns(Utils.Tool[] memory);
     function getCollectionAddress(address renter) external view returns(address);
     //function getCollections()external view returns(Utils.Tool[] memory){

    
    /**
     * @dev add a tool to collection . onlyRenter
     */
     //function addToolToCollection(Utils.Tool memory, string memory _tokenURI) external returns(uint tokenId);    
     function addToolToCollection(string calldata _tokenURI, uint _serialId, string memory _title, string memory _description )external returns(uint tokenId);    

    /**
     * @dev add a tool to collection . onlyRenter
     */
     function addToolToRentals(Rental memory _rental, uint _tokenID, string memory _tokenURI) external;
    // UpdateToolIntoCollection ?
    
      /**
     * @dev delete a tool into collection . onlyRenter
     */
     // marche pas
     //function deleteToolIntoCollection(uint _tokenID)external;    



    // getUserRentals
    // getUserRentalById  ?
    // getRenterTools
    // getUserToolById     ?
    // getToolRental        // pour un tool, renter, user, duree caution, etc


    //askForRental
    //acceptRental
    //payRental
    /**
     * @dev delegate the NFT to a user . onlyRenter
     */
    function delegateNFT(uint _tokenId, address _to, uint64 _expires) external;  

    // rgiveBackTool
    // acceptGiveBackTool
    // refuseGiveB  ckTool
    // initiateDispute

    // retreievecautioj
    // retrievePayment
    // pay


}
