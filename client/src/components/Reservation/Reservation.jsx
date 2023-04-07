import React from 'react';
import { RentalDetails } from './RentalDetails';

export const Reservation = ({rental}) => {
    return (
        <div>
            <RentalDetails rental={rental} />
        </div>
    );
};
