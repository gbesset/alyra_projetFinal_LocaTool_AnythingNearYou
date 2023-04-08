import React, { useEffect} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text, Icon, Center, Button, VStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';

export const Dispute = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts, } } = useEth();


    return (
        <>
            <Box>
                <RentalDetails rental={rental} />
            </Box>

                <Heading as="h3" size="lg">Litige sur la location</Heading>
                <Text mt="2rem">L'objet loué a été détérioré, un litige est en cours et sera analysé par la DAO.</Text>
        
        </>
    );
};
