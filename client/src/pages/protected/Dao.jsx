import React, { useEffect, useState } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box } from '@chakra-ui/react';
import { Authent } from '../../components/Authent/Authent';

export const Dao = () => {
    const { state: { contract, accounts, artifact} } = useEth();

    useEffect( () =>{    
        
    }, [accounts, contract, artifact]);

    return (
        <Box>
            <Heading as="h1">DAO</Heading>
            {Math.random()}
            {accounts ? accounts[0]:"not connected"}
            {accounts ? (
                <>
                   DAO
                   
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
