const Utils = artifacts.require("./Utils.sol");
const { BN, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract("Utils", async accounts => {

    const owner = accounts[0];

    let utilsInstance;

    beforeEach(async () => {
        utilsInstance = await Utils.new({ from: owner });
    });


    /**
     * TODO gbe
     * Pas réussi a tester une fonction internal d'une Library...........
     */
   
    describe.skip("Utils - check is equal string ok", function () {

        it("should chain A is equal chain B", async () => {
            const a = "hello";
            const b = "hello";
            const result = await utilsInstance.isEqualString(a, b);
            expect(result).to.be.true;
        });

        it("should chain A is not equal chain B", async () => {
            const a = "hello";
            const b = "world";
            const result = await Utils.isEqualString(a, b);
            expect(result).to.be.false;
        });
    });

});
