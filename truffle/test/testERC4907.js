const ERC4907 = artifacts.require("./ERC4907.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { assert } = require("chai");


contract("ERC4907", async accounts => {

    let ERC4907Instance;
    const owner = accounts[0];
    const Alice = accounts[1];
    const Bob = accounts[2];


    describe("Can create a contract based on ERC4907", function () {
        
    });


    describe.skip("Owner delegate to a user", function () {
       
        beforeEach(async function () {
            ERC4907Instance = await ERC4907.new("ANY_NFT","ANY",{ from: owner });
        });
        

        it.skip("should set user to Bob", async () => {
    
            await ERC4907Instance.mint(1, Alice);
            let expires = Math.floor(new Date().getTime()/1000) + 1000;
            await ERC4907Instance.setUser(1, Bob, BigInt(expires));
    
            let user_1 = await ERC4907Instance.userOf(1);
    
            assert.equal(user_1, Bob, "User of NFT 1 should be Bob" );
    
            let owner_1 = await ERC4907Instance.ownerOf(1);
            assert.equal(owner_1, Alice , "Owner of NFT 1 should be Alice" );
        });
    });
});

    /*
        it("should set user to Bob", async () => {
        //@dev - Get initial balances of first and second account.

        const Alice: string = alice.address
        const Bob: string = bob.address
        console.log(`Alice: ${ Alice }`)
        console.log(`Bob: ${ Bob }`)

        const demo: ERC4907Demo = instance

        //@dev - Mint a ERC4907-based NFT
        let tx1: ContractTransaction = await demo.connect(owner).mint(1, Alice)
        
        //@dev - Calculate expiration period
        let expires = Math.floor(new Date().getTime()/1000) + 1000

        //@dev - Set user in the ERC4907-based NFT
        let tx2: ContractTransaction = await demo.connect(alice).setApprovalForAll(Bob, true)
        let tx3: ContractTransaction = await demo.connect(alice).setUser(1, Bob, BigInt(expires))

        //@dev - Get a user who is set in the ERC4907-based NFT
        let user_1 = await demo.userOf(1)
        console.log(`User of NFT 1: ${ user_1 }`)
        assert.equal(
            user_1,
            Bob,
            "User of NFT 1 should be Bob"
        )

        //@dev - Get a owner who is set in the ERC4907-based NFT
        let owner_1 = await demo.ownerOf(1)
        console.log(`Owner of NFT 1: ${ owner_1 }`)
        assert.equal(
            owner_1,
            Alice ,
            "Owner of NFT 1 should be Alice"
        )
    })
    */