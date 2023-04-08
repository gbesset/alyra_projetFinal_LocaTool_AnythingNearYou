import React, {useState} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text, Icon, Center, Button,FormLabel, Textarea,  VStack, HStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'
import {  FaUserShield } from 'react-icons/fa';

export const DisputeDeclared = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts} } = useEth();
    const [description, setDescription] = useState("");


    const handleRefuseRetour = async () =>{
        try{
                contract.events.RentalDisputelConfirmedByUser({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Votre confirmation de litige a été prise en compte");
                    updateStatus()
                });


                await contract.methods.confirmDisputeAfterRental(rental.collection.owner, parseInt(rental.rentalID), description).call({from:accounts[0]});
                await contract.methods.confirmDisputeAfterRental(rental.collection.owner, parseInt(rental.rentalID), description).send({from:accounts[0]});

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

        { rentalOwner && (<>
            <Box mt="2rem">
                <Heading as="h3" size="lg">En attente de confirmation</Heading>
                <Text mt="2rem">le litige a été déclaré, il faut attendre la confirmation et version du locataire.</Text>
                <Text mt="2rem">Ensuite, le litige sera examiné par la DAO</Text>
                
            </Box>

            </>
            )}

        { !rentalOwner && (<>
    
            <VStack mt="1rem">
                    <Heading as="h3" size="lg">
                        {rentalOwner &&  <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> }
                        Confirmer le litige
                    </Heading>
                    <Box>
                    <Text>Le loueur a déclaré un litige et demande a passe devant la DAO.</Text>
                    <Text>A prioris vous êtes en désacord, vous pouvez expliciter votre version. Le litige sera examiné  par les membres de la DAO</Text>

                    </Box>
                    <Box width="80%">
                        <FormLabel>Litige</FormLabel>
                            <Textarea 
                                placeholder="Saisissez une description au litige"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <Center><Button  mt="4" colorScheme="red" onClick={handleRefuseRetour} > Confirmer le Litige</Button></Center>
                   </Box>
            </VStack>

            </>
            )}
        </>
    );
};
