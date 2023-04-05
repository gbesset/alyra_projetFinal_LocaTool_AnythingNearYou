
import React from 'react';
import { CollectionListItem } from './CollectionListItem';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { SimpleGrid} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const CollectionList= ({tools}) => {
  
  return (
    
        <Box>
          <Heading as="h3">Ajouter un element</Heading>
          <Button mt="4" colorScheme="purple" as={Link} to="/app/louer/add"> Ajouter un Objet </Button>

         <Heading as="h3" mt="2rem">Votre collection</Heading>
         <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(400px, 1fr))'>
         {tools.map((tool, index) => (
            <CollectionListItem  key={index} tool={tool} />
        ))}
         </SimpleGrid>
        </Box>
  );
}
