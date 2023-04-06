require('dotenv').config();
const key = process.env.PINATA_KEY;
const secret = process.env.PINATA_SECRET;
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(key, secret);
const fs = require('fs');



const NFTs = [
    {img: "NFT_Tronco_JPG",json:"NFT_Tronco_JSON", ipath:"1.jpg", jpath:"1.json"},
    {img: "NFT_Paddle_JPG",json:"NFT_Paddle_JSON", ipath:"2.png", jpath:"2.json"},
]

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

async function processNFTs() {
    for(const nft of NFTs){
        try{
            // NFT a créer
            const nftFile1 = fs.createReadStream(`./deployment/collection/img/${nft.ipath}`);
            const nftJson1 = fs.readFileSync(`./deployment/collection/json/${nft.jpath}`);

            result = await pinata.pinFileToIPFS(nftFile1, generateOption(nft.img))
            
            const body  = JSON.parse(nftJson1);
            body.image = body.image.replace("CID_TO_REPLACE",result.IpfsHash);
            
            
            const json = await pinata.pinJSONToIPFS(body, generateOption(nft.json))
            console.log(json);
            console.log(json.IpfsHash);
            console.log("ipfs://"+json.IpfsHash)

        }
        catch(error){
            console.error("Error upload NFT pinata ",error)
        }
    
    };
    console.log("=============================")
}

processNFTs();