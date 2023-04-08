import React, { useEffect } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box, Flex, Image, Text } from '@chakra-ui/react';


export const Dao = () => {
    const { state: { contract, accounts, artifact} } = useEth();

    useEffect( () =>{    
        
    }, [accounts, contract, artifact]);

    return (
        <>
        <Flex className="hero" justifyContent="center">
        <Box>
            <Heading className="text-gradient" p="2rem">DAO</Heading>
            <Flex>
                 <Box flex="1" >
                    <Flex h="100%" alignItems="center" justifyContent="center" >
                      <Image src="/assets/voting.jpg" alt="Voting" />
                    </Flex>
                </Box>

                <Box flex="1" h="100%">
                    <Text className="text-white" pl="3rem" pt="1rem">
                        Vous souhaitez participer au projet et faire vivre la communeauté, peut etre en resolvant les litiges ?<br/>
                    </Text>
                    <Text className="text-white" pl="3rem" pt="1rem">
                        Vous souhaitez décider des choix qui vont être fait au sein du projet et choisir les directions qu'il prendra ?<br/>
                    </Text>
                    <Text className="text-white" pl="3rem" pt="1rem">
                        Rejoignez nous, stackez des token ANY et accédez aux directions stratégiques
                    </Text>
                </Box>
            </Flex>
        </Box>
        </Flex>
        <Box flex="1" h="100%">
            <Text className="text-white" pl="3rem" pt="1rem">
                DAO en construction.............
            </Text>
        </Box>
        </>

        );

};
