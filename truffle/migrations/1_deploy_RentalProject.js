const AnyRental = artifacts.require("AnyRental");
const AnyNFTCollectionFactory = artifacts.require("AnyNFTCollectionFactory");

module.exports = async function (deployer, _network, accounts) {
  let ownerAddress = accounts[0];

  if(_network === 'development') {
    
    console.log('-----> Development network');
    
  }
  if(_network === "goerli" || _network ==="mumbai"){
    console.log('-----> Goerli or Mumbai network');
    console.log("TODO");
  }


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



  //let tx = await instance.createCollection("First Collection", { from: ownerAddress });


  //console.log(tx) log 0 ou 1 ?
  //let collectionAddress = tx.logs[0].address;
  //console.log(tx)
  //console.log("NFT Collection deployed at address : ", collectionAddress);


};

/*

const DAI_GOERLI_ADDRESS="0xdc31ee1784292379fbb2964b3b9c4124d8f89c60";

module.exports =  async (deployer, _network, accounts) => {

  await deployer.deploy(DeFiProject, DAI_GOERLI_ADDRESS);
  */


/*
ce que je veux faire a terme
await deployer.deploy(Dai);
  const dai = await Dai.deployed();


  await deployer.deploy(DeFiProject, dai.address);
  const deFiProject = await DeFiProject.deployed();


  //mint et envoie au contrat defiProjec des tokens (100)
  await dai.faucet(deFiProject.address, 100);
  const balanceProjectInitiale = await dai.balanceOf(deFiProject.address);

  //transfert token depuis smart contract vers 1 personne
  await deFiProject.transferDai(accounts[1], 99)


  //Verif
  const balanceProject = await dai.balanceOf(deFiProject.address);
  const balanceAccount1 = await dai.balanceOf(accounts[1]);

  console.log("Balance initiale project: " + balanceProjectInitiale.toString());
console.log("Balance project: " + balanceProject.toString());
console.log("Balance account: " + balanceAccount1.toString());
*/