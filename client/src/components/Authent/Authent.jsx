import React from 'react';
import { Heading, Box,  Flex, Text, Button } from '@chakra-ui/react';

export const Authent = () => {
    return (
        <Box>
            <Heading>Connectez-vous</Heading>
            <Text mt="2rem">Vous devez vous authentifer avec votre wallet Metamask ..</Text>
            <Text mt="1rem">Pour cela, rien de plus simple : choisissez le réseau <strong>Mumbai testnet</strong> et selectionnez votre compte</Text>
        </Box>
    );
};
