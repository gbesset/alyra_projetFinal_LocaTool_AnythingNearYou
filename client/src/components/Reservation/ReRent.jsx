import React, { useEffect} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text, Icon, Center, Button, VStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'
import {  FaUserShield } from 'react-icons/fa';


export const ReRent = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts, } } = useEth();

    
    const handleReRent = async () =>{
        try{
                contract.events.RentalReAvailable({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Votre demande a été prise en compte");
                    setTimeout(()=>{
                        updateStatus()
                    },2000)
                });

                await contract.methods.rentAgainRental( parseInt(rental.rentalID)).call({from:accounts[0]});
                await contract.methods.rentAgainRental( parseInt(rental.rentalID)).send({from:accounts[0]});


        }catch(error){
            console.log(error)
            toastError("Erreur lors du transfer.. ");
        }
    }

    useEffect( () =>{    
   
    }, []);

    return (
        <>
            <Box>
                <RentalDetails rental={rental} />
            </Box>

        { !rentalOwner && (<>
            <Box mt="2rem">
                <Heading as="h3" size="lg">Fin de location</Heading>
                <Text mt="2rem">L'objet sort de location, il sera bientôt disponible</Text>
                
            </Box>

            </>
            )}

        { rentalOwner && (<>
    
            <VStack mt="1rem">
                    <Heading as="h3" size="lg">
                        {rentalOwner &&  <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> }
                        Remettre a la location
                    </Heading>
                    <Box>
    
                    </Box>
                    <Center>
                        <Button  mt="4"  colorScheme="purple" onClick={handleReRent} mr="2rem"> Relouer</Button>
                    </Center>
            </VStack>

            </>
            )}
        </>
    );
};
