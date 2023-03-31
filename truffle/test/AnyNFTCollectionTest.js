const AnyNFTCollection = artifacts.require('./AnyNFTCollection.sol');

const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
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


});

