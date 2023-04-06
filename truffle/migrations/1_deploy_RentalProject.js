const AnyRental = artifacts.require("AnyRental");
const AnyNFTCollectionFactory = artifacts.require("AnyNFTCollectionFactory");

module.exports = async function (deployer, _network, accounts) {
  let ownerAddress = accounts[0];


  console.log('Owner of the Rental contract : ', ownerAddress);

  //Deploy Factory contract
  await deployer.deploy(AnyNFTCollectionFactory);  
  const instanceFactory = await AnyNFTCollectionFactory.deployed();
  console.log('Factory deployed at address  : ', instanceFactory.address);

    //Deploy Rental contract
  await deployer.deploy(AnyRental, instanceFactory.address);  
  const instanceRental = await AnyRental.deployed();
  console.log('Rental deployed at address   : ', instanceRental.address);

  //Transfer ownership to the AnyRental Contract
  await instanceFactory.transferOwnership(instanceRental.address);

};
