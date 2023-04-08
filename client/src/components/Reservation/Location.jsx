import React, {useState} from 'react';
import { RentalDetails } from './RentalDetails';
import { Heading, Box, Text,Icon, Center, Input,Button, HStack, FormControl, Card, CardHeader, CardBody, VStack } from '@chakra-ui/react';
import { useEth } from '../../contexts/EthContext';
import { toastError, toastInfo} from '../../utils/utils'
import { FaClock } from 'react-icons/fa';
import moment from 'moment';
import { FaUserShield } from 'react-icons/fa';


export const Location = ({rental, rentalOwner, updateStatus}) => {
    const { state: { contract, accounts, web3,  artifactCollection} } = useEth();
    const [NFTExpires, setNFTExpires] = useState(false);

    const formatDate = (ts) =>{
        const dt = moment.unix(ts);
        return dt.format('DD/MM/YYYY, hh:mm:ss');
    }

    const handleCheckNFT = async () =>{

        const contractCollection = new web3.eth.Contract(artifactCollection.abi, rental.collection.collection);            

        if (web3.utils.isAddress(rental.renter) && contract && contractCollection) {

            const expires = await contractCollection.methods.userExpires(parseInt(rental.tokenID)).call({from:accounts[0]});
        
            setNFTExpires(formatDate(expires));
        }
    }



        const handleRestituteNFT = async () =>{
            try{
                contract.events.RentalCompletedByUser({ filter: { renter: accounts[0] } })
                .once('data', () => {
                        toastInfo("Votre Validation a été effectuée");
                        setTimeout(()=>{
                            updateStatus()
                        },2000)
                    });

                await contract.methods.giveBackToolAfterRental(rental.collection.owner, parseInt(rental.rentalID)).call({from:accounts[0]});
                await contract.methods.giveBackToolAfterRental(rental.collection.owner, parseInt(rental.rentalID)).send({from:accounts[0]});
                }
            catch(error){
                console.log(error)
                toastError("Erreur lors de la demande.. ");
            }
        }
      

    return (
        <>
            <Box>
                <RentalDetails rental={rental} />
            </Box>

        { rentalOwner && (<>
            <Box mt="2rem">
                <Heading as="h3" size="lg">
                    <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> 
                    En cours de location
                </Heading>
                <Text mt="2rem">Votre objet est en cours de location jusqu'au {formatDate(rental.end)}</Text>
                
            </Box>

            </>
            )}

        { !rentalOwner && (<>
    
            <VStack mt="2rem">
                    <Heading as="h3" size="lg">Location en cours</Heading>
                    <Box>
                    <Text>La demande de location a a été effectuée. Les fonds (paiement et caution) sont sécurisés dans le contrat</Text>
                    <Text>Vous pouvez accepter la demande de location. Pour cela, il faut déléguer votre NFT</Text>

                    </Box>
                    <Center>
                        <Button  mt="4"  variant='outline' colorScheme="white" onClick={handleCheckNFT} mr="2rem"> Verifier la durée</Button>
                        <Button  mt="4" colorScheme="purple" onClick={handleRestituteNFT} >Restituer</Button>
                    </Center>
            </VStack>


            {NFTExpires && (
                    <>
                    <Card align='center'  mt="2rem" width="70%" variant="filled" mx="auto">
                        <CardHeader>
                        <Heading size='md'>Vérification</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack>     
        
                            <HStack>
                                <Icon as={FaClock} w={8} h={8} color="purple.500"  />
                                <Text>Fin de la délégation : {NFTExpires}</Text>
                            </HStack>
                        

                            </VStack>
                        </CardBody>
                    </Card>

                </>
            )}







            </>
            )}
        </>
    );
};
