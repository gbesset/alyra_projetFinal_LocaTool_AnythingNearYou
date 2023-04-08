import React, {useState, useEffect} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text, Icon, Center, Input,Button, HStack, FormControl, Card, CardHeader, CardBody, VStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'
import { FaCheckCircle, FaUserShield } from 'react-icons/fa';
import { RentalStatus } from '../../utils/Enum';


export const ConfirmRetourValidation = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts, web3, isOwner, artifactCollection} } = useEth();
    const [litige, setLitige] = useState('')
    
    const handleReedem = async () =>{
        try{

                contract.events.RentalEnded({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Votre demande a été prise en compte");
                    updateStatus()
                });


                await contract.methods.redeemPaymentForRental(rental.collection.owner, parseInt(rental.rentalID)).call({from:accounts[0]});
                await contract.methods.redeemPaymentForRental(rental.collection.owner, parseInt(rental.rentalID)).send({from:accounts[0]});


        }catch(error){
            console.log(error)
            toastError("Erreur lors du transfer.. ");
        }
    }


    const handleConfirmRefuseRetour = async () =>{
        try{

                contract.events.RentalDisputelConfirmedByUser({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Votre Validation a bien été prise en compte ");
                    setTimeout(()=>{
                        updateStatus()
                    },2000)
                });


                await contract.methods.confirmDisputeAfterRental(rental.collection.oner,parseInt(rental.rentalID)).call({from:accounts[0]});
                await contract.methods.confirmDisputeAfterRental(rental.collection.oner,parseInt(rental.rentalID)).send({from:accounts[0]});


        }catch(error){
            console.log(error)
            toastError("Erreur lors du transfer.. ");
        }
    }

    useEffect( () =>{    
       setLitige(rental.rentalStatus===RentalStatus.RentalStatusDISPUTE)

    }, []);

    return (
        <>
            <Box>
                <RentalDetails rental={rental} />
            </Box>

        { rentalOwner && (<>
            <Box mt="2rem">
                <Heading as="h3" size="lg">En attente de confirmation</Heading>
                <Text mt="2rem">Votre demande a été envoyée, il faut attendre la validation du locataire</Text>
                
            </Box>

            </>
            )}

        { !rentalOwner && (<>
    
            <VStack mt="1rem">
                    <Heading as="h3" size="lg">
                        {rentalOwner &&  <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> }
                        Fin de la location
                    </Heading>
                    <Box>
                    <Text>La restitution a été acceptée. Les fonds (caution) sont libérés du contrat</Text>
                    <Text>Vous pouvez procéder a sa récupération</Text>

                    </Box>
                    <Center>
                        <Button  mt="4"  colorScheme="purple" onClick={handleReedem} mr="2rem"> Récupérer caution</Button>
                      {litige && <Button  mt="4" colorScheme="red" onClick={handleConfirmRefuseRetour} > Litige accepté</Button>}
                    </Center>
            </VStack>

            </>
            )}
        </>
    );
};
