import React, { useEffect, useState } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box } from '@chakra-ui/react';
import { Authent } from '../../components/Authent/Authent';

export const Location = () => {
    const { state: { contract, accounts, artifact} } = useEth();

    useEffect( () =>{    
        
    }, [accounts, contract, artifact]);

    return (
        <Box>
            <Heading as="h1">Mes locations</Heading>

            {accounts ? (
                <>
                    alors Locations
                   
                  </>
                ) : (
                    <>
                    <Authent />
                    </>
                )
                }
        </Box>
    );
};
