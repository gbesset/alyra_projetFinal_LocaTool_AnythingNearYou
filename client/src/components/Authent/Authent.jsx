import React from 'react';
import { Heading, Box,  Flex, Text, Image } from '@chakra-ui/react';

export const Authent = () => {
    return (
        <Box>
            <Heading>Connectez-vous</Heading>
            <Flex mt="2rem">
                <Box flex="1.5" display="flex">
                   <Image height="auto" src="/assets/metamask-matic.jpeg" alt="logo" />
                </Box>
                <Box flex="2" p={4} alignItems="center"> 
                    <Text mt="2rem">Vous devez vous authentifer avec votre wallet Metamask ..</Text>
                    <Text mt="1rem">Pour cela, rien de plus simple : choisissez le réseau <strong>Mumbai testnet</strong> et selectionnez votre compte</Text>
                </Box>
            </Flex>
        </Box>
    );
};
