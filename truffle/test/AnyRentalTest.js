const AnyRental = artifacts.require('./AnyRental.sol');
const AnyNFTCollectionJSon = require('../../client/src/contracts/AnyNFTCollection.json');
//const AnyNFTCollection = artifacts.require('./AnyNFTCollection.sol')
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
        let collectionInstance = new web3.eth.Contract(AnyNFTCollectionJSon.abi, collectionAddress);

        console.log("---------------------------------------------------------"); 
        console.log("-- owner est : "+_owner);
        console.log("-- _renter1 est : "+_renter1);
        const owner = await anyRentalInstance.owner();
        console.log("-- Le onwer de AnyRental est "+owner)
        console.log("-- l'adresse du contrat AnyRental est "+anyRentalInstance.address )

        const ownernft = await collectionInstance.methods.owner().call();
        const renterAddress = await collectionInstance.methods.renter().call();
        console.log("-- Le onwer de la collecion NFT crée est "+ownernft)
        console.log("-- Le renter de la collection NFT crée est  "+renterAddress)
        console.log("---------------------------------------------------------");
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
                let collectionInstance = new web3.eth.Contract(AnyNFTCollectionJSon.abi, collectionAddress);
                
                const renterAddress = await collectionInstance.methods.renter().call();
                expect(renterAddress).to.be.equal(_renter1);

                const collectionName = await collectionInstance.methods.name().call();
                expect(collectionName).to.be.equal("Collection de test");

                const collectionSymbol = await collectionInstance.methods.symbol().call();
                expect(collectionSymbol).to.be.equal("ANY");

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
                //await debug(collectionAddress);
                let tx = await anyRentalInstance.addToolToCollection("https://www.example.com/tokenURI", 12345, "Mon outil", "Une description de mon outil", { from: _renter1 });
                expectEvent(tx, "NFTToolAddedToCollection", { renter: _renter1,  tokenId: new BN(1) });
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
    
    });

  

});
  