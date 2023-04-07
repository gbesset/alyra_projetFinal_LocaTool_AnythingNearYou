import React, {useState} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, FormLabel, Center, Input,Button, HStack, FormControl, Card, CardHeader, CardBody } from '@chakra-ui/react';
import {calculateDurationBetween2Dates, toastError, toastInfo} from '../../utils/utils'
import moment from 'moment';
import { useEth } from '../../contexts/EthContext';

export const Reservation = ({rental, rentalOwner}) => {
    const { state: { contract, accounts, web3, isOwner} } = useEth();
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
        
        if(canSubmit() && contract) {
            
            if (!web3.utils.isAddress(rental.collection.owner)) {
                toastError("l'adresse du loueur a un probleme....");
                return;
            }

            try{
                const beginTs = moment(startDate, "YYYY-MM-DD").unix();
                const endTs = moment(endDate, "YYYY-MM-DD").unix();

                contract.events.RentalRequested({ filter: { renter: accounts[0] } })
                .once('data', () => {
                      toastInfo("Votre demande a été effectuée");
                  });


                await contract.methods.sendPaiementForRental(rental.collection.owner, parseInt(rental.rentalID),parseInt(beginTs), parseInt(endTs)).send({from:accounts[0]});

            }catch(error){
                console.log(error)
                toastError("Erreur lors de la demande.. ");
            }
           /* 
            */



        }
        else{
            toastError("Il faut deux dates au bon format")
        }
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
       
        { !rentalOwner && (<>
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
                                    <Box mr="3rem">Durée :  {duration} jours.</Box>
                                    <Box mr="3rem">Couts: {price} euros.</Box>
                                    <Box>Caution: {rental.caution} euros.</Box>

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

            </>
            )}

        { rentalOwner && (<>
    
            <Box mt="2rem">Ps de location en cours.....</Box>
            </>
            )}
        </>
    );
};
