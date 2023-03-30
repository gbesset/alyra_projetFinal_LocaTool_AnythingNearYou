// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;


import "./Utils.sol";


interface IAnyNFTCollection {

    function getTools() external view returns (Utils.Tool[] memory);
    function getToolsByTokenID(uint _tokenId) external view returns (Utils.Tool memory);
    function mint(string calldata _tokenURI, uint _serialId, string memory _title, string memory _description, address _from) external  returns (uint256) ;
    function rentTool(uint _toolId, address _to) external ;


}


   
 