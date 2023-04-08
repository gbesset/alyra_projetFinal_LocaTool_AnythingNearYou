require('dotenv').config();
const AnyRental = artifacts.require("AnyRental");
const AnyNFTCollectionFactory = artifacts.require("AnyNFTCollectionFactory");


const isDeployNFT = true;

module.exports = async function (deployer, _network, accounts) {
  let owner1;
  let owner2;
  let owner3;
  let owner4;
  /** 
   * Récupération de l'adresse de déploiement réalisée par le script 1
   */
  const artifact = require(`../../client/src/contracts/AnyRental.json`);
  const networkId = await web3.eth.net.getId();
  const contractAddress = artifact.networks[networkId].address;
  
  console.log("Network : ", _network)
  console.log("Network Id : ", networkId)
  console.log("AnyRental deploiment address : ", contractAddress)
 

  //Instanciation du contrat
  const anyRental = await AnyRental.at(contractAddress) 

  
  if(!isDeployNFT){
    console.log('\n-----------------------------------')
    console.log("  Pas de deploiement de NFTs activé...............")
    console.log('-----------------------------------')
  }
  else if(_network ==="mumbai-fork"){
    console.log('\n-----------------------------------')
    console.log("  Pas de deploiement (mumbai-fork)...............")
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
    // definies en fonction du network
    let collections = []
    let NFTs = [];

    if(_network === 'development') {
        console.log('     -----> Development network');
        
        owner1 = accounts[1];
        owner2 = accounts[1]
        owner3 = accounts[1]
        owner4 = accounts[3]
        
        //Seulement 2 collections
        collections = [
          {name:"Collection Proprio 1", symbol:"CP1", owner:owner1},
          {name:"Collection Proprio 2", symbol:"CP2", owner:owner4 }
        ]

        NFTs = [
            {img: "NFT_Paddle_IMG",json:"NFT_Paddle_JSON", ipath:"1.png", jpath:"1.json",dayPrice:"3", caution:"4", serialID:"862419541651855", owner:owner1},
            {img: "NFT_PistoletPeinture_IMG",json:"NFT_PistoletPeinture_JSON", ipath:"2.png", jpath:"2.json",dayPrice:"5", caution:"9", serialID:"96654486655", owner:owner2},
            {img: "NFT_Betoniere_IMG",json:"NFT_Betoniere_JSON", ipath:"3.png", jpath:"3.json",dayPrice:"6", caution:"9", serialID:"000000000000", owner:owner3},
            {img: "NFT_Tronco_IMG",json:"NFT_Tronco_JSON", ipath:"4.png", jpath:"4.json", dayPrice:"1", caution:"2", serialID:"16565266695453", owner:owner4},
        ]
      
    }
    if(_network === "goerli" || _network ==="mumbai-fork" || _network ==="mumbai"){
          console.log('     -----> Goerli or Mumbai network');

          owner1 = accounts[1]
          owner2 = "0x3F1E285ee6BEc3E7df60854E9db428bB934646d2"  //addresse Vincent
          //owner3 = accounts[1]  //addresse Thomas
          owner3 = "0xDF3E3f8fc4Aa92e41c61Abb1e9CFe68880Fd53BC"
          owner4 = "0xd85ae51d3E3E49da2702f98E1BDBE842Bd4d9817"  //addresse Sylvie
          
          //4 collections
          collections = [
            {name:"Collection Guillaume", symbol:"ANY_1", owner: owner1},
           // {name:"Collection Vincent", symbol:"ANY_2", owner: owner2},
           // {name:"Collection Thomas", symbol:"ANY_3", owner: owner3 },
           // {name:"Collection Sylvie", symbol:"ANY_4", owner: owner4 },
          ]
          //Seulement le prix et la caution sont différent..
          NFTs = [
            {img: "NFT_Paddle_IMG",json:"NFT_Paddle_JSON", ipath:"1.png", jpath:"1.json",dayPrice:"50", caution:"150", serialID:"862419541651855", owner:owner1},
 //           {img: "NFT_PistoletPeinture_IMG",json:"NFT_PistoletPeinture_JSON", ipath:"2.png", jpath:"2.json",dayPrice:"40", caution:"120", serialID:"96654486655", owner:owner1},
 //           {img: "NFT_Betoniere_IMG",json:"NFT_Betoniere_JSON", ipath:"3.png", jpath:"3.json",dayPrice:"100", caution:"300", serialID:"000000000000", owner:owner1},
 //           {img: "NFT_Tronco_IMG",json:"NFT_Tronco_JSON", ipath:"4.png", jpath:"4.json", dayPrice:"55", caution:"200", serialID:"16565266695453", owner:owner1},
          ]

      }
    console.log("\n     => il  faudra ajouter les NFTs suivants")
    console.table(collections)
    console.table(NFTs)
    console.log("     => owner 1", owner1)
    console.log("     => owner 2", owner2)
    console.log("     => owner 3", owner3)
    console.log("     => owner 4", owner4)

    /** 
    * Deploiement des NFTs sur pinata et récupération des CIDs
    */
    // Rempli a l'issu de l'envo sur Pinana
    let imgCIDs = [];
    let jsonCIDs = [];
    async function processNFTs() {

      for(const nft of NFTs){
          try{
              // NFT a créer
              const nftImg = fs.createReadStream(`./migrations/deployment/collection/img/${nft.ipath}`);
              const nftJson = fs.readFileSync(`./migrations/deployment/collection/json/${nft.jpath}`);
  
              result = await pinata.pinFileToIPFS(nftImg, generateOption(nft.img))
              
              const body  = JSON.parse(nftJson);
              body.image = body.image.replace("CID_TO_REPLACE",result.IpfsHash);
              imgCIDs.push(`https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`)
              
              const json = await pinata.pinJSONToIPFS(body, generateOption(nft.json))
              //console.log(json);
              //console.log(json.IpfsHash);
              //console.log(`ipfs://${json.IpfsHash}`)
              jsonCIDs.push(`ipfs://${json.IpfsHash}`)
  
          }
          catch(error){
              console.error("Error upload NFT pinata ",error)
          }
      };
  }
  
    console.log("\n     [x] Upload des fichiers sur pinata")
    await processNFTs();       
       

    console.log("     => Les CIDs suivants ont été crées")
    console.table(imgCIDs)
    console.table(jsonCIDs)


    /** 
    * Creation collection et ajout NFTs
    */
   console.log("\n     => Creation des Collections dans le smart contract")

    async function collectionCreation() {

      for(const collectionToCreate of collections){
        try{
            await anyRental.createCollection(collectionToCreate.name, collectionToCreate.symbol, { from: collectionToCreate.owner })
            console.log(`                - Creation de la collection ${collectionToCreate.name}`)
        }
        catch(error){
            console.error("Error Creation des collections ",error)
        }
      }
    }

    await collectionCreation();
    console.log("\n     [x] Creation des Collections dans le smart contract")


    console.log("\n     => Mint des NFTs dans le smart contract")
    async function mintNFTs() {
      let index =0;

      for(const nft of NFTs){
        try{
          const nftJson = JSON.parse(fs.readFileSync(`./migrations/deployment/collection/json/${nft.jpath}`));

          let tx = await anyRental.addToolToCollection(jsonCIDs[index], parseInt(nft.serialID), nftJson.attribute[1].value,nftJson.attribute[2].value, {from:nft.owner});
          let tokenID = tx.logs[0].args.tokenId.words[0];
          console.log('token ID NFT : ', tokenID)

          await anyRental.addToolToRentals(imgCIDs[index],parseInt(nft.dayPrice),parseInt(nft.caution), parseInt(tokenID), {from: nft.owner})
  
        }
        catch(error){
            console.error("Error mint des NFTs ",error)
        }
        index++;
      }
    }

    await mintNFTs();
    console.log("\n     [x] Mint des NFTs dans le smart contract")

    console.log("\n\n..............Fin de la création des Colections et mint des NFTs")
  }
  

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