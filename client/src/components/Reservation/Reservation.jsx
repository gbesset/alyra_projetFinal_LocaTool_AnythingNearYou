import React, {useState} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, FormLabel, Center, Input,Button, HStack, FormControl, Card, CardHeader, CardBody } from '@chakra-ui/react';
import {calculateDurationBetween2Dates, toastError} from '../../utils/utils'
import moment from 'moment';

export const Reservation = ({rental}) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");

    const handleChangeStartDate = (e) => {
        setStartDate(e.target.value);
    };
      const handleChangeEndDate = (e) => {
        setEndDate(e.target.value);
      };

    function canSubmit() {
        if(startDate && endDate && moment(startDate, "YYYY-MM-DD", true).isValid() && moment(endDate, "YYYY-MM-DD", true).isValid()){
                const t1 = moment(startDate, "YYYY-MM-DD");
                const t2 = moment(endDate, "YYYY-MM-DD", true);
                return t1.isBefore(t2);
        }
        else{
            return false;
        }
      }
    
      const handleSubmit = async (event) => {
        event.preventDefault();
        
        console.log(`Start date: ${startDate}, End date: ${endDate}`);
        
        if(!canSubmit()) {
            console.log("cannot")
          return;
        }
    
        if (startDate && endDate ) {
            let dateObject = new Date(startDate);
            const timestampStart = dateObject.getTime()/1000;

            dateObject = new Date(endDate);
            const timestampEnd = dateObject.getTime()/1000;

            console.log(`Start date: ${timestampStart}, End date: ${timestampEnd}`);
            const differenceInMilliseconds = Math.abs(timestampEnd - timestampStart);
            const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24) *1000;
            console.log(differenceInDays);
        }
        console.log("ennnnnd")
    }

    function calculateDuration() {

        if (canSubmit()) {
            let d = calculateDurationBetween2Dates(startDate, endDate);
            setDuration(d);
            setPrice(d*rental.dayPrice)
        }
        else{
            toastError("Il faut deux dates au bon format")
        }
      }

    return (
        <>
        <Box>
            <RentalDetails rental={rental} />
        </Box>
        <Box mt="2rem">
        <Heading as="h3" size="lg">Réserver</Heading>
        
        <HStack spacing="4" pt="2rem" width="80%" mx="auto">
            <FormControl isRequired>
                <FormLabel>Date de début</FormLabel>
                <Input
                    type="date"
                    value={startDate}
                    onChange={handleChangeStartDate}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Date de fin</FormLabel>
                <Input
                    type="date"
                    value={endDate}
                    onChange={handleChangeEndDate}
                />
            </FormControl>
            </HStack>
        <Box>
            {duration && (

                        <Card align='center'  mt="2rem" width="60%" variant="filled" mx="auto">
                        <CardHeader>
                         <Heading size='md'>Récapitulatif</Heading>
                        </CardHeader>
                        <CardBody>
                        <HStack>
                            <Box mr="4rem">Durée :  {duration} jours.</Box>
                            <Box>Couts: {price} euros.</Box>

                        </HStack>
                        </CardBody>
                        </Card>
           
   
            )}
        </Box>
            
            <Center>
            <Button  mt="4"  variant='outline' colorScheme="white" onClick={calculateDuration} mr="2rem"> Calculer</Button>
            <Button  mt="4" colorScheme="purple" onClick={handleSubmit} isDisabled={!canSubmit()}> Réserver</Button>
            </Center>


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
