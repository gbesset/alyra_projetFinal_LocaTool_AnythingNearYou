
import React from 'react';
import { CollectionListItem } from './CollectionListItem';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { SimpleGrid, GridItem,Image } from '@chakra-ui/react';

export const CollectionList= ({tools}) => {
  
  return (
    
        <Box>
         <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(400px, 1fr))'>
         {tools.map((tool, index) => (
            <CollectionListItem  key={index} tool={tool} />
        ))}
         </SimpleGrid>
        </Box>
  );
}
