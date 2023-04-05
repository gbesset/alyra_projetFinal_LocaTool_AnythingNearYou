import React, { useEffect, useState } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,  Flex, Text, Button } from '@chakra-ui/react';
import { toastInfo, toastError } from '../../utils/utils';
import { CollectionList } from './collectionList';
import { CollectionItemForm } from './CollectionItemForm';


export const OwnerDashboard = () => {
    const { state: { contract, accounts, isOwner} } = useEth();

    const [collectionNFT, setCollectionNFT] = useState('')
/*
    const [test, setTest] = useState([
        {
          tokenID: 1,
          serialID: 1001,
          title: "Hammer",
          description: "A tool used for pounding nails",
          tokenURI: "https://example.com/images/hammer.jpg",
          isAvailable: true,
        },
        {
          tokenID: 2,
          serialID: 1002,
          title: "Screwdriver",
          description: "A tool used for turning screws",
          tokenURI: "https://example.com/images/screwdriver.jpg",
          isAvailable: false,
        },
        {
          tokenID: 3,
          serialID: 1003,
          title: "Wrench",
          description: "A tool used for tightening bolts and nuts",
          tokenURI: "https://example.com/images/wrench.jpg",
          isAvailable: true,
        },    {
            tokenID: 2,
            serialID: 1002,
            title: "Screwdriver",
            description: "A tool used for turning screws",
            tokenURI: "https://example.com/images/screwdriver.jpg",
            isAvailable: false,
          },
          {
            tokenID: 3,
            serialID: 1003,
            title: "Wrench",
            description: "A tool used for tightening bolts and nuts",
            tokenURI: "https://example.com/images/wrench.jpg",
            isAvailable: true,
          },    {
            tokenID: 2,
            serialID: 1002,
            title: "Screwdriver",
            description: "A tool used for turning screws",
            tokenURI: "https://example.com/images/screwdriver.jpg",
            isAvailable: false,
          },
          {
            tokenID: 3,
            serialID: 1003,
            title: "Wrench",
            description: "A tool used for tightening bolts and nuts",
            tokenURI: "https://example.com/images/wrench.jpg",
            isAvailable: true,
          },
      ]);
*/
    const retrieveCollectionData = async () => {
        try{
            let colNFTs = await contract.methods.getToolsCollection(accounts[0]).call({ from: accounts[0] });
            colNFTs = colNFTs.filter((tool)=>tool.isAvailable);
            setCollectionNFT(colNFTs);
            //let collectionAddress = await contract.methods.getToolsCollectionAddress(accounts[0]).call({ from: accounts[0] });
            
        }
        catch(error){
            console.log(error)
            toastError("Erreur pour récupérer la collection NFT")
        }
    }
    useEffect( () =>{    
        async function getCollectionNFT() {
            if (contract && contract?.methods) {
                retrieveCollectionData();
            }
        }
      
        async function retrieveProposalRegisteredEvent(){
            if(contract){
              contract.events.NFTToolAddedToCollection({fromBlock:"earliest"})
              .on('data', event => {
                console.log("ajouter un NFT a la col")
               
                })          
            }
        }

        getCollectionNFT();
    }, [accounts, contract]);

    return (
        <>
        <Box >
            <Heading as="h3">Votre collection</Heading>
            
            { collectionNFT.length == 0 ?  (
                <Text>vous n'avez pas encore d'outils à dispo.</Text>
                
            
            ) : <CollectionList tools={collectionNFT} />}
            
            <CollectionItemForm />
        </Box>
        </>
    );
};
