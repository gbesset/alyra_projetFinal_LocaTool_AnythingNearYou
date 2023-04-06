const axios = require('axios')

export const checkAuthent = async (file) => {
    const JWT = `Bearer ${process.env.PINATA_JWT}`
    
    let config = {
        method: 'get',
        url: 'https://api.pinata.cloud/data/testAuthentication',
        headers: { 
          'Authorization': `Bearer ${process.env.PINATA_JWT}`
        }
      };

      const res = await axios(config);
      return res;
}

export const pinFileToPinata = async (file) => {
    if(file){
        //const pinata = new pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);
        const JWT = `Bearer ${process.env.PINATA_JWT}`

        const formData = new FormData();
        formData.append('file', file)

          
        //const options = generateOptions(file.name)
        //formData.append('pinataOptions', options);

        try{
            const res = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    'Authorization': `Bearer ${process.env.PINATA_JWT}`,
                    'Content-Type': `multipart/form-data;`,
                },
            });

            console.log(res.data.IpfsHash);
            return res.data.IpfsHash;

          } catch (error) {
                console.log("Erreur connection pinata")
                console.log(error);
          }
          return null;
    }   
};

export const pinJsonToPinata = async (nftName, fileCID, description, attributeSerialID, attributeTitle, attributDescription) => {

    //const pinata = new pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);
    const JWT = `Bearer ${process.env.PINATA_JWT}`
       
    const nftMetadata = {
        name: `NFT_${nftName}`,
        description: description,
        image: `${process.env.PINATA_URL}/${fileCID}`,
        attributes: [
            {
                trait_type: "serialID",
                value: attributeSerialID
            },
            {
                trait_type:"title",
                value: attributeTitle
            },
            { 
                trait_type:"description",
                value: attributDescription
            }
        ]
    };
        
        //const options = generateOptions(file.name)
        //formData.append('pinataOptions', options);
        try{

            const res = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
                headers: {
                    'Authorization': `Bearer ${process.env.PINATA_JWT}`,
                },
                data:{
                    pinataMetadata: {
                        name: nftName
                    },
                    pinataContent: nftMetadata
                },
            });

            console.log(res.data.IpfsHash);
            return res.data.IpfsHash;

          } catch (error) {
                console.log("Erreur upload pinata")
                console.log(error);
          }
          return null;
     
};

function generateOptions(name){
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