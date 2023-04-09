const ERC4907 = artifacts.require("./ERC4907Demo.sol");
const { BN, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract("ERC4907Demo", async accounts => {

    const owner = accounts[0];
    const Alice = accounts[1];
    const Bob = accounts[2];
    
    let ERC4907Instance;

    describe("Can create a contract based on ERC4907", function () {
        
    });


    describe("Owner delegate to a user", function () {
       
        beforeEach(async function () {
            ERC4907Instance = await ERC4907.new("ANY_NFT","ANY",{ from: owner });
        });
        

        it("should set user to Bob", async () => {
    
            await ERC4907Instance.mint(1, Alice, {from: Alice});
            let expires = Math.floor(new Date().getTime()/1000) + 1000;
            await ERC4907Instance.setUser(1, Bob, BigInt(expires), {from: Alice});
    
            let user_1 = await ERC4907Instance.userOf(1, {from: Alice});
    
            expect(user_1).to.be.equal(Bob);
    
            let owner_1 = await ERC4907Instance.ownerOf(1, {from: Alice});
            expect(owner_1).to.be.equal(Alice);
        });

        it("should set user to Bob and have a userExpiration OK", async () => {
    
            await ERC4907Instance.mint(1, Alice, {from:Alice});
            let expires = Math.floor(new Date().getTime()/1000) + 1000;
            await ERC4907Instance.setUser(1, Bob, BigInt(expires), {from:Alice});
    
            let user_1 = await ERC4907Instance.userOf(1, {from:Alice});

            let expiresReturned = await ERC4907Instance.userExpires(1, {from: Alice});
            expect(new BN(expires)).to.be.bignumber.equal(new BN(expiresReturned));

        });
    });
});