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

