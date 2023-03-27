import React from 'react';
import { Text, Box, Heading, Flex, Button , Image, Card, CardBody, Stack} from '@chakra-ui/react';
import { PhoneIcon, AddIcon, WarningIcon } from '@chakra-ui/icons'
import { FaWallet, FaNewspaper, FaHandshake, FaEuroSign } from 'react-icons/fa';
import { Icon } from "@chakra-ui/react"

export const Service = () => {
    return (
        <Box className="hero">
            <Flex direction="column" >
                <Box flex="1" >
                    <Heading className="text-gradient" p="2rem">Comment faire ?</Heading>
                </Box>
                <Flex direction="column" alignItems="center" justifyContent="center" >
               
                <Card mt="1rem" width="45%"
                 direction={{ base: 'column', sm: 'row' }}
                 overflow='hidden'
                 variant='outline'
                 className="white-glassmorphism">
                    <Flex m="1rem" alignItems='center' justifyContent='center' >
                        <Icon as={FaWallet} w={8} h={8} color="purple.500"  />
                    </Flex>

                    <Stack>
                        <CardBody>
                    
                            <Heading size='md' className="text-white">Connectez votre wallet</Heading>
                        
                            <Text py='2' className="text-white">
                                Un wallet Metamask suffit, connectez vous avec votre compte.
                            </Text>
                        </CardBody>
                    </Stack>
                </Card>

                <Card mt="1rem" width="45%"
                 direction={{ base: 'column', sm: 'row' }}
                 overflow='hidden'
                 variant='outline'
                 className="white-glassmorphism">
                    <Flex m="1rem" alignItems='center' justifyContent='center'>
                        <Icon as={FaNewspaper} w={8} h={8} color="purple.500"  />
                    </Flex>
                    <CardBody>
                        <Heading size='md' className="text-white">Déposez une annonce</Heading>

                        <Text py='2' className="text-white">
                            Remplissez un formulaire, créez un NFT et votre objet est en location !
                        </Text>
                    </CardBody>
                </Card>
                <Card mt="1rem" width="45%"
                 direction={{ base: 'column', sm: 'row' }}
                 overflow='hidden'
                 variant='outline'
                 className="white-glassmorphism">

                    <Flex m="1rem" alignItems='center' justifyContent='center' >
                        <Icon as={FaHandshake} w={8} h={8} color="purple.500"  />
                    </Flex>
                    <CardBody>
                        <Heading size='md' className="text-white">Location en vue ?</Heading>

                        <Text py='2' className="text-white">
                            Un utilisateur est interessé: donnez vous rendez-vous, expliquez les usages votre materiel est loué.<br/>
                            La caution sera automatiquement mise de côté durant la transaction.
                        </Text>
                    </CardBody>
                </Card>
                <Card mt="1rem" width="45%"
                 direction={{ base: 'column', sm: 'row' }}
                 overflow='hidden'
                 variant='outline'
                 className="white-glassmorphism">
                    <Flex m="1rem" alignItems='center' justifyContent='center' >
                        <Icon as={FaEuroSign} w={8} h={8} color="purple.500"  />
                    </Flex>
                    <CardBody>
                        <Heading size='md' className="text-white">Terminé ?</Heading>
                        
                        <Text py='2'className="text-white">
                            Récupérez votre matériel, vérifiez qu'il est en bon état et validez la transaction.<br/>
                            La caution sera restituée.<br/>
                            S'il y a un problème déclarez un litige qui sera traité par la DAO.
                        </Text>
                    </CardBody>
                </Card>
                </Flex>
            </Flex>
        </Box>
    );
};

