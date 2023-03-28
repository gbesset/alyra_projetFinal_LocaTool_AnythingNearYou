import { Flex, Text, Button } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';

export const HeaderHome = () => {

    return (
      <header>
          <Flex justifyContent="space-between" alignItems="center" height="10vh" width="100%" p="2rem">
            <Text fontWeight="bold" className="text-white">Logo</Text>
            <Flex width="30%" justifyContent="space-between" alignItems="center">
                <Text className="text-white"><Link href="/">Accueil</Link></Text>
                <Text className="text-white"><Link href="/tools-list">Les outils</Link></Text>
                <Text className="text-white"><Link href="/account">DAO</Link></Text>
            </Flex>
            <Button width="5rem">Go</Button>
          </Flex>    
         </header>
  
    );
};
