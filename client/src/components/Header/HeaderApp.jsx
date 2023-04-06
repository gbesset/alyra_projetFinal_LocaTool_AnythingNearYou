import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Account } from '../Account/Account';
import { useEth } from '../../contexts/EthContext';
import { Flex, Text, Button, Box , Image} from '@chakra-ui/react';

export const HeaderApp = () => {
    const { state: { accounts, isOwner} } = useEth();

    useEffect( () =>{    

    }, [isOwner]);
    
    return (
        <header>
        <Flex justifyContent="space-between" alignItems="center" height="10vh" width="100%" p="2rem">
         <Link to="/">
                  <Image  maxWidth="100px" height="auto" src="/assets/logo.png" alt="logo" />
            </Link>
          <Flex width="30%" justifyContent="space-between" alignItems="center">
                {/*<Text className="text-white"><Link to="/">Accueil</Link></Text>*/}
                <Text className="text-white"><Link to="/app/louer">Loueur</Link></Text>
                <Text className="text-white"><Link to="/app/location">Locataire</Link></Text>
                <Text className="text-white"><Link to="/app/dao">DAO</Link></Text>
          </Flex>
          <Box className="navbar-end">
                <Account accounts={accounts}  isOwner={isOwner}/> 
          </Box>

        </Flex>    
       </header>

        
    );
};
