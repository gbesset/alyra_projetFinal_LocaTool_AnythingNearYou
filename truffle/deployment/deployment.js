require('dotenv').config();
const key = process.env.PINATA_KEY;
const secret = process.env.PINATA_SECRET;
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(key, secret);
const fs = require('fs');

// NFT a créer
const nftFile1 = fs.createReadStream('./deployment/collection/img/1.jpg');
const nftJson1 = fs.readFileSync('./deployment/collection/json/1.json');


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

pinata.pinFileToIPFS(nftFile1, generateOption("NFT_Tronco_JPG")).then((result) => {
    const body  = JSON.parse(nftJson1);
    
    body.image = body.image.replace("CID_TO_REPLACE",result.IpfsHash);


    pinata.pinJSONToIPFS(body, generateOption("NFT_Tronco_JSON")).then((json) => {
        console.log(json);
        console.log(json.IpfsHash);
        console.log("ipfs://"+json.IpfsHash)
    }).catch((err) => {
        console.log(err);
    });

}).catch((err) => {
    console.log(err);
}); 


