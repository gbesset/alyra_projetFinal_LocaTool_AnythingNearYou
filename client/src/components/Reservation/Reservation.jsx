import React from 'react';
import { RentalDetails } from './RentalDetails';
import { Box } from '@chakra-ui/react';


export const Reservation = ({rental}) => {
    return (
        <>
        <Box>
            <RentalDetails rental={rental} />
        </Box>
        <Box>


        </Box>
            <h1>Réserver l'outil {rental.tokenID}</h1>
            <h1>Réserver</h1>
            <p>Titre : {rental.title}</p>
            <p>Description : {rental.description}</p>
            <p>Token ID : {rental.tokenID}</p>
            <p>dayPrice : {rental.dayPrice}</p>
            <p>caution : {rental.caution}</p>
            <p>url : {rental.tokenImgURI}</p>
        </>
    );
};
