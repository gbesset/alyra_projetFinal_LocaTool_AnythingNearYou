// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;


import "./Utils.sol";


interface IAnyNFTCollection {

    function mint(string calldata _tokenURI, uint _serialId, string memory _title, string memory _description, address _from) external  returns (uint256) ;
    function burn(uint _tokenID, address _from) external ;
   
    function rentTool(uint _tokenId, address _to, uint64 _expires, address _from)  external;

    function getTools() external view returns (Utils.Tool[] memory);
    function getToolsByTokenID(uint _tokenId) external view returns (Utils.Tool memory);
    function getNbTools() external view returns (uint);
}


   
 