const AnyRental = artifacts.require('./AnyRental.sol');
const AnyNFTCollectionFactory = artifacts.require('./AnyNFTCollectionFactory.sol')
const AnyNFTCollection = artifacts.require('./AnyNFTCollection.sol');
const AnyNFTCollectionJSon = require('../../client/src/contracts/AnyNFTCollection.json');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');




contract('AnyRental', accounts => {
    const _owner = accounts[0];
    const _renter1 = accounts[1];
    const _renter2 = accounts[2];
    const _user1 = accounts[3];
    const _user2 = accounts[4];
    const _user3 = accounts[5];
  

    //instance declaration
    let anyNFTFactoryInstance;
    let anyRentalInstance;


   async function debug(collectionAddress){
       console.log("-----------------------------------------------------------------------"); 
       console.log("-- owner est :                        "+_owner);
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
    describe('AnyRental: Deploiement', () => {
            beforeEach(async function () {
                // new instance each time : new() not deploy().
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });
            });

            it("...Should store the administrator address", async () => {
                let owner = await anyRentalInstance.owner.call();
                expect(owner).to.equal(_owner);
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
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });
            });

    });

    /**
     * AnyRental check all the managment of the NFTs factory
     */
    describe('AnyRental:  NFTs collection management (a NFT Tool throw the factory)', () => {
        describe('-- create collection NFTs', () => {
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address, { from: _owner });
            });

            it("... owner should create a NFT collection", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner, renterCollectionName:"Collection de test"  });
            });
            it("... renter should create a NFT collection", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });
            });
            it("... renter shouldn't create a NFT collection without name", async () => {
                await expectRevert(anyRentalInstance.createCollection("", "CT", {from:_renter1}), "collection name can't be empty");
            });
            it("... renter shouldn't create two NFT collection", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });
                await expectRevert(anyRentalInstance.createCollection("Collection de test 2", "CT", { from: _renter1 }), "You already have created your collection");
            });

            it("... renter created a NFT collection - Check the renter is the owner and instance name is OK ", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });
                let collectionAddress = tx.logs[2].args.renterCollectionAddress;
                //await debug(collectionAddress);
                
                let collectionInstance = await AnyNFTCollection.at(collectionAddress);
                // pour mémoire autre manière de faire
                //let collectionInstance = new web3.eth.Contract(AnyNFTCollectionJSon.abi, collectionAddress);
                
                
                const ownerAddress = await collectionInstance.owner.call();
                //const ownerAddress = await collectionInstance.methods.owner().call();
                expect(ownerAddress).to.be.equal(_renter1);

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


        describe('-- delete a collection NFTs', () => {
            let collectionAddress;
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT",{ from: _owner });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;
            });

            it("... owner should delete a NFT collection", async () => {

                const addressColBefore = await anyRentalInstance.getToolsCollectionAddress(_owner)
                expect(addressColBefore).to.be.equal(collectionAddress);

                const ownerAddress = await anyRentalInstance.owner.call();
                expect(ownerAddress).to.be.equal(_owner);

                let tx = await anyRentalInstance.deleteCollection();
                expectEvent(tx, 'NFTCollectionDeleted', { renter: _owner });

                const addressColl = await anyRentalInstance.getToolsCollectionAddress(_owner)
                expect(addressColl).to.be.equal("0x0000000000000000000000000000000000000000");
            });
        });
    

        describe('-- add NFT to collection', () => {
            let collectionAddress;
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;
            });


            it("... renter should be able to add a NFT tool to their collection", async () => {
                let tx = await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _renter1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _renter1,  tokenId: new BN(1) });
            });

            it("... user could'nt add a NFT tool if not the owner", async () => {
                //await debug(collectionAddress);
                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _renter2 }),
                    "You don't have any collection"
                );        
            });

            /* it("... a renter can't add a NFT tool to another renter collection", async () => {

                // another renter on another collection
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter2 });

                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _renter2 }),
                    "You are not the owner of the collection"
                    );
                
            });*/
        
            it.skip("... renter should not allow adding a tool to a collection over the maximum count", async () => {
                const MAX_TOOLS = 3;
                anyRentalInstance.setNbRentalMax(MAX_TOOLS);
                
                for (let i = 0; i < MAX_TOOLS; i++) {
                    await anyRentalInstance.addToolToCollection(`https://www.example.com/tokenURI${i}`, i, `Outil ${i}`, `Description de l'outil ${i}`, { from: _renter1 });
                }
                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _renter1 }),
                    "Maximum number of tools reached"
                );
            });
        
            it("... should not allow adding a tool to a non-existent collection", async () => {
                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _renter2 }),
                    "You don't have any collection"
                );
            });     
        });

        describe('-- delegate NFT to a user', () => {
            let collectionAddress;
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });

                await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI_1", 12345, "Mon outil 2", "Une description de mon outil 2", { from: _renter1 });
                await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI_2", 64899, "Mon outil 2", "Une description de mon outil 2", { from: _renter1 });


                collectionAddress = tx.logs[2].args.renterCollectionAddress;
            });

            /*it("... renter should delegate a NFT to a users", async () => {
                await debug(collectionAddress);
                const tokenID = 1;
                const expires = Math.floor(new Date().getTime()/1000) + 100;

                let tx = await anyRentalInstance.delegateNFT(tokenID, _user1, expires , {from: _renter1});
                expectEvent(tx, 'rentalNFTToolDelegated', { renter: _renter1,  user: _user1, renterCollectionAddress: anyRentalInstance.address, tokenId: tokenID, expires: new BN(expires) });
                
            });*/
            
        });

        
    });

      /**
     * * AnyRental check all the managment of the Rentals of a renter (add/update/delete)
     */
     describe('AnyRental: rental management (a Rental into a renter list of rentals)', () => {
         describe('-- renter shoud add a Rental to  Rentals', () => {
            let collectionAddress;
            let tokenID = 1;
            let tokenURI = "https://www.example.com/tokenURI";
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _renter1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _renter1,  tokenId: new BN(tokenID) });

                rentalExpected = {
                    "rentalID": 0, 
                    "dayPrice": 11, 
                    "caution": 200, 
                    "start": 0, 
                    "end": 0, 
                    "rentalStatus": 0, 
                    "isCautionDeposed": false, 
                    "isNFTDelegated": false, 
                    "isDispute": false, 
                    "isRedeemed": false,
                    "renter": "0x0000000000000000000000000000000000000000",
                    "collection": {
                        "collection":collectionAddress.address, 
                        "owner":_renter1
                    },
                    "tokenID": tokenID, 
                    "tokenURI": tokenURI
                }
            });


            it("... after the NFT creation, owner can add a Rental - should emit ToolAddedToRentals", async () => {
                tx = await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI,{ from: _renter1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(0), tokenID: new BN(tokenID) });
            });

            it("... after the NFT creation, owner can add a Rental -  should emit 2 ToolAddedToRentals ", async () => {
                tx = await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI,{ from: _renter1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(0), tokenID: new BN(tokenID) });

                tx = await anyRentalInstance.addToolToRentals(54, 800,  2,"http://another-one",{ from: _renter1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(1), tokenID: new BN(2) });

            });
            
            it("... after the NFT creation, owner can add a Rental  - check rental stored", async () => {
                       
                await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI,{ from: _renter1 });
                
                const rentalRetuned = await anyRentalInstance.getRenterToolByID(_renter1, 0);
                expect(new BN(rentalRetuned.rentalID)).to.be.bignumber.equal(new BN(rentalExpected.rentalID));
                expect(new BN( rentalRetuned.dayPrice)).to.be.bignumber.equal(new BN(rentalExpected.dayPrice));
                expect(new BN(rentalRetuned.caution)).to.be.bignumber.equal(new BN(rentalExpected.caution));
                expect(new BN(rentalRetuned.start)).to.be.bignumber.equal(new BN(rentalExpected.start));
                expect(new BN(rentalRetuned.end)).to.be.bignumber.equal(new BN(rentalExpected.end));
                expect(new BN(rentalRetuned.rentalStatus)).to.be.bignumber.equal(new BN(rentalExpected.rentalStatus));
                expect(new BN(rentalRetuned.isCautionDeposed)).to.be.bignumber.equal(new BN(rentalExpected.isCautionDeposed));
                expect(new BN(rentalRetuned.isNFTDelegated)).to.be.bignumber.equal(new BN(rentalExpected.isNFTDelegated));
                expect(new BN(rentalRetuned.isDispute)).to.be.bignumber.equal(new BN(rentalExpected.isDispute));
                expect(new BN(rentalRetuned.isRedeemed)).to.be.bignumber.equal(new BN(rentalExpected.isRedeemed));
                expect(rentalRetuned.renter).to.be.equal(rentalExpected.renter);
                //TODO ICI
                //expect(rentalRetuned.collection.collection).to.be.equal(rentalExpected.collection.collection);
                //expect((rentalRetuned.collection.owner)).to.be.equal(rentalExpected.collection.owner);
                expect(new BN(rentalRetuned.tokenID)).to.be.bignumber.equal(new BN(rentalExpected.tokenID));
                expect(rentalRetuned.tokenURI).to.be.equal(rentalExpected.tokenURI);
            });

            it("... after the NFT creation, should revert if the renter does'nt have any collection", async () => {
                await expectRevert(
                    anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI, { from: _renter2 }),
                    "You don't have any collection"
                );
            });
        
            it("... after the NFT creation, should revert if the renter reached the maximum size of tools", async () => {
               const MAX_TOOLS = 3;
               anyRentalInstance.setNbRentalMax(MAX_TOOLS)
               
                await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI, { from: _renter1 });
                await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI, { from: _renter1 });
                await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI, { from: _renter1 });
        
                await expectRevert(
                    anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI, { from: _renter1 }),
                    "Maximum number of tools reached"
                );
            });
        
            it("... after the NFT creation, should revert if the day price is not greater than 0", async () => {
                await expectRevert(
                    anyRentalInstance.addToolToRentals(0, 200, tokenID, tokenURI, { from: _renter1 }),
                    "number must be > 0"
                );
            });
        
            it("... after the NFT creation, should revert if the caution is not greater than 0", async () => {
                await expectRevert(
                    anyRentalInstance.addToolToRentals(11, 0, tokenID, tokenURI, { from: _renter1 }),
                    "number must be > 0"
                );
            });
        
            it("... after the NFT creation, event with correct data", async () => {
                const receipt = await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI, { from: _renter1 });
        
                expectEvent(receipt, "ToolAddedToRentals", {
                    renter: _renter1,
                    toolID: new BN(0)
                });
            });
        
        });
        describe('-- update a Rental into Rentals', () => {
            let collectionAddress;
            let tokenID = 1;
            tokenURI = "https://www.example.com/tokenURI";
            
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });
                
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });
                
                collectionAddress = tx.logs[2].args.renterCollectionAddress;
                
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _renter1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _renter1,  tokenId: new BN(tokenID) });
                
                tx = await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI,{ from: _renter1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(0) });
                
                rentalExpected = {
                    "rentalID": 0, 
                    "dayPrice": 21, 
                    "caution": 210, 
                }
            });
            
            
            it("...  owner can update a Rental  - check rental stored before update", async () => {
                let rentalDefault = await anyRentalInstance.getRenterToolByID(_renter1, 0);     
                expect(new BN(rentalDefault.rentalID)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalDefault.dayPrice)).to.be.bignumber.equal(new BN(11));
                expect(new BN(rentalDefault.caution)).to.be.bignumber.equal(new BN(200));
            });
            
            it("... owner can update a Rental - should emit ToolUpdatedFromRentals", async () => {
                tx = await anyRentalInstance.updateToolIntoRentals(0, 21, 210,{ from: _renter1 });
                expectEvent(tx, "ToolUpdatedFromRentals", { renter: _renter1,  toolID: new BN(0) });
                
            });
            it("... owner can update a Rental - check modifications", async () => {
                tx = await anyRentalInstance.updateToolIntoRentals(0, 21, 210,{ from: _renter1 });
                
                let rentalDefault = await anyRentalInstance.getRenterToolByID(_renter1, 0);    
                
                expect(new BN(rentalDefault.rentalID)).to.be.bignumber.equal(new BN(0));
                expect(new BN(rentalDefault.dayPrice)).to.be.bignumber.equal(new BN(rentalExpected.dayPrice));
                expect(new BN(rentalDefault.caution)).to.be.bignumber.equal(new BN(rentalExpected.caution));
            });
            
        });
        
        describe('-- delete a Rental into Rentals', () => {
            let collectionAddress;
            let tokenID = 1;
            tokenURI = "https://www.example.com/tokenURI";
           
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });
    
                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });
    
                collectionAddress = tx.logs[2].args.renterCollectionAddress;
    
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _renter1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _renter1,  tokenId: new BN(tokenID) });
    
               tx = await anyRentalInstance.addToolToRentals(11, 200, tokenID, tokenURI,{ from: _renter1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(0) });
             
                tx = await anyRentalInstance.addToolToRentals(22, 420, tokenID, tokenURI,{ from: _renter1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(1) });
    
                tx = await anyRentalInstance.addToolToRentals(33, 350, tokenID, tokenURI,{ from: _renter1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(2) });
            });
    
    
            it("...  owner can delete a Rental  - check rental stored before delete", async () => {
                 let rentals = await anyRentalInstance.getRenterTools(_renter1);     
                 expect(new BN(rentals.length)).to.be.bignumber.equal(new BN(3));
                 expect(new BN(rentals[0].dayPrice)).to.be.bignumber.equal(new BN(11));
                 expect(new BN(rentals[1].dayPrice)).to.be.bignumber.equal(new BN(22));
                 expect(new BN(rentals[2].dayPrice)).to.be.bignumber.equal(new BN(33));
         });
    
            it("... owner can delete a Rental - should emit ToolDeletedFromRentals", async () => {
                 tx = await anyRentalInstance.deleteToolIntoRentals(1, { from: _renter1 });
                 expectEvent(tx, "ToolDeletedFromRentals", { renter: _renter1,  toolID: new BN(1) });
    
            });
            it("... owner can delete a Rental - check rentals", async () => {
                 tx = await anyRentalInstance.deleteToolIntoRentals(1,{ from: _renter1 });
    
                 let rentals = await anyRentalInstance.getRenterTools(_renter1);     
                 expect(new BN(rentals.length)).to.be.bignumber.equal(new BN(2));
                 expect(new BN(rentals[0].dayPrice)).to.be.bignumber.equal(new BN(11));
                 expect(new BN(rentals[1].dayPrice)).to.be.bignumber.equal(new BN(33));
             });
    
        });
        
    });
        
    /**
     * * AnyRental check all the managment of a rental (workflow)
     */
    describe('AnyRental: rental workflow (process between user, renter and DAO)', () => {
        describe('-- user shoud send paiment for a rental', () => {

            let collectionAddress;
            let token1 = 1;
            let rental1 = 0;
            let token2 = 2;
            let rental2 = 1;
            beforeEach(async function () {
                anyNFTFactoryInstance = await AnyNFTCollectionFactory.new({from: _owner});
                anyRentalInstance = await AnyRental.new(anyNFTFactoryInstance.address,{ from: _owner });
                await anyNFTFactoryInstance.transferOwnership(anyRentalInstance.address,{ from: _owner });

                let tx = await anyRentalInstance.createCollection("Collection de test", "CT", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[2].args.renterCollectionAddress;

                // add first tool
                tx = await anyRentalInstance.addToolToCollection(tokenURI, 12345, "Mon outil", "Une description de mon outil", { from: _renter1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _renter1,  tokenId: new BN(token1) });
                tx = await anyRentalInstance.addToolToRentals(11, 200, token1, tokenURI,{ from: _renter1 });
                expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(rental1) });

                 // add second tool
                 tx = await anyRentalInstance.addToolToCollection(tokenURI, 345, "Velo", "roule bien", { from: _renter1 });
                 expectEvent(tx, "NFTToolAddedToCollection", { renter: _renter1,  tokenId: new BN(token2) });
                 tx = await anyRentalInstance.addToolToRentals(20, 300, token2, tokenURI,{ from: _renter1 });
                 expectEvent(tx, "ToolAddedToRentals", { renter: _renter1,  toolID: new BN(rental2) });
            });


            it("... user should book a rental, sending paiement and caution - emit ToolAddedToRentals", async () => {
                const start = Math.floor(new Date().getTime()/1000) + 86400;
                const end = Math.floor(new Date().getTime()/1000) + (86400 *2);
                tx = await anyRentalInstance.sendPaiementForRental(rental1, start, end  ,{ from: _user1 });
                expectEvent(tx, "rentalRequested", { renter: _renter1, user: _user1, renterCollectionAddress: collectionAddress, tokenId: new BN(token1) });
            });

            


        });
        describe('-- renter shoud validate a NFT delegation to a user (in order to validate the rental asking)', () => {
        });
        describe('-- user shoud validate a NFT reception (in order to validate the receipt of the tool)', () => {
        });
        describe('-- user shoud give back the tool to end the rental', () => {
        });
        describe('-- renter shoud validate the return of the tool and end the rental', () => {
        });
        describe('-- renter shoud refuse the return of the tool and create a dispute', () => {
        });
        describe('-- user shoud confirm the dispute', () => {
        });
        describe('-- user shoud redeem its payment (caution or rental decline)', () => {
        });
        
        
           
    });
});
  