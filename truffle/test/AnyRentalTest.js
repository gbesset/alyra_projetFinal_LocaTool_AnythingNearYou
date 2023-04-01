const AnyRental = artifacts.require('./AnyRental.sol');
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
  
    const MAX_TOOLS = new BN(3);

    //instance declaration
    let anyRentalInstance;


   async function debug(collectionAddress){
        let collectionInstance = await AnyNFTCollection.at(collectionAddress);
        console.log("-----------------------------------------------------------------------"); 
        console.log("-- owner est :                        "+_owner);
        console.log("-- _renter1 est :                     "+_renter1);
        const owner = await anyRentalInstance.owner();
        console.log("-- Le owner de AnyRental est          "+owner)
        console.log("-- l'adresse du contrat AnyRental est "+anyRentalInstance.address )

        const ownernft = await collectionInstance.owner.call();
        const factoryAddress = await collectionInstance.factory.call();
        console.log("-- Le owner de la collecion NFT crée est        "+ownernft)
        console.log("-- La factory qui a crée la collection NFT est  "+factoryAddress)
        console.log("-----------------------------------------------------------------------");
    }

    /**
     * Smart contract Deploiement
     */
    describe('Smart contract Deploiement', () => {
            beforeEach(async function () {
                // new instance each time : new() not deploy().
                anyRentalInstance = await AnyRental.new({ from: _owner });
            });

            it("...Should store the administrator address", async () => {
                let owner = await anyRentalInstance.owner.call();
                expect(owner).to.equal(_owner);
            });

            it('...Should be instantiated and default values defined', async () => {
                expect(await anyRentalInstance.MAX_TOOLS()).to.be.bignumber.equal(MAX_TOOLS);
            });
    });

        /**
     * Smart contract Permissions
     */
    describe('Smart contract Permissions', () => {
            beforeEach(async function () {
                anyRentalInstance = await AnyRental.new({ from: _owner });
            });

    });

    /**
     * Smart contract NFTs
     */
    describe('Smart contract collection NFTs', () => {
        describe('-- create collection NFTs', () => {
            beforeEach(async function () {
                anyRentalInstance = await AnyRental.new({ from: _owner });
            });

            it("... owner should create a NFT collection", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test",{ from: _owner });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner, renterCollectionName:"Collection de test"  });
            });
            it("... renter should create a NFT collection", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test",{ from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });
            });
            it("... renter shouldn't create a NFT collection without name", async () => {
                await expectRevert(anyRentalInstance.createCollection("", {from:_renter1}), "collection name can't be empty");
            });
            it("... renter shouldn't create two NFT collection", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });
                await expectRevert(anyRentalInstance.createCollection("Collection de test 2", { from: _renter1 }), "You already have created your collection");
            });

            it("... renter created a NFT collection - Check the renter is the owner and instance name is OK ", async () => {
                let tx = await anyRentalInstance.createCollection("Collection de test", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });
        
                let collectionAddress = tx.logs[1].args.renterCollectionAddress;
                //await debug(collectionAddress)
                
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
                expect(collectionSymbol).to.be.equal("ANY");

            });

        });


        describe('-- delete a collection NFTs', () => {
            let collectionAddress;
            beforeEach(async function () {
                anyRentalInstance = await AnyRental.new({ from: _owner });

                let tx = await anyRentalInstance.createCollection("Collection de test",{ from: _owner });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _owner, renterCollectionName:"Collection de test"  });

                collectionAddress = tx.logs[1].args.renterCollectionAddress;
            });

            it("... owner should delete a NFT collection", async () => {

                const addressColBefore = await anyRentalInstance.getCollectionAddress(_owner)
                expect(addressColBefore).to.be.equal(collectionAddress);

                const ownerAddress = await anyRentalInstance.owner.call();
                expect(ownerAddress).to.be.equal(_owner);

                let tx = await anyRentalInstance.deleteCollection();
                expectEvent(tx, 'NFTCollectionDeleted', { renter: _owner });

                const addressColl = await anyRentalInstance.getCollectionAddress(_owner)
                expect(addressColl).to.be.equal("0x0000000000000000000000000000000000000000");
            });
        });
    

        describe('-- add NFT to collection', () => {
            let collectionAddress;
            beforeEach(async function () {
                anyRentalInstance = await AnyRental.new({ from: _owner });

                let tx = await anyRentalInstance.createCollection("Collection de test", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });

                    collectionAddress = tx.logs[1].args.renterCollectionAddress;
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
                let tx = await anyRentalInstance.createCollection("Collection de test", { from: _renter2 });

                await expectRevert(
                    anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _renter2 }),
                    "You are not the owner of the collection"
                    );
                
            });*/
        
            it("... renter should not allow adding a tool to a collection over the maximum count", async () => {
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
                anyRentalInstance = await AnyRental.new({ from: _owner });

                let tx = await anyRentalInstance.createCollection("Collection de test", { from: _renter1 });
                expectEvent(tx, 'NFTCollectionCreated', { renter: _renter1, renterCollectionName:"Collection de test"  });

                await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI_1", 12345, "Mon outil 2", "Une description de mon outil 2", { from: _renter1 });
                await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI_2", 64899, "Mon outil 2", "Une description de mon outil 2", { from: _renter1 });


                collectionAddress = tx.logs[1].args.renterCollectionAddress;
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

    /*
    {"rentalID": 1, "dayPrice": 10, "caution": 100, "start": 1649124800, "end": 1649211200, "rentalStatus": 0, "isCautionDeposed": false, "isNFTDelegated": false, "isDispute": false, "isRedeemed": false, "renter": "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "collection": "0x52ed77e51efB6324C118f9783384F2Ae80e437d4", "tokenID": 123, "tokenURI": "http://test.com"}*/

    

});
  