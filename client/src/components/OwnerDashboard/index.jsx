import React, { useEffect, useState } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,  Flex, Text, Button } from '@chakra-ui/react';
import { toastInfo, toastError } from '../../utils/utils';
import { CollectionList } from './CollectionList';
import { CollectionItemForm } from './CollectionItemForm';
import { Link } from "react-router-dom";

export const OwnerDashboard = () => {
    const { state: { contract, accounts, isOwner} } = useEth();

    const [collectionNFT, setCollectionNFT] = useState('')

    const retrieveCollectionData = async () => {
        try{
            let rentals = await contract.methods.getRentalsByOwner(accounts[0]).call({ from: accounts[0] });
            let nfts = await contract.methods.getToolsCollection(accounts[0]).call({ from: accounts[0] });
            
            nfts = nfts.filter((tool)=>tool.isAvailable);
            
            let rentalComplete = nfts.map( tool =>{
                let rental = rentals.find(rental => rental.tokenID === tool.tokenID);
                return {...tool, ...rental};
            })

            setCollectionNFT(rentalComplete);

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
            
            { collectionNFT.length == 0 ?  (
              <Box>
                <Heading as="h3">Votre collection</Heading>
                <Text>vous n'avez pas encore d'outils à dispo.</Text>

                <Button mt="4" colorScheme="purple" as={Link} to="/app/louer/add"> Ajouter un Objet </Button>
              </Box>
            ) : 
            <CollectionList tools={collectionNFT} />}
            
        </Box>
        </>
    );
};
