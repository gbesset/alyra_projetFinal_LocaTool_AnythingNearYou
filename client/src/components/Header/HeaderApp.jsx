import React from 'react';
import { Link } from 'react-router-dom';
import { Account } from '../Account/Account';
import { useEth } from '../../contexts/EthContext';
import { Flex, Text, Button, Box , Image} from '@chakra-ui/react';

export const HeaderApp = () => {
    const { state: { accounts, isOwner} } = useEth();

    return (
        <header>
        <Flex justifyContent="space-between" alignItems="center" height="10vh" width="100%" p="2rem">
         <Link href="/">
                  <Image  maxWidth="100px" height="auto" src="/assets/logo.png" alt="logo" />
            </Link>
          <Flex width="30%" justifyContent="space-between" alignItems="center">
              <Text className="text-white"><Link href="/">Accueil</Link></Text>
              <Text className="text-white"><Link href="/tools-list">Louer</Link></Text>
              <Text className="text-white"><Link href="/tools-list">Location</Link></Text>
              <Text className="text-white"><Link href="/account">DAO</Link></Text>
          </Flex>
          <Box className="navbar-end">
                    <div className="buttons">
                    <Button width="5rem">Go</Button>
                        <Account accounts={accounts}  isOwner={isOwner}/>
                    </div>
        </Box>

        </Flex>    
       </header>

        
    );
};
