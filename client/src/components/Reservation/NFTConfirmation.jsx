import React, {useState} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text, Center, Icon, Button,  Card, CardHeader, CardBody, VStack, HStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'
import { FaCheckCircle } from 'react-icons/fa';

export const NFTConfirmation = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts, web3, isOwner, artifactCollection} } = useEth();

    const [renterAddress, setRenterAddress] = useState(false);
    
    const handleCheckNFT = async () => {
       try{
            const contractCollection = new web3.eth.Contract(artifactCollection.abi, rental.collection.collection);            

            console.log(contract)
            if (web3.utils.isAddress(rental.renter) && contract && contractCollection) {

                const rAdress = await contractCollection.methods.userOf(parseInt(rental.tokenID)).call({from:accounts[0]});
                setRenterAddress(rAdress);

            }
        }catch(error){
            console.log(error)
            toastError("Erreur lors du check.. ");
        }
      
    }

    const handleConfirmNFT = async () =>{
    
        contract.events.RentalNFTToolDelegated({ filter: { renter: accounts[0] } })
        .on('data', () => {
                toastInfo("Votre Validation a été effectuée");
                updateStatus()
            });


        await contract.methods.validateNFTandToolReception(rental.collection.owner, parseInt(rental.rentalID)).send({from:accounts[0]});

    }

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
    
            <VStack mt="2rem">
                    <Heading as="h3" size="lg">Valider la reception du NFT</Heading>
                    <Box>
                    <Text>Le NFT vous a été transféré. Vérifiez que vous en etes le locataire...........</Text>
                    <Text></Text>

                    </Box>
                    <Center>
                        <Button  mt="4"  variant='outline' colorScheme="white" onClick={handleCheckNFT} mr="2rem"> Verifier la delegation du NFT</Button>
                        <Button  mt="4" colorScheme="purple" onClick={handleConfirmNFT} > Confirmer la reception du NFT</Button>
                    </Center>
            </VStack>
            
            {renterAddress && (
                    <>
                    <Card align='center'  mt="2rem" width="70%" variant="filled" mx="auto">
                        <CardHeader>
                        <Heading size='md'>Vérification</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack>
                                <Box mr="3rem">Addresse du locataire :  {renterAddress}</Box>
                                <Box mr="3rem">Votre addresse        :  {accounts[0]}</Box>
                                <Box mr="3rem">{renterAddress==accounts[0]?
                                (<>
                                    <HStack>
                                        <Icon as={FaCheckCircle} w={8} h={8} color="purple.500"  />
                                        <Text>Les adressses correspondent !</Text>
                                    </HStack>
                                </> )
                                
                                :(
                                    <Text>Les adresses ne correspondent pas!</Text>
                                )}
                                </Box>

                            </VStack>
                        </CardBody>
                    </Card>

                </>
            )}



        </>)}
    </>
    );
};
