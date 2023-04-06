//import pinataSDK from '@pinata/sdk';


export const pinFileToPinata = async (file, key, secret) => {
    alert(process.env.PINATA_KEY)
  //  const pinata = new pinataSDK(env.PINATA_KEY, env.PINATA_SECRET);

    const options = generateOptions(file.name)

   // const result = await pinata.pinFileToIPFS(file, options);
   // return result.IpfsHash;
   setTimeout(()=>{},2000)
   return 1;;
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