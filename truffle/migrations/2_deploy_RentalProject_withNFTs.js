require('dotenv').config();
const AnyRental = artifacts.require("AnyRental");
const AnyNFTCollectionFactory = artifacts.require("AnyNFTCollectionFactory");


const isDeployNFT = true;

module.exports = async function (deployer, _network, accounts) {
  let owner1;
  let owner2;
  /** 
   * Récupération de l'adresse de déploiement réalisée par le script 1
   */
  const artifact = require(`../../client/src/contracts/AnyRental.json`);
  const networkId = await web3.eth.net.getId();
  const contractAddress = artifact.networks[networkId].address;
  
  console.log("Network : ", _network)
  console.log("Network Id : ", networkId)
  console.log("AnyRental deploiment address : ", contractAddress)
 

  const anyRental = await AnyRental.at(contractAddress) 

  
  if(!isDeployNFT){
    console.log('\n-----------------------------------')
    console.log("  Pas de deploiement de NFTs activé...............")
    console.log('-----------------------------------')
  }
  else{
    console.log('\n-----------------------------------')
    console.log("  /!\\ Deploiement des NFTs activé !!")

  /** 
   * Récupération des parametres de connection
   */   
    const key = process.env.PINATA_KEY;
    const secret = process.env.PINATA_SECRET;
    const pinataSDK = require('@pinata/sdk');
    const pinata = new pinataSDK(key, secret);
    const fs = require('fs');


      /** 
     * Defini les parametres des NFTs a créer
     */   
    let CIDs = [];

    let collections = [
      {name:"Colletion Proprio 1", symbol:"CP1"},
      {name:"Colletion Proprio 2", symbol:"CP2"}
    ]
    let NFTs = [];

    if(_network === 'development') {
    
      console.log('     -----> Development network');
      NFTs = [
          {img: "NFT_Tronco_IMG",json:"NFT_Tronco_JSON", ipath:"1.png", jpath:"1.json", dayPrice:"1", caution:"2", serialID:"16565266695453", owner:"owner1"},
          {img: "NFT_Paddle_IMG",json:"NFT_Paddle_JSON", ipath:"2.png", jpath:"2.json",dayPrice:"3", caution:"4", serialID:"862419541651855", owner:"owner2"},
      ]

      owner1 = accounts[1];
      owner2 = accounts[2]
      
    }
    if(_network === "goerli" || _network ==="mumbai-fork"){
      console.log('     -----> Goerli or Mumbai network');
      NFTs = [
          {img: "NFT_Tronco_IMG",json:"NFT_Tronco_JSON", ipath:"1.png", jpath:"1.json", dayPrice:"0.0001", caution:"0.01"},
          {img: "NFT_Paddle_IMG",json:"NFT_Paddle_JSON", ipath:"2.png", jpath:"2.json",dayPrice:"0.0002", caution:"0.002"},
      ]
      owner1 = accounts[1]
      owner2 = accounts[1]
    }
    console.log("     => Ajout des NFTs suivants")
    console.table(NFTs)
    console.log("     => owner 1", owner1)
    console.log("     => owner 2", owner2)

    /** 
    * Deploiement des NFTs sur pinata et récupération des CIDs
    */
    async function processNFTs() {
      for(const nft of NFTs){
          try{
              // NFT a créer
              const nftFile1 = fs.createReadStream(`./migrations/deployment/collection/img/${nft.ipath}`);
              const nftJson1 = fs.readFileSync(`./migrations/deployment/collection/json/${nft.jpath}`);
  
              result = await pinata.pinFileToIPFS(nftFile1, generateOption(nft.img))
              
              const body  = JSON.parse(nftJson1);
              body.image = body.image.replace("CID_TO_REPLACE",result.IpfsHash);
              
              
              const json = await pinata.pinJSONToIPFS(body, generateOption(nft.json))
              console.log(json);
              console.log(json.IpfsHash);
              console.log(`ipfs://${json.IpfsHash}`)
              CIDs.push(`ipfs://${json.IpfsHash}`)
  
          }
          catch(error){
              console.error("Error upload NFT pinata ",error)
          }
      };

  }
  
    await processNFTs();       
       

    console.log("     => Les CIDs suivants ont été crées")
    console.table(CIDs)


    /** 
    * Creation collection et ajout NFTs
    */

    const nft1 = JSON.parse(fs.readFileSync(`./deployment/collection/json/1.json`));
    const nft2 = JSON.parse(fs.readFileSync(`./deployment/collection/json/2.json`));

    console.log("Creation des collections")
    await anyRental.createCollection(collections[0].name, collections[0].symbol, { from: owner1 })
    await anyRental.createCollection(collections[1].name, collections[1].symbol, { from: owner2 })

    console.log("Ajout des NFTs")
    // ajout NF 1
    let tx = await anyRental.addToolToCollection(CIDs[0], parseInt(nft1.attribute[0].value), nft1.attribute[1].value,nft1.attribute[2].value, {from:owner1});
    let tokenID = tx.logs[0].args.tokenId.words[0];
    console.log('token ID NFT : ', tokenID)
    await anyRental.addToolToRentals(parseInt(NFTs[0].dayPrice),parseInt(NFTs[0].caution), parseInt(tokenID), {from: owner1})
    
    // ajout NF 2
    tx = await anyRental.addToolToCollection(CIDs[1], parseInt(nft2.attribute[0].value), nft2.attribute[1].value,nft2.attribute[2].value, {from:owner2});
    tokenID = tx.logs[0].args.tokenId.words[0];
    console.log('token ID NFT : ', tokenID)
    await anyRental.addToolToRentals(parseInt(NFTs[1].dayPrice), parseInt(NFTs[1].caution), parseInt(tokenID), {from: owner2})

    console.log("..............Fin de la création des Colections et mint des NFTs")
  }
  



  //let tx = await instance.createCollection("First Collection", { from: ownerAddress });


  //console.log(tx) log 0 ou 1 ?
  //let collectionAddress = tx.logs[0].address;
  //console.log(tx)
  //console.log("NFT Collection deployed at address : ", collectionAddress);


};

function generateOption(name){
  const options = {
      pinataMetadata: {
          name: name,
      },
      pinataOptions: {
          cidVersion: 0
      }
  };
  return options;
}
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