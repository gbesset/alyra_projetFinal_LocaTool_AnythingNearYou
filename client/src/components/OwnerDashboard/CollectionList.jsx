
import React from 'react';
import { CollectionListItem } from './CollectionListItem';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { SimpleGrid} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const CollectionList= ({rentals}) => {
  
  return (
    
        <Box>
          <Heading as="h3">Ajouter un element</Heading>
          <Button mt="4" colorScheme="purple" as={Link} to="/app/louer/add"> Ajouter un Objet </Button>

         <Heading as="h3" mt="2rem">Votre collection</Heading>
         <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(300px, 1fr))'>
         {rentals.map((rental, index) => (
            <CollectionListItem  key={index} rental={rental} />
        ))}
         </SimpleGrid>
        </Box>
  );
}
