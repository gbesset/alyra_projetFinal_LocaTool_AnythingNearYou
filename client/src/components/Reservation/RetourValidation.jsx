import React from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text, Icon, Center, Button,  VStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'
import {  FaUserShield } from 'react-icons/fa';

export const RetourValidation = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts} } = useEth();

    
    const handleConfirmRetour = async () =>{
        try{

                contract.events.RentalCompletedByRenter({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Votre Validation a été prise en compte (Acceptation)");
                    setTimeout(()=>{
                        updateStatus()
                    },2000)
                });


                await contract.methods.validateReturnToolAfterRental(parseInt(rental.rentalID)).call({from:accounts[0]});
                await contract.methods.validateReturnToolAfterRental(parseInt(rental.rentalID)).send({from:accounts[0]});


        }catch(error){
            console.log(error)
            toastError("Erreur lors du transfer.. ");
        }
    }

    const handleRefuseRetour = async () =>{
        try{

                contract.events.RentalDisputeCreated({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Votre Validation a bien été prise en compte (REFUS)");
                    updateStatus()
                });


                await contract.methods.refuseReturnToolAfterRental(parseInt(rental.rentalID)).call({from:accounts[0]});
                await contract.methods.refuseReturnToolAfterRental(parseInt(rental.rentalID)).send({from:accounts[0]});


        }catch(error){
            console.log(error)
            toastError("Erreur lors du transfer.. ");
        }
    }

    return (
        <>
            <Box>
                <RentalDetails rental={rental} />
            </Box>

        { !rentalOwner && (<>
            <Box mt="2rem">
                <Heading as="h3" size="lg">En attente de confirmation</Heading>
                <Text mt="2rem">La restitution a été effectuée et votre demande a été envoyée, il faut attendre la validation du loueur</Text>
                
            </Box>

            </>
            )}

        { rentalOwner && (<>
    
            <VStack mt="1rem">
                    <Heading as="h3" size="lg">
                        {rentalOwner &&  <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> }
                        Confirmer le retour de location
                    </Heading>
                    <Box>
                    <Text>Le retour de l'objet a été effectuée. Les fonds (paiement et caution) seront libérés ou toujours bloqués dans le contrat en fonction du retour</Text>
                    <Text>Si l'objet a été détérioré ete que vous n'êtes pas d'accords, il faudra déclencher un litige et faire examiner le problème par les membres de la DAO</Text>

                    </Box>
                    <Center>
                        <Button  mt="4"  colorScheme="purple" onClick={handleConfirmRetour} mr="2rem"> Confirmer le retour</Button>
                        <Button  mt="4" colorScheme="red" onClick={handleRefuseRetour} > Refuser le retour</Button>
                    </Center>
            </VStack>

            </>
            )}
        </>
    );
};
