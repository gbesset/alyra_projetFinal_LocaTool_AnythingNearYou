import React, {useState} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text, Icon, Center, Input,Button, HStack, FormControl, Card, CardHeader, CardBody, VStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'
import { FaCheckCircle, FaUserShield } from 'react-icons/fa';

export const RetourValidation = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts, web3, isOwner, artifactCollection} } = useEth();

    
    const handleConfirmRetour = async () =>{
        try{

                contract.events.RentalCompletedByRenter({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Votre Validation a été prise en compte (Acceptation)");
                    updateStatus()
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
                <Text mt="2rem">Votre demande a été envoyée, il faut attendre la validation du propriétaire</Text>
                
            </Box>

            </>
            )}

        { rentalOwner && (<>
    
            <VStack mt="1rem">
                    <Heading as="h3" size="lg">
                        {rentalOwner &&  <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> }
                        Valider la demande de location
                    </Heading>
                    <Box>
                    <Text>La demande de location a a été effectuée. Les fonds (paiement et caution) sont sécurisés dans le contrat</Text>
                    <Text>Vous pouvez accepter la demande de location. Pour cela, il faut déléguer votre NFT</Text>

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
