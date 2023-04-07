import React, {useState} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text,FormLabel, Center, Input,Button, HStack, FormControl, Card, CardHeader, CardBody, VStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'

export const ReservationConfirmation = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts, web3, isOwner, artifactCollection} } = useEth();
    const [isDelegate, setIsDelegate] = useState(false);
    
    const handleConfirmDelegateNFT = async () =>{
        if(isDelegate){
            contract.events.RentalAccepted({ filter: { renter: accounts[0] } })
            .on('data', () => {
                  toastInfo("Votre Validation a été effectuée");
                  updateStatus()
              });


            await contract.methods.validateNFTDelegationForRental(parseInt(rental.rentalID), parseInt(rental.tokenID)).send({from:accounts[0]});

        }
    }

      const handleDelegateNFT = async (event) => {
        try{

            const contractCollection = new web3.eth.Contract(artifactCollection.abi, rental.collection.collection);            

            console.log(contract)
            if (web3.utils.isAddress(rental.renter) && contract && contractCollection) {

                console.log("delegate")

                contractCollection.events.UpdateDelegation({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Le transfert du NFT a été effecuté");
                    setIsDelegate(true);
                });

                await contractCollection.methods.rentTool(parseInt(rental.tokenID), rental.renter, parseInt(rental.end), accounts[0]).send({from:accounts[0]});
            }
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
    
            <VStack>
                    <Heading as="h3" size="lg">Valider la demande de location</Heading>
                    <Box>
                    <Text>La demande de location a a été effectuée. Les fonds (paiement et caution) sont sécurisés dans le contrat</Text>
                    <Text>Vous pouvez accepter la demande de location. Pour cela, il faut déléguer votre NFT</Text>

                    </Box>
                    <Center>
                        <Button  mt="4"  variant='outline' colorScheme="white" onClick={handleDelegateNFT} mr="2rem"> Deleguer le NFT</Button>
                        <Button  mt="4" colorScheme="purple" onClick={handleConfirmDelegateNFT} isDisabled={!isDelegate}> Confirmer Delegation</Button>
                    </Center>
            </VStack>

            </>
            )}
        </>
    );
};
