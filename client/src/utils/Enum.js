export const RentalStatus = {
    AVAILABLE:0 ,                          // initiate state : tool available
    RENTAL_REQUESTED:1,                   // User ask to rent a tool (send the caution and the location)
    RENTAL_ACCEPTED_NFT_SENT:2,           // Owner accept. (delegate the NFT)
    VALIDATE_RECEIPT_PAYMENT:3,           // User alrrady have the NFT, receipt the tool and confirm payment. Rental is ON GOING
    COMPLETED_USER:4,                     // User give back the tool to the owner
    RETURN_ACCEPTED_BY_OWNER:5,           // Owner accept the return of the tool
    DISPUTE:6,                            // Owner doesn't accept the return and initiate a dispute
    DISPUTE_SOLVED:7,                     // DAO manage the dispute
    RENTAL_ENDED:8                       // Rental colpleted
}