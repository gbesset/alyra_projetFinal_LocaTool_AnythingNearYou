const AnyRental = artifacts.require('./AnyRental.sol');
const AnyNFTCollectionFactory = artifacts.require('./AnyNFTCollectionFactory.sol')
const AnyNFTCollection = artifacts.require('./AnyNFTCollection.sol');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const RentalStatus = {
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


contract('AnyRental', accounts => {
    const _contractOwner = accounts[0];     // the one that deploy the contract
    const _owner1 = accounts[1];            // owner of a Rental that rent it
    const _owner2 = accounts[2];
    const _renter1 = accounts[1];           // renter of the rental from the owner
    const _renter2 = accounts[2];
    const _user = accounts[3];              // Basic user (for public access)

  

    //instance declaration
    let anyNFTFactoryInstance;
    let anyRentalInstance;


   async function debug(collectionAddress){
       console.log("-----------------------------------------------------------------------"); 
       console.log("-- contract owner est :                        "+_contractOwner);
       console.log("-- _owner1 est :                     "+_owner1);
       console.log("-- _renter1 est :                     "+_renter1);
       const factory = await anyNFTFactoryInstance.owner();
       console.log("-- Le owner de anyNFTFactoryInstance est          "+factory)
       console.log("-- l'adresse du contrat anyNFTFactoryInstance est "+anyNFTFactoryInstance.address )
       const owner = await anyRentalInstance.owner();
       console.log("-- Le owner de AnyRental est          "+owner)
       console.log("-- l'adresse du contrat AnyRental est "+anyRentalInstance.address )
       

       let collectionInstance = await AnyNFTCollection.at(collectionAddress);
       const ownernft = await collectionInstance.owner.call();
       const factoryAddress = await collectionInstance.factory.call();
       console.log("-- Le owner de la collecion NFT crée est        "+ownernft)
       console.log("-- La factory qui a crée la collection NFT est  "+factoryAddress)
        
       console.log("-----------------------------------------------------------------------");
        
    }

    
    /**
     * Smart contract Deploiement
     */
      describe('AnyRental: Factory and Any Rental Deploiement', () => {
            beforeEach(async function () {
                // new instance each time : new() not deploy().
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });
            });

            it("...Should store the administrator address", async () => {
                let owner = await anyRentalInstance.owner.call();
                expect(owner).to.equal(_contractOwner);
            });

            it('...Should be instantiated and default values defined', async () => {
                expect(await anyRentalInstance.nbRentalMax.call()).to.be.bignumber.equal(new BN(20));
            });
    });

        /**
     * Smart contract Permissions
     */
    describe('AnyRental: Permissions', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });
            });

    });

    describe('AnyRental: getters / accessors', () => {
        beforeEach(async function () {
            anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
            anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
            await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });
        });
        it("... check default  accessors", async () => {
            let isOwner = await anyRentalInstance.isAddressOwner(_owner1,{ from: _owner1 });
            expect(isOwner).to.be.false;

            isOwner = await anyRentalInstance.isAddressRenter(_owner1,{ from: _owner1 });
            expect(isOwner).to.be.false;
        });
        it("... check  accessors after collection creation", async () => {
            let isOwner = await anyRentalInstance.isAddressOwner(_owner1,{ from: _owner1 });
            isOwner = await anyRentalInstance.isAddressOwner(_owner1,{ from: _owner1 });
            expect(isOwner).to.be.false;

            isRenter = await anyRentalInstance.isAddressRenter(_owner1,{ from: _owner1 });
            expect(isRenter).to.be.false;

            let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner1 });
            expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

            isOwner = await anyRentalInstance.isAddressOwner(_owner1,{ from: _owner1 });
            expect(isOwner).to.be.true;

            isRenter = await anyRentalInstance.isAddressRenter(_owner1,{ from: _owner1 });
            expect(isRenter).to.be.false
        });
        it("... check default getters", async () => {
            await expectRevert(
                anyRentalInstance.getToolsCollection(_owner1,{ from: _owner1 }),
                "Owner does not exist"
            );
            await expectRevert(
                anyRentalInstance.getToolsCollectionAddress(_owner1,{ from: _owner1 }),
                "Owner does not exist"
            );

        });
        it("... check  getters after collection creation", async () => {
            await expectRevert(
                anyRentalInstance.getToolsCollection(_owner1,{ from: _owner1 }),
                "Owner does not exist"
            );

            await expectRevert(
                anyRentalInstance.getToolsCollectionAddress(_owner1,{ from: _owner1 }),
                "Owner does not exist"
            );

            let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner1 });
            expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
            let collectionAddress = tx.logs[2].args.renterCollectionAddress;
            
            const tools = await anyRentalInstance.getToolsCollection(_owner1,{ from: _owner1 })
            expect(tools).to.not.be.empty;
            expect(tools[0].title).to.be.equal("genesis");
            expect(tools.length).to.be.equal(1);

            
            const  addressColBefore = await anyRentalInstance.getToolsCollectionAddress(_owner1,{ from: _owner1 });
            expect(addressColBefore).to.be.equal(collectionAddress);
           
        });
        it("... check  getters after collection creation and NFT mint", async () => {
            await expectRevert(
                anyRentalInstance.getToolsCollection(_owner1,{ from: _owner1 }),
                "Owner does not exist"
            );

            await expectRevert(
                anyRentalInstance.getToolsCollectionAddress(_owner1,{ from: _owner1 }),
                "Owner does not exist"
            );

            let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner1 });
            expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
            let collectionAddress = tx.logs[2].args.renterCollectionAddress;

             tx = await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
            expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(1) });
           
            const tools = await anyRentalInstance.getToolsCollection(_owner1,{ from: _owner1 });
            expect(tools).to.not.be.empty;
            expect(tools[0].title).to.be.equal("genesis");
            expect(tools[1].title).to.be.equal("Mon outil");
            expect(tools.length).to.be.equal(2);

            const  addressColBefore = await anyRentalInstance.getToolsCollectionAddress(_owner1,{ from: _owner1 });
            expect(addressColBefore).to.be.equal(collectionAddress);
        });

        it("... check  getRentalsOwner", async () => {
            let addresses = await anyRentalInstance.getRentalsOwner({ from: _owner1 });
            expect(addresses.length).to.be.equal(0);

            let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner1 });
            expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
            let collectionAddress = tx.logs[2].args.renterCollectionAddress;
       
            addresses = await anyRentalInstance.getRentalsOwner({ from: _owner1 });
            expect(addresses[0]).to.be.equal(_owner1);
            expect(addresses.length).to.be.equal(1);

        });

        it("... check  getRentalByRentalID", async () => {
            let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner1 });
            expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
            let collectionAddress = tx.logs[2].args.renterCollectionAddress;
            
            tx = await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
            expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(1) });
    

            rental = await anyRentalInstance.getRentalByRentalID(0, { from: _owner1 });
            expect(rental).not.to.be.empty;
            expect(new BN(rental[0].tokenID)).to.be.equal(new BN(0));
        });



});

    /**
     * AnyRental check all the managment of the NFTs factory
     */
    describe('AnyRental:  NFTs collection management (a NFT Tool throw the factory)', () => {
        describe('-- create a NFTs collection', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address, { from: _contractOwner });
            });

            it("... owner should create a NFT collection - check emit NFTCollectionCreated", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
            });
            it("... owner should create a NFT collection - check isAddressOwner", async () => {
                let isOwner = await anyRentalInstance.isAddressOwner(_owner1,{ from: _owner1 });
                expect(isOwner).to.be.false;

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                isOwner = await anyRentalInstance.isAddressOwner(_owner1,{ from: _owner1 });
                expect(isOwner).to.be.true;
            });
            it("... owner shouldn't create a NFT collection without name", async () => {
                await expectRevert(anyRentalInstance.createCollection("", "CT", {from:_owner1}), "collection name can't be empty");
            });
            it("... owner shouldn't create two NFT collection", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
                await expectRevert(anyRentalInstance.createCollection("Collection de test 2", "CT", { from: _owner1 }), "You already have created your collection");
            });

            it("... owner should created a NFT collection - Check the renter is the owner and instance name is OK ", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
                let collectionAddress = tx.logs[2].args.renterCollectionAddress;
                //await debug(collectionAddress);
                
                let collectionInstance = await AnyNFTCollection.at(collectionAddress);
                // pour mémoire autre manière de faire
                //let collectionInstance = new web3.eth.Contract(AnyNFTCollectionJSon.abi, collectionAddress);
                
                
                const ownerAddress = await collectionInstance.owner.call();
                //const ownerAddress = await collectionInstance.methods.owner().call();
                expect(ownerAddress).to.be.equal(_owner1);

                const factoryAdress = await collectionInstance.factory.call();
                // const factoryAdress = await collectionInstance.methods.factory().call();
                expect(factoryAdress).to.be.equal(anyRentalInstance.address);

                const collectionName = await collectionInstance.name.call();
                //const collectionName = await collectionInstance.methods.name().call();
                expect(collectionName).to.be.equal("Collection de test");

                const collectionSymbol = await collectionInstance.symbol.call();
                //const collectionSymbol = await collectionInstance.methods.symbol().call();
                expect(collectionSymbol).to.be.equal("CT");

            });

        });


        describe('-- delete a NFTs collection', () => {
            let collectionAddress;
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;
            });

            it("... owner should delete a NFT collection", async () => {

                const addressColBefore = await anyRentalInstance.getToolsCollectionAddress(_owner1, { from: _user })
                expect(addressColBefore).to.be.equal(collectionAddress);

                const ownerAddress = await anyRentalInstance.owner.call();
                expect(ownerAddress).to.be.equal(_contractOwner);

                let tx = await anyRentalInstance.deleteCollection({ from: _owner1 });
                expectEvent(tx, 'NFTCollectionDeleted', { renter: _owner1 });

                await expectRevert(
                    anyRentalInstance.getToolsCollectionAddress(_owner1,  { from: _user }),
                    "Owner does not exist"
                );
                
            });
        });
    

        describe('-- add NFT to NFTs collection', () => {
            let collectionAddress;
            let tokenID = 1;
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;
            });


            it("... owner should be able to add a NFT tool to its collection", async () => {
                let tx = await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });
            });

            it("... non owner couldn't add a NFT tool to a NFT collection if not the owner", async () => {
                //await debug(collectionAddress);
                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _owner2 }),
                    "You are not the owner of the collection"
                );        
            });
            it("... owner should be able to add a NFT tool to its collection - check storage", async () => {
                let tx = await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });

                            
                const nftCollection = await anyRentalInstance.getToolsCollection(_owner1, { from: _owner1 })
                expect(nftCollection).to.not.be.empty;
                expect(nftCollection[0].title).to.be.equal("genesis");
                expect(nftCollection[1].title).to.be.equal("Mon outil");
                expect(nftCollection.length).to.be.equal(2);

                const rentalCollection = await anyRentalInstance.getRentalsByOwner(_owner1, { from: _owner1 })
                expect(nftCollection).to.not.be.empty;
                expect(new BN(rentalCollection[0].rentalID)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalCollection[0].tokenID)).to.be.bignumber.equal(new BN(tokenID));
            });

            /* it("... a renter can't add a NFT tool to another renter collection", async () => {

                // another renter on another collection
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner2 });

                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _owner2 }),
                    "You are not the owner of the collection"
                    );
                
            });*/
        
            it.skip("... owner should not be able to add a NFT to a collection over the maximum count", async () => {
                const MAX_TOOLS = 3;
                anyRentalInstance.setNbRentalMax(MAX_TOOLS);
                
                for (let i = 0; i < MAX_TOOLS; i++) {
                    await anyRentalInstance.addToolToCollection(`https://www.example.com/tokenURI${i}`, i, `Outil ${i}`, `Description de l'outil ${i}`, { from: _owner1 });
                }
                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _owner1 }),
                    "Maximum number of tools reached"
                );
            });
        
            it("... owner should not be able to add a NFT into a non-existing collection", async () => {
                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _owner2 }),
                    "You are not the owner of the collection"
                );
            });     
        });

        describe.skip('-- delegate NFT to a user', () => {
            let collectionAddress;
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI_1", 12345, "Mon outil 2", "Une description de mon outil 2", { from: _owner1 });
                await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI_2", 64899, "Mon outil 2", "Une description de mon outil 2", { from: _owner1 });


                collectionAddress = tx.logs[2].args.renterCollectionAddress;
            });

            /*it("... renter should delegate a NFT to a users", async () => {
                await debug(collectionAddress);
                const tokenID = 1;
                const expires = Math.floor(new Date().getTime()/1000) + 100;

                let tx = await anyRentalInstance.delegateNFT(tokenID, _renter1, expires , {from: _owner1});
                expectEvent(tx, 'rentalNFTToolDelegated', { renter: _owner1,  user: _renter1, renterCollectionAddress: anyRentalInstance.address, tokenId: tokenID, expires: new BN(expires) });
                
            });*/
            
        });

        
    });

      /**
     * * AnyRental check all the managment of the Rentals of a renter (add/update/delete)
     */
     describe('AnyRental: Rental management (a Rental into a renter list of rentals)', () => {
         describe('-- owner shoud add a Rental to its Rentals list after NFT tool creation', () => {
            let collectionAddress;
            let tokenID = 1;
            let rentalID = 0;
            let tokenURI = "https://www.example.com/tokenURI";
            let tokenImgURI = "https://www.example.com/tokenURI.png";

            beforeEach(async function () {
                tokenID = 1;            //Reinit each time !!!
                rentalID = 0;
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(1) });

                rentalExpected = {
                    "rentalID": rentalID, 
                    "dayPrice": 11, 
                    "caution": 200, 
                    "start": 0, 
                    "end": 0, 
                    "rentalStatus": 0, 
                    "rentalData": {
                        "isCautionDeposed": false, 
                        "isNFTDelegated": false, 
                        "isToolReturned": false, 
                        "isReturnValidated": false, 
                        "isDispute": false, 
                        "isDisputeConfirmed": false, 
                        "isRedeemed": false,
                    },
                    "renter": "0x0000000000000000000000000000000000000000",
                    "collection": {
                        "collection":collectionAddress.address, 
                        "owner":_owner1
                    },
                    "tokenID": tokenID, 
                    "tokenImgURI": tokenImgURI
                }
            });


            it("... after the NFT creation, owner can add a Rental - should emit ToolAddedToRentals", async () => {
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN( ), tokenID: new BN(tokenID) });
            });

            it("... after the NFT creation, owner can add a Rental -  should emit 2 ToolAddedToRentals ", async () => {
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rentalID), tokenID: new BN(tokenID) });
                
                tokenID++;
                rentalID++;
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });

                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 54, 800,  tokenID, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rentalID), tokenID: new BN(tokenID) });

            });
            
            it("... after the NFT creation, owner can add a Rental  - check the Rental object stored", async () => {
                       
                await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID, { from: _owner1 });
                
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, 0);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rentalID));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(rentalExpected.dayPrice));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(rentalExpected.caution));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(rentalExpected.start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(rentalExpected.end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(rentalExpected.rentalStatus));
                expect(new BN(rentalRetuned.rentalData.isCautionDeposed)).to.be.bignumber.equal(new BN(rentalExpected.rentalData.isCautionDeposed));
                expect(new BN(rentalRetuned.rentalData.isNFTDelegated)).to.be.bignumber.equal(new BN(rentalExpected.rentalData.isNFTDelegated));
                expect(new BN(rentalRetuned.rentalData.isToolReturned)).to.be.bignumber.equal(new BN(rentalExpected.rentalData.isToolReturned));
                expect(new BN(rentalRetuned.rentalData.isReturnValidated)).to.be.bignumber.equal(new BN(rentalExpected.rentalData.isReturnValidated));
                expect(new BN(rentalRetuned.rentalData.isDispute)).to.be.bignumber.equal(new BN(rentalExpected.rentalData.isDispute));
                expect(new BN(rentalRetuned.rentalData.isDisputeConfirmed)).to.be.bignumber.equal(new BN(rentalExpected.rentalData.isDisputeConfirmed));
                expect(new BN(rentalRetuned.rentalData.isRedeemed)).to.be.bignumber.equal(new BN(rentalExpected.rentalData.isRedeemed));
                expect(rentalRetuned.renter).to.be.equal(rentalExpected.renter);
                //TODO ICI
                //expect(rentalRetuned.collection.collection).to.be.equal(rentalExpected.collection.collection);
                //expect((rentalRetuned.collection.owner)).to.be.equal(rentalExpected.collection.owner);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(rentalExpected.tokenID));
                expect(rentalRetuned.tokenImgURI).to.be.equal(rentalExpected.tokenImgURI);
            });

            it("... after the NFT creation, owner could not add a Rental if he doesn't have any collection", async () => {
                await expectRevert(
                    anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID,  { from: _owner2 }),
                    "You are not the owner of the collection"
                );
            });
        
            it("... after the NFT creation,  owner could not add a Rental if he reached the maximum size of rentals", async () => {
               const MAX_TOOLS = 3;
               anyRentalInstance.setNbRentalMax(MAX_TOOLS)
               
                await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID,  { from: _owner1 });
                
                tokenID++;
                rentalID++;
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 2222, "Mon outil2", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });
               
                await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID,  { from: _owner1 });
            
                tokenID++;
                rentalID++;
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 333, "Mon outil3", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });
                
                await expectRevert(
                    anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID,  { from: _owner1 }),
                    "Maximum number of tools reached"
                );
            });
        
            it("... after the NFT creation, owner could not add a Rental if the day price is not greater than 0", async () => {
                await expectRevert(
                    anyRentalInstance.addToolToRentals(tokenImgURI, 0, 200, tokenID,  { from: _owner1 }),
                    "number must be > 0"
                );
            });
        
            it("... after the NFT creation, owner could not add a Rental if the caution is not greater than 0", async () => {
                await expectRevert(
                    anyRentalInstance.addToolToRentals(tokenImgURI, 11, 0, tokenID,  { from: _owner1 }),
                    "number must be > 0"
                );
            });
        
            it("... after the NFT creation, owner should add a Rental - check emit ToolAddedToRentals", async () => {
                const receipt = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID,  { from: _owner1 });
        
                expectEvent(receipt, "ToolAddedToRentals", {
                    renter: _owner1,
                    rentalID: new BN(0)
                });
            });
        
        });
        describe('-- update a Rental into Rentals', () => {
            let collectionAddress;
            let tokenID = 1;
            let tokenURI = "https://www.example.com/tokenURI";
            let tokenImgURI = "https://www.example.com/tokenURI.png";
            
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });
                
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
                
                collectionAddress = tx.logs[2].args.renterCollectionAddress;
                
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });
                
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(0) });
                
                rentalExpected = {
                    "rentalID": 0, 
                    "dayPrice": 21, 
                    "caution": 210, 
                }
            });
            
            
            it("... owner can update a Rental  - check rental stored before update", async () => {
                let rentalDefault = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, 0);     
                expect(new BN(rentalDefault.rentalID)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalDefault.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalDefault.caution)).to.be.bignumber.equal(new BN(200));
            });
            
            it("... owner can update a Rental - should emit ToolUpdatedFromRentals", async () => {
                tx = await anyRentalInstance.updateToolIntoRentals(0, 21, 210,{ from: _owner1 });
                expectEvent(tx, "ToolUpdatedFromRentals", { renter: _owner1,  toolID: new BN(0) });
                
            });
            it("... owner can update a Rental - check Rental stored modifications", async () => {
                tx = await anyRentalInstance.updateToolIntoRentals(0, 21, 210,{ from: _owner1 });
                
                let rentalDefault = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, 0);    
                
                expect(new BN(rentalDefault.rentalID)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalDefault.dayPrice)).to.be.bignumber.equal(new BN(rentalExpected.dayPrice));
                expect(new BN(rentalDefault.caution)).to.be.bignumber.equal(new BN(rentalExpected.caution));
            });
            
        });
        
        describe('-- delete a Rental into Rentals', () => {
            let collectionAddress;
            let tokenID = 1;
            let rentalID = 0;
            let tokenURI = "https://www.example.com/tokenURI";
            let tokenImgURI = "https://www.example.com/tokenURI.png";
           
            beforeEach(async function () {
                tokenID = 1;
                rentalID = 0;
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });
    
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });
    
                collectionAddress = tx.logs[2].args.renterCollectionAddress;
    
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });
    
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, tokenID, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rentalID),  tokenID: new BN(tokenID) });
             
                tokenID++;
                rentalID++;
                tx = await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 333, "Mon outil3", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });


                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 22, 420, tokenID, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rentalID), tokenID: new BN(tokenID) });
    
                tokenID++;
                rentalID++;
                tx = await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 4444, "Mon outil4", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(tokenID) });

                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 33, 350, tokenID, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rentalID), tokenID: new BN(tokenID) });
            });
    
    
            it("... owner can delete a Rental  - check rental stored before delete", async () => {
                 let rentals = await anyRentalInstance.getRentalsByOwner(_owner1);     
                 expect(new BN(rentals.length)).to.be.bignumber.equal(new BN(3));
                 expect(new BN(rentals[0].dayPrice)).to.be.bignumber.equal(new BN(11));
                 expect(new BN(rentals[1].dayPrice)).to.be.bignumber.equal(new BN(22));
                 expect(new BN(rentals[2].dayPrice)).to.be.bignumber.equal(new BN(33));
         });
    
            it("... owner can delete a Rental - should emit ToolDeletedFromRentals", async () => {
                 tx = await anyRentalInstance.deleteToolIntoRentals(1, { from: _owner1 });
                 expectEvent(tx, "ToolDeletedFromRentals", { renter: _owner1,  toolID: new BN(1) });
    
            });
            it("... owner can delete a Rental - check rentals", async () => {
                 tx = await anyRentalInstance.deleteToolIntoRentals(1,{ from: _owner1 });
    
                 let rentals = await anyRentalInstance.getRentalsByOwner(_owner1);     
                 expect(new BN(rentals.length)).to.be.bignumber.equal(new BN(2));
                 expect(new BN(rentals[0].dayPrice)).to.be.bignumber.equal(new BN(11));
                 expect(new BN(rentals[1].dayPrice)).to.be.bignumber.equal(new BN(33));
             });
    
        });
        
    });
        
    /**
     * * AnyRental check all the managment of a rental (workflow)
     */
    describe('AnyRental: Rental workflow (process between user, renter and DAO)', () => {
        let collectionAddress;
        let token1 = 1;
        let rental1 = 0;
        let token2 = 2;
        let rental2 = 1;
        let token3 = 3;
        let rental3 = 2;
        
        let tokenURI = "https://www.example.com/tokenURI";
        let tokenImgURI = "https://www.example.com/tokenURI.png";

        const start = Math.floor(new Date().getTime()/1000) + 86400;
        const end = Math.floor(new Date().getTime()/1000) + (86400 *2);

        describe('-- renter shoud send paiment for a rental', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });

                // add a colelction to owner2 to have another one
                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });


            });


            it("... renter should book a rental, sending paiement and caution - emit ToolAddedToRentals", async () => {

                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
            });

            it("... renter should book a rental, sending paiement and caution - check Rental object stored", async () => {

                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(1));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.true;
                expect(new BN(rentalRetuned.rentalData.isNFTDelegated)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isToolReturned)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isReturnValidated)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.Dispute)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isDisputeConfirmed)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isRedeemed)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.renter).to.be.equal(_renter1);
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI);
            });            

            it("... renter should book a rental, sending paiement and caution - check paiement", async () => {
            });

            it("... renter could not book a rental, sending paiement and caution with errors dates", async () => {
                await expectRevert(
                    anyRentalInstance.sendPaiementForRental(_owner1, rental1, end, start  ,{ from: _renter1 }),
                    "End of rental can't be before begin"
                );
            });
            it("... renter could not book a rental, sending paiement and caution with wrong renter", async () => {
                await expectRevert(
                    anyRentalInstance.sendPaiementForRental(_user, rental1,start, end  ,{ from: _renter1 }),
                    "Owner does not exist"
                );
            });
            it("... renter could not book a rental, sending paiement and caution with wrong rental ID", async () => {
                await expectRevert(
                    anyRentalInstance.sendPaiementForRental(_owner1, 3, start, end  ,{ from: _renter1 }),
                    "The rental is not available"
                );
            });
            it("... renter could not book a rental that does not exist", async () => {
                await expectRevert(
                    anyRentalInstance.sendPaiementForRental(_owner1, 4, end, start  ,{ from: _renter1 }),
                    "Tool does not exist"
                );
            });
            it("... renter could not book a rental with a bad start date", async () => {
                await expectRevert(
                    anyRentalInstance.sendPaiementForRental(_owner1, rental1, 0, end  ,{ from: _renter1 }),
                    "begin must be a valid date"
                );
            });
            it("... renter could not book a rental with a bad end date", async () => {
                await expectRevert(
                    anyRentalInstance.sendPaiementForRental(_owner1, rental1, start,0  ,{ from: _renter1 }),
                    "end must be a valid date"
                );
            });
            it("... renter could not book a rental with a bad status", async () => {
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  

                await expectRevert(
                    anyRentalInstance.sendPaiementForRental(_owner1, rental1, start,end  ,{ from: _renter1 }),
                    "The rental status is incorrect."
                );
            });

        });
        describe('-- owner shoud validate a NFT delegation to a renter (in order to validate the rental asking)', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });


                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });

                //  user 1 rent renter 1 object
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
     


            });


            it("... owner should validate the sending ot NFT   - emit RentalAccepted", async () => {
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
            });

            it("... owner should validate the sending ot NFT - check rental params", async () => {

                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(RentalStatus.RENTAL_ACCEPTED_NFT_SENT));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.true;
                expect(rentalRetuned.rentalData.isNFTDelegated).to.be.true;
                expect(new BN(rentalRetuned.rentalData.isToolReturned)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isReturnValidated)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.Dispute)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isDisputeConfirmed)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isRedeemed)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.renter).to.be.equal(_renter1);
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI);
            });   
            
        });
        it("... owner should validate the sending ot NFT - with wrong rental ID", async () => {
            await expectRevert(
                anyRentalInstance.validateNFTDelegationForRental(4, token1, { from: _owner1 }),
                "Tool does not exist"
            );
        });
        it("... owner should validate the sending ot NFT - a rental that does not exist", async () => {
            await expectRevert(
                anyRentalInstance.validateNFTDelegationForRental(rental1, 0, { from: _owner1 }),
                "token ID must be valid"
            );

            it("... owner should validate the sending ot NFT in wrong status", async () => {
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });


                await expectRevert(
                    anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 }),
                    "The rental status is incorrect."
                );
            });
    
            
        });
        describe('-- renter shoud validate a NFT reception (in order to validate the receipt of the tool in real life)', () => {

            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });


                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });

                //  user 1 rent renter 1 object
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
     
                //owner validate NFT delegation 
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
            });


            it("... renter should validate the receipt of NFT and the tool in real life  - emit RentalAccepted", async () => {
                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalNFTToolDelegated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
            });

            it("... renter should book a rental, sending paiement and caution - check rental params", async () => {

                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(RentalStatus.VALIDATE_RECEIPT_PAYMENT));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.true;
                expect(rentalRetuned.rentalData.isNFTDelegated).to.be.true;
                expect(new BN(rentalRetuned.rentalData.isToolReturned)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.Dispute)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isDisputeConfirmed)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isRedeemed)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.renter).to.be.equal(_renter1);
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI);
            });      
            
            
            it("...renter should not book a rental, sending paiement and caution - with wrong rental ID", async () => {
                await expectRevert(
                    anyRentalInstance.validateNFTandToolReception(_owner1, 4, { from: _renter1 }),
                    "Tool does not exist"
                );
            });
    
            it("... renter should not book a rental, sending paiement and caution -  in wrong status", async () => {
                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalNFTToolDelegated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });


                await expectRevert(
                    anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 }),
                    "The rental status is incorrect."
                );
            });

        });
        describe('-- [After time...] renter shoud give back the tool to end the rental', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });


                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });

                //  user 1 rent renter 1 object
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
     
                //owner validate NFT delegation 
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
    
                // user validate the NFT reception and tool in real life
                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalNFTToolDelegated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  

            });


            it("... renter shoud give back the tool  - emit RentalCompletedByUser", async () => {
                tx = await anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalCompletedByUser", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
            });

            it("... renter shoud give back the tool - check Rental stored params", async () => {

                tx = await anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(RentalStatus.COMPLETED_USER));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.true;
                expect(rentalRetuned.rentalData.isNFTDelegated).to.be.true;
                expect(rentalRetuned.rentalData.isToolReturned).to.be.true;
                expect(new BN(rentalRetuned.rentalData.Dispute)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isDisputeConfirmed)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isRedeemed)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.renter).to.be.equal(_renter1);
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI);
            });            

            it("... renter shoud not give back the tool - with wrong rental ID", async () => {
                await expectRevert(
                    anyRentalInstance.giveBackToolAfterRental(_owner1, 4, { from: _renter1 }),
                    "Tool does not exist"
                );
            });
    
            it("...  renter shoud  not give back the tool -  in wrong status", async () => {
                tx = await anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalCompletedByUser", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });


                await expectRevert(
                    anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 }),
                    "The rental status is incorrect."
                );
            });


        });
        describe('-- owner shoud validate the return of the tool and end the rental', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });


                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });

                //  user 1 rent renter 1 object
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
     
                //owner validate NFT delegation 
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
    
                // user validate the NFT reception and tool in real life
                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalNFTToolDelegated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                // user give back the tool
                tx = await anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalCompletedByUser", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  

            });


            it("... owner shoud validate the return of the tool and end the rental  - emit RentalCompletedByRenter", async () => {
                tx = await anyRentalInstance.validateReturnToolAfterRental( rental1, { from: _owner1 });
                expectEvent(tx, "RentalCompletedByRenter", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
            });

            it("... owner shoud validate the return of the tool and end the rental - check Rental stored params", async () => {

                tx = await anyRentalInstance.validateReturnToolAfterRental(rental1, { from: _owner1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(RentalStatus.RETURN_ACCEPTED_BY_OWNER));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.true;
                expect(rentalRetuned.rentalData.isNFTDelegated).to.be.true;
                expect(rentalRetuned.rentalData.isToolReturned).to.be.true;
                expect(rentalRetuned.rentalData.isReturnValidated).to.be.true;
                expect(new BN(rentalRetuned.rentalData.Dispute)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isDisputeConfirmed)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isRedeemed)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.renter).to.be.equal(_renter1);
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI);
            });          
            
            it("... owner shoud not validate the return of the tool and end the rental -  with wrong rental ID", async () => {
                await expectRevert(
                    anyRentalInstance.validateReturnToolAfterRental( 4, { from: _owner1 }),
                    "Tool does not exist"
                );
            });
    
            it("...  owner shoud not validate the return of the tool and end the rental -   in wrong status", async () => {
                tx = await anyRentalInstance.validateReturnToolAfterRental( rental1, { from: _owner1 });
                expectEvent(tx, "RentalCompletedByRenter", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });



                await expectRevert(
                    anyRentalInstance.validateReturnToolAfterRental( rental1, { from: _owner1 }),
                    "The rental status is incorrect."
                );
            });


        });
        describe('-- owner shoud refuse the return of the tool and create a dispute', () => {
            let msg = "Mon outils a été déterioré";
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });


                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });

                //  user 1 rent renter 1 object
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
     
                //owner validate NFT delegation 
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
    
                // user validate the NFT reception and tool in real life
                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalNFTToolDelegated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                // user give back the tool
                tx = await anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalCompletedByUser", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  

            });


            it("... renter shoud refuse the return of the tool and create a dispute  - emit RentalDisputeCreated", async () => {
                tx = await anyRentalInstance.refuseReturnToolAfterRental( rental1, msg, { from: _owner1 });
                expectEvent(tx, "RentalDisputeCreated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, dispute: msg, tokenId: new BN(token1) });
            });

            it("... renter shoud refuse the return of the tool and create a dispute - check Rental stored params", async () => {

                tx = await anyRentalInstance.refuseReturnToolAfterRental(rental1, msg, { from: _owner1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(RentalStatus.DISPUTE));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.true;
                expect(rentalRetuned.rentalData.isNFTDelegated).to.be.true;
                expect(rentalRetuned.rentalData.isToolReturned).to.be.true;
                expect(new BN(rentalRetuned.rentalData.isReturnValidated)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.rentalData.isDispute).to.be.true;
                expect(new BN(rentalRetuned.rentalData.isDisputeConfirmed)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isRedeemed)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.renter).to.be.equal(_renter1);
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI);
            });     
            
            it("... renter shoud rnot efuse the return of the tool and create a dispute -  with wrong rental ID", async () => {
                await expectRevert(
                    anyRentalInstance.refuseReturnToolAfterRental( 4, msg, { from: _owner1 }),
                    "Tool does not exist"
                );
            });
    
            it("...  renter shoud not refuse the return of the tool and create a dispute -   in wrong status", async () => {
                tx = await anyRentalInstance.refuseReturnToolAfterRental( rental1, msg, { from: _owner1 });
                expectEvent(tx, "RentalDisputeCreated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, dispute: msg, tokenId: new BN(token1) });

                await expectRevert(
                    anyRentalInstance.refuseReturnToolAfterRental( rental1, msg, { from: _owner1 }),
                    "The rental status is incorrect."
                );
            });


        });
        describe('-- renter should confirm the dispute', () => {
            const disputeOwner = "Mon objet a été abimé";
            const disputeRenter = "c'est faux, il était comme ca avant";
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });


                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });

                //  user 1 rent renter 1 object
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
     
                //owner validate NFT delegation 
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
    
                // user validate the NFT reception and tool in real life
                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalNFTToolDelegated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                // user give back the tool
                tx = await anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalCompletedByUser", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                // renter refuse the rental and create a dispute
                tx = await anyRentalInstance.refuseReturnToolAfterRental( rental1, disputeOwner, { from: _owner1 });
                expectEvent(tx, "RentalDisputeCreated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, dispute:disputeOwner, tokenId: new BN(token1) });
  

            });


            it("... renter should confirm the dispute  - emit RentalDisputelConfirmedByUser", async () => {
                tx = await anyRentalInstance.confirmDisputeAfterRental(_owner1, rental1, disputeRenter, { from: _renter1 });
                expectEvent(tx, "RentalDisputelConfirmedByUser", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, dispute:disputeRenter, tokenId: new BN(token1) });
            });

            it("... renter should confirm the dispute - check Rental stored params", async () => {

                tx = await anyRentalInstance.confirmDisputeAfterRental(_owner1, rental1, disputeRenter, { from: _renter1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(RentalStatus.DISPUTE));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.true;
                expect(rentalRetuned.rentalData.isNFTDelegated).to.be.true;
                expect(rentalRetuned.rentalData.isToolReturned).to.be.true;
                expect(rentalRetuned.rentalData.isReturnValidated).to.be.false;
                expect(rentalRetuned.rentalData.isDispute).to.be.true;
                expect(rentalRetuned.rentalData.isDisputeConfirmed).to.be.true;
                expect(new BN(rentalRetuned.rentalData.isRedeemed)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.renter).to.be.equal(_renter1);
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI);
            });     
            
            it("... renter shoud not refuse the return of the tool and create a dispute -  with wrong rental ID", async () => {
                await expectRevert(
                    anyRentalInstance.confirmDisputeAfterRental(_owner1, 4, disputeRenter, { from: _renter1 }),
                    "Tool does not exist"
                );
            });
    
     });
        describe('-- renter shoud redeem its payment (caution or rental decline)', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });


                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });

                //  user 1 rent renter 1 object
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
     
                //owner validate NFT delegation 
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
    
                // user validate the NFT reception and tool in real life
                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalNFTToolDelegated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                // user give back the tool
                tx = await anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalCompletedByUser", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                //renter valiate the return
                tx = await anyRentalInstance.validateReturnToolAfterRental( rental1, { from: _owner1 });
                expectEvent(tx, "RentalCompletedByRenter", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });


            });


            it("... renter should redeem its caution after the renter validation  - emit RentalEnded", async () => {
                tx = await anyRentalInstance.redeemPaymentForRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalEnded", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
            });

            it("... renter should redeem its caution after the renter validation - check Rental stored params", async () => {

                tx = await anyRentalInstance.redeemPaymentForRental(_owner1, rental1, { from: _renter1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(RentalStatus.RENTAL_ENDED));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.false;
                expect(rentalRetuned.rentalData.isNFTDelegated).to.be.true;
                expect(rentalRetuned.rentalData.isToolReturned).to.be.true;
                expect(rentalRetuned.rentalData.isReturnValidated).to.be.true;
                expect(new BN(rentalRetuned.rentalData.Dispute)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalData.isDisputeConfirmed)).to.be.bignumber.equal(new BN(0));
                expect(rentalRetuned.rentalData.isRedeemed).to.be.true;
                expect(rentalRetuned.renter).to.be.equal(_renter1);
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI );
            });      
            
            it("... renter should not redeem its caution after the renter validation -  with wrong rental ID", async () => {
                await expectRevert(
                    anyRentalInstance.redeemPaymentForRental(_owner1, 4, { from: _renter1 }),
                    "Tool does not exist"
                );
            });
    
            it("... renter should not redeem its caution after the renter validation -   in wrong status", async () => {
                tx = await anyRentalInstance.redeemPaymentForRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalEnded", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                tx = await anyRentalInstance.rentAgainRental( rental1, { from: _owner1 });
                expectEvent(tx, "RentalReAvailable", { renter: _owner1, user: "0x0000000000000000000000000000000000000000", tokenId: new BN(token1) });

                await expectRevert(
                     anyRentalInstance.redeemPaymentForRental(_owner1, rental1, { from: _renter1 }),
                    "The rental status is incorrect."
                );
            });



        });    
        
        describe('-- owner shoud re rent its tool', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _contractOwner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _contractOwner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _contractOwner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _owner1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _owner1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 11, 200, token1, { from: _owner1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 20, 300, token2, { from: _owner1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _owner1,  rentalID: new BN(rental2) });


                 let tx2 = await anyRentalInstance.createCollection("Collection de test for renter2", "CT2", { from: _owner2 });
                 expectEvent(tx2, 'NFTCollectionCreated', { renter: _owner2, renterCollectionName:"Collection de test for renter2"  });
                 
                // add third tool to another one to increment toolID
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _owner2 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _owner2,  tokenId: new BN(token1) });    //token 1 de la seconde collection
                tx = await anyRentalInstance.addToolToRentals(tokenImgURI, 5, 40, token1, { from: _owner2 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _owner2,  rentalID: new BN(rental3) });

                //  user 1 rent renter 1 object
                tx = await anyRentalInstance.sendPaiementForRental(_owner1, rental1, start, end  ,{ from: _renter1 });
                expectEvent(tx, "RentalRequested", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
     
                //owner validate NFT delegation 
                tx = await anyRentalInstance.validateNFTDelegationForRental(rental1, token1, { from: _owner1 });
                expectEvent(tx, "RentalAccepted", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
    
                // user validate the NFT reception and tool in real life
                tx = await anyRentalInstance.validateNFTandToolReception(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalNFTToolDelegated", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                // user give back the tool
                tx = await anyRentalInstance.giveBackToolAfterRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalCompletedByUser", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
  
                //renter valiate the return
                tx = await anyRentalInstance.validateReturnToolAfterRental( rental1, { from: _owner1 });
                expectEvent(tx, "RentalCompletedByRenter", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });


                tx = await anyRentalInstance.redeemPaymentForRental(_owner1, rental1, { from: _renter1 });
                expectEvent(tx, "RentalEnded", { renter: _owner1, user: _renter1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });

            });


            it("... owner shoud re rent its tool  - emit RentalEnded", async () => {
                tx = await anyRentalInstance.rentAgainRental( rental1, { from: _owner1 });
                expectEvent(tx, "RentalReAvailable", { renter: _owner1, user: "0x0000000000000000000000000000000000000000", tokenId: new BN(token1) });
            });

            it("... owner shoud re rent its tool - check Rental stored params", async () => {

                tx = await anyRentalInstance.rentAgainRental( rental1, { from: _owner1 });
               
                const rentalRetuned = await anyRentalInstance.getRentalByOwnerAddressAndRentalID(_owner1, rental1);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rental1));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(200));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(RentalStatus.AVAILABLE));
                expect(rentalRetuned.rentalData.isCautionDeposed).to.be.false;
                expect(rentalRetuned.rentalData.isNFTDelegated).to.be.false;
                expect(rentalRetuned.rentalData.isToolReturned).to.be.false;
                expect(rentalRetuned.rentalData.isReturnValidated).to.be.false;
                expect(rentalRetuned.rentalData.isDisputeConfirmed).to.be.false;
                expect(rentalRetuned.rentalData.isRedeemed).to.be.false;
                expect(rentalRetuned.renter).to.be.equal("0x0000000000000000000000000000000000000000");
                expect(rentalRetuned.collection.collection).to.be.equal(collectionAddress);
                expect((rentalRetuned.collection.owner)).to.be.equal(_owner1);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(token1));
                expect(rentalRetuned.tokenImgURI).to.be.equal(tokenImgURI );
            });      
            
            it("... owner shoud not re rent its tool -  with wrong rental ID", async () => {
                await expectRevert(
                    anyRentalInstance.rentAgainRental( 4, { from: _owner1 }),
                    "Tool does not exist"
                );
            });
    
            it("... owner shoud not re rent its tool -   in wrong status", async () => {
                tx = await anyRentalInstance.rentAgainRental( rental1, { from: _owner1 });
                expectEvent(tx, "RentalReAvailable", { renter: _owner1, user: "0x0000000000000000000000000000000000000000", renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });

                await expectRevert(
                    anyRentalInstance.rentAgainRental( rental1, { from: _owner1 }),
                    "The rental status is incorrect."
                );
            });



        });           
    });
});
  