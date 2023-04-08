
import React , {useState, useEffect} from 'react';
import { CollectionListItem } from './CollectionListItem';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { SimpleGrid} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useEth } from '../../contexts/EthContext';

export const CollectionList= ({rentals}) => {
  const { state: { contract, accounts, web3, isOwner, artifactCollection} } = useEth();
    const [name, setName] = useState("")
    const [symbol, setSymbol] = useState("")

    
    const checkCollectionInfo = async () => {
      try{
          //si on est la, forcement 1 rental
           const contractCollection = new web3.eth.Contract(artifactCollection.abi, rentals[0].collection.collection);            
  
           if (web3.utils.isAddress(accounts[0]) && contract && contractCollection) {
  
               const name = await contractCollection.methods.name().call({from:accounts[0]});
               setName(name);
  
               const symbol = await contractCollection.methods.symbol().call({from:accounts[0]});
               setSymbol(symbol)
  
           }
       }catch(error){
           console.log(error)
       }
   }
   
   useEffect( () =>{    
       checkCollectionInfo();
    }, []);

  return (
    
        <Box>
          <Heading as="h3">Ajouter un element</Heading>
          <Button mt="4" colorScheme="purple" as={Link} to="/app/louer/add"> Ajouter un Objet </Button>

         <Heading as="h3" mt="2rem">Votre collection : {name} ({symbol})</Heading>
         <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(300px, 1fr))'>
         {rentals.map((rental, index) => (
            <CollectionListItem  key={index} rental={rental} />
        ))}
         </SimpleGrid>
        </Box>
  );
}
