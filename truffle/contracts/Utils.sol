// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

library Utils {

    //TODO faire packaging variables
    struct Tool {
        uint serialID;
        string title;
        string description;
        bool isAvailable; //???
    }
    
    /**
     * @dev Check if two strings are equal
     * @param a First string to compare
     * @param b Second string to compare
     * @return True if both string are equal, false otherwise
     */
    function isEqualString(string memory a, string memory b) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
    
}