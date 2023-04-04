import React from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,  Flex, Text, Button } from '@chakra-ui/react';

export const OwnerDashboard = () => {
    const { state: { contract, accounts} } = useEth();

    return (
        <>
        <Box className="debug">
            <Heading as="h3">Votre collection</Heading>
            <Text>Ma collection</Text>
            
            <Text mt="4">
            Ajoutez-y des objets à louer.
            </Text>
            <Button mt="4" colorScheme="purple">Ajouter un objet </Button>
        </Box>
        </>
    );
};
