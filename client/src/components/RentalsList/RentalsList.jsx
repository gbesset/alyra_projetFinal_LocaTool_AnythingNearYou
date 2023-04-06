import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { SimpleGrid} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { RentalItem } from './RentalItem';

export const RentalList= ({rentals}) => {
  
  return (
    
        <Box>
         <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(300px, 1fr))'>

         {rentals && rentals.map((rental, index) => (
            <RentalItem rental={rental} />
        ))}
         </SimpleGrid>
        </Box>
  );
}
