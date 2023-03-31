// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

library Utils {

    struct Tool {
        uint tokenID;
        uint serialID;
        string title;
        string description;
        string tokenURI;
        bool isAvailable; //???
    }

    /**
     * @dev Check if two strings are equal
     * @param a First string to compare
     * @param b Second string to compare
     * @return True if both string are equal, false otherwise
     */
    function isEqualString(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
    
}