import React, {useState} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text, Icon, Center, Input,Button, HStack, FormControl, Card, CardHeader, CardBody, VStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'
import { FaCheckCircle, FaUserShield } from 'react-icons/fa';

export const ReservationConfirmation = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts, web3, isOwner, artifactCollection} } = useEth();
    const [isDelegate, setIsDelegate] = useState(false);
    
    const handleConfirmDelegateNFT = async () =>{
        try{
            if(isDelegate){
                contract.events.RentalAccepted({ filter: { renter: accounts[0] } })
                .on('data', () => {
                    toastInfo("Votre Validation a été effectuée");
                    setTimeout(()=>{
                        updateStatus()
                    },2000)
                });


                await contract.methods.validateNFTDelegationForRental(parseInt(rental.rentalID), parseInt(rental.tokenID)).call({from:accounts[0]});
                await contract.methods.validateNFTDelegationForRental(parseInt(rental.rentalID), parseInt(rental.tokenID)).send({from:accounts[0]});

            }
        }catch(error){
            console.log(error)
            toastError("Erreur lors du transfer.. ");
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

                await contractCollection.methods.rentTool(parseInt(rental.tokenID), rental.renter, parseInt(rental.end), accounts[0]).call({from:accounts[0]});
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
                <Text mt="2rem">Votre demande a été envoyée, il faut attendre la validation du Loueur</Text>
                
            </Box>

            </>
            )}

        { rentalOwner && (<>
    
            <VStack mt="2rem">
                    <Heading as="h3" size="lg">
                        {rentalOwner &&  <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> }
                        Valider la demande de location
                    </Heading>
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
