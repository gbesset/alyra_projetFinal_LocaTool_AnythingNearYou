const AnyNFTCollection = artifacts.require('./AnyNFTCollection.sol');

const { BN, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract('AnyNFTCollection', accounts => {
    const _owner = accounts[0];
    const _renter1 = accounts[1];
    const _renter2 = accounts[2];
    const _user1 = accounts[3];
    const _user2 = accounts[4];
    const _user3 = accounts[5];


    //instance declaration
    let anyRentalCollectionInstance;

     /**
   * Smart contract Deploiement
   */
  describe('AnyNFTCollection Deploiement', () => {
    beforeEach(async function () {
         // new instance each time : new() not deploy().
         anyRentalCollectionInstance = await AnyNFTCollection.new("CollectionName", "CN",_renter1, { from: _owner });
    });

    it("...Should store the owner address", async () => {
        let owner = await anyRentalCollectionInstance.owner.call();
        expect(owner).to.equal(_owner);
    });

    it('...Should be instantiated and default values defined', async () => {
         expect(await anyRentalCollectionInstance.renter()).to.be.equal(_renter1);
         //expect(await anyRentalCollectionInstance.tools().length).to.be.bignumber.equal(1);
    });
});

describe('AnyNFTCollection mint NFT', () => {
    let tokenURI = "https://example.com/1";
    let serialId = 1234;
    let title = "Test Tool";
    let description = "This is a test tool";

    beforeEach(async function () {
         // new instance each time : new() not deploy().
         anyRentalCollectionInstance = await AnyNFTCollection.new("CollectionName", "CN",_renter1, { from: _owner });
    });

    it("... renter should mint a NFT", async () => {
        let tx = await anyRentalCollectionInstance.mint(tokenURI,serialId, title, description, _renter1, { from: _renter1 } );
        expectEvent(tx, 'NFTCreated', { owner: _renter1, tokenId: new BN(1) });
        
    });

    it("... renter should mint a NFT - getToolByTokenId verification", async () => {
        let tx = await anyRentalCollectionInstance.mint(tokenURI,serialId, title, description, _renter1, { from: _renter1 } );
        expectEvent(tx, 'NFTCreated', { owner: _renter1, tokenId: new BN(1) });

        const tool1 = await anyRentalCollectionInstance.getToolsByTokenID(1, { from: _renter1 } );
        expect(new BN(tool1.tokenID)).to.be.bignumber.equal(new BN(1));
        expect(new BN(tool1.serialID)).to.be.bignumber.equal(new BN(serialId));
        expect(tool1.title).to.be.equal(title);
        expect(tool1.description).to.be.equal(description);
        expect(tool1.tokenURI).to.be.equal(tokenURI);
        expect(tool1.isAvailable).to.be.true;
        
    });

    it("... renter should mint a NFT - getTools verification", async () => {
        let tx = await anyRentalCollectionInstance.mint(tokenURI,serialId, title, description, _renter1, { from: _renter1 } );
        expectEvent(tx, 'NFTCreated', { owner: _renter1, tokenId: new BN(1) });

        const tools = await anyRentalCollectionInstance.getTools({ from: _renter1 } );
        expect(tools).to.not.be.empty;
        expect(tools.length).to.be.equal(2);
        expect(new BN(tools[1].serialID)).to.be.bignumber.equal(new BN(serialId));
        expect(tools[1].title).to.be.equal(title);
        expect(tools[1].description).to.be.equal(description);
        expect(tools[1].isAvailable).to.be.true;
        
    });

});

describe('AnyNFTCollection burn NFT', () => {
    
    beforeEach(async function () {
        anyRentalCollectionInstance = await AnyNFTCollection.new("CollectionName", "CN", _renter1, { from: _owner });
        await anyRentalCollectionInstance.mint("https://www.example.com/tokenURI_1", 12345, "Mon outil 1", "Une description de mon outil 1", _renter1, { from: _renter1 });
        await anyRentalCollectionInstance.mint("https://www.example.com/tokenURI_2", 6789, "Mon outil 2", "Une description de mon outil 2", _renter1, { from: _renter1 });
   });

    it("... validate params before burn NFTs", async () => {
        const nbNFTs = await anyRentalCollectionInstance.balanceOf(_renter1, { from: _renter1 } );
        expect(new BN(nbNFTs)).to.be.bignumber.equal(new BN(2));

        const tool1 = await anyRentalCollectionInstance.getToolsByTokenID(1, { from: _renter1 } );
        expect(new BN(tool1.tokenID)).to.be.bignumber.equal(new BN(1));
        expect(new BN(tool1.serialID)).to.be.bignumber.equal(new BN(12345));

        const tool2 = await anyRentalCollectionInstance.getToolsByTokenID(2, { from: _renter1 } );
        expect(new BN(tool2.tokenID)).to.be.bignumber.equal(new BN(2));
        expect(new BN(tool2.serialID)).to.be.bignumber.equal(new BN(6789));
        
    });

    it("... renter should burn a NFT", async () => {
        const tx = await anyRentalCollectionInstance.burn(1, _renter1, {from: _renter1})
        expectEvent(tx, 'NFTBurned', { owner: _renter1, tokenId: new BN(1) });
        
    });

    it("... renter should burn a NFT - check collection", async () => {
        const tx = await anyRentalCollectionInstance.burn(1, _renter1, {from: _renter1})
        
        const tools = await anyRentalCollectionInstance.getTools({ from: _renter1 } );
        expect(tools).to.not.be.empty;
        expect(tools.length).to.be.equal(3);

        const nbNFTs = await anyRentalCollectionInstance.balanceOf(_renter1, { from: _renter1 } );
        expect(new BN(nbNFTs)).to.be.bignumber.equal(new BN(1));

        const tool2 = await anyRentalCollectionInstance.getToolsByTokenID(2, { from: _renter1 } );
        expect(new BN(tool2.tokenID)).to.be.bignumber.equal(new BN(2));
        expect(new BN(tool2.serialID)).to.be.bignumber.equal(new BN(6789));

        //TODO GBE delet not ok ??!!
        /*await expectRevert(
            anyRentalCollectionInstance.getToolsByTokenID(1, { from: _renter1 } ),
            "Tool does not exist"
        );*/

    });


});

describe('AnyNFTCollection delegate NFT', () => {


    beforeEach(async function () {
         // new instance each time : new() not deploy().
         anyRentalCollectionInstance = await AnyNFTCollection.new("CollectionName", "CN", _renter1, { from: _owner });
         await anyRentalCollectionInstance.mint("https://www.example.com/tokenURI_1", 12345, "Mon outil 1", "Une description de mon outil 1", _renter1, { from: _renter1 });
         await anyRentalCollectionInstance.mint("https://www.example.com/tokenURI_2", 12345, "Mon outil 2", "Une description de mon outil 2", _renter1, { from: _renter1 });
    });

    it("... should have the right params after adding 2 NFTs", async () => {
        //await debug(collectionAddress);
       const nbNFTs = await anyRentalCollectionInstance.balanceOf(_renter1);
       expect(nbNFTs).to.be.bignumber.equal(new BN(2))

       const ownerOf = await anyRentalCollectionInstance.ownerOf(1);
       expect(ownerOf).to.be.bignumber.equal(_renter1)

       let delegatedAddress = await anyRentalCollectionInstance.userOf(1, {from: _renter1});
       expect(delegatedAddress).to.be.equal("0x0000000000000000000000000000000000000000");
    });

    it("... renter should delegate a NFT", async () => {
        const tokenID = 1;
        const expires = Math.floor(new Date().getTime()/1000) + 120;
        let tx = await anyRentalCollectionInstance.rentTool(tokenID,_renter2, expires, _renter1, { from: _renter1 } );
        expectEvent(tx, 'UpdateDelegation', { tokenId: new BN(tokenID), user: _renter2, expires: new BN(expires) });
        
    });

    it("... non renter can't delegate a NFT", async () => {
        const tokenID = 1;
        const expires = Math.floor(new Date().getTime()/1000) + 120;
        await expectRevert(
            anyRentalCollectionInstance.rentTool(tokenID,_renter2, expires, _renter1, { from: _renter2 }),
            "ERC4907: transfer caller is not owner nor approved"
        );
    });

    it("... renter should delegate a NFT - check delegation to user 0x -> renter2 -> 0x after period duration", async () => {
        const tokenID = 1;
        const expires = Math.floor(new Date().getTime()/1000) + 100;

        let delegatedAddress = await anyRentalCollectionInstance.userOf(tokenID, {from: _renter1});
        expect(delegatedAddress).to.be.equal("0x0000000000000000000000000000000000000000");


        let tx = await anyRentalCollectionInstance.rentTool(tokenID,_renter2, expires, _renter1, { from: _renter1 } );
        expectEvent(tx, 'UpdateDelegation', { tokenId: new BN(tokenID), user: _renter2, expires: new BN(expires) });

        

        delegatedAddress = await anyRentalCollectionInstance.userOf(tokenID, {from: _renter2});
        expect(delegatedAddress).to.be.equal(_renter2);
        
        //Expires the delegation duration
        /*await time.increase(50) ;

        delegatedAddress = await anyRentalCollectionInstance.userOf(tokenID, {from: _renter1});
        expect(delegatedAddress).to.be.equal("0x0000000000000000000000000000000000000000");*/
    });


});



});

