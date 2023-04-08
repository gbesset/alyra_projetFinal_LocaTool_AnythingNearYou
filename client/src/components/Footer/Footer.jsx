import React from 'react';
import {Flex, Text, Box} from '@chakra-ui/react'
import {Link} from 'react-router-dom';
import { Divider} from '@chakra-ui/react';

export const Footer = () => {
    return (<>
        <Divider mt="2rem" />
          <Box as ="footer" className="text-white"  >
          <Flex direction="column" justifyContent="center" alignItems="center" height="10vh" width="100%" p="2rem" >
  
              <Flex width="40%" justifyContent="space-between" alignItems="center">
                  <Text><Link to="/">Accueil</Link></Text>
                  <Text><Link to="/cgu">CGU</Link></Text>
                  <Text><Link to="/whitepaper">WhitePaper</Link></Text>
              
            </Flex>    
            <Box pt="1rem">
              <Text fontWeight="bold" className="text-white">&copy; Alyra - Promo Satoshi - 2023</Text>
            </Box>
            
          </Flex>
        </Box>
      </>
    );
};
