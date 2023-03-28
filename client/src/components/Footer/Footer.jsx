import React from 'react';
import {Flex, Text, Box} from '@chakra-ui/react'
import {Link} from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="text-white">
        <Flex direction="column" justifyContent="center" alignItems="center" height="10vh" width="100%" p="2rem" >
 
            <Flex width="40%" justifyContent="space-between" alignItems="center">
                <Text><Link href="/lien">CGV</Link></Text>
                <Text><Link href="/lien">WhitePaper</Link></Text>
                <Text><Link href="/lien">?</Link></Text>
            
          </Flex>    
          <Box pt="1rem">
            <Text fontWeight="bold" className="text-white">&copy; Alyra - Promo Satoshi - 2023</Text>
          </Box>
          
        </Flex>
      </footer>
    );
};
