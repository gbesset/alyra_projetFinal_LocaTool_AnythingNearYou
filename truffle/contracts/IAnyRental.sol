// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "./Utils.sol";

interface IAnyRental {


     enum RentalStatus {
        RENTAL_REQUESTED,           // User ask to rent a tool
        RENTAL_ACCEPTED,            // Owner accept. 
        WAITING_FOR_PAYMENT,        // User has to pay and get the tool
        ON_GOING,                   // User has the tool and use it
        COMPLETED_USER,             // User give back the tool to the owner
        COMPLETED_OWNER,            // Owner accept the return of the tool
        DISPUTE,                    // Owner doesn't accept the return and initiate a dispute
        DISPUTE_SOLVED,             // DAO manage the dispute
        RENTAL_ENDED                       // Rental colpleted
    }

    struct Rental {
        address colectionAddress;       //??
        uint toolID;
        uint8 dayPrice;
        uint8 caution;
        uint64 start;
        uint64 end;
        bool isRented;
        bool isDispute;
        address renter;         
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
    event NFTCollectionDeleted(address renter, string renterCollectionName, address renterCollectionAddress,  uint timestamp);
    
    /**
     * @dev Emitted when a renter add a tool to its NFT Collection.
     */
    event NFTToolAddedToCollection(address renter, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a renter update a tool into its NFT Collection.
     */
    event NFTToolUpdatedIntoCollection(address renter, address renterCollectionAddress, uint tokenId, uint timestamp);
    /**
     * @dev Emitted when a renter delete a tool into its NFT Collection.
     */
    event NFTToolDeletedFromCollection(address renter, address renterCollectionAddress, uint tokenId, uint timestamp);
    



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
    function createCollection() external returns(address collectionCreated);

    // Delete collection
    
    /**
     * @dev get collection from renter Address
     */
    function getCollection(address renter) external returns(Utils.Tool[] memory);

    
    // AddToolToCollection
    // UpdateToolIntoCollection ?
    // DeleteToolIntoCollection
    // getCollectionTools
    // SearchToolIntoCollection

    // getUserRentals
    // getUserRentalById  ?
    // getRenterTools
    // getUserToolById     ?
    // getToolRental        // pour un tool, renter, user, duree caution, etc


    //askForRental
    //acceptRental
    //payRental
    // 
    // rgiveBackTool
    // acceptGiveBackTool
    // refuseGiveB  ckTool
    // initiateDispute

    // retreievecautioj
    // retrievePayment
    // pay


}
