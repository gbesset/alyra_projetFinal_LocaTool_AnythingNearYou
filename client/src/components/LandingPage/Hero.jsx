import React from 'react';
import { Text, Box, Heading, Flex, Button, Center , Image} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const Hero = () => {
    return (
        <Flex className="hero" h="83vh"  justifyContent="center">
            <Box>
                <Box flex="1" align="center"  mt="3rem">
                    <Image  maxWidth="500px" height="auto"  src="/assets/logo.png" alt="logo" />
                    </Box>
                <Flex>
                    <Box flex="1" mt="3rem">
                        <Heading className="text-gradient" p="2rem">Louez les outils que vous possedez</Heading>
                        <Text className="text-white" pl="3rem" pt="1rem">
                            Vous avez des outils spécifiques qui ne servent pas souvent ?<br/>
                        </Text>
                        <Text className="text-white" pl="3rem" pt="1rem">
                            Pourquoi ne pas en faire profiter des personnes autour de chez vous et rentabiliser cet achat.<br/>
                        </Text>
                        <Text className="text-white" pl="3rem" pt="1rem">
                            Pour cela rien de plus simple, Mettez le à disposition et louez le
                        </Text>
                        <Center pt="2rem">
                        <Button align="center" variant='solid' colorScheme='purple'  as={Link} to="/app/rentals">C'est parti !</Button>
                        </Center>
                    </Box>
                    <Box flex="1" >
                    <Flex h="100%" alignItems="center" justifyContent="center" >
                    <Image src="/assets/computer-tool.png" alt="Location outils" />
                    </Flex>
                    </Box>
                </Flex>
            </Box>
        </Flex>
    );
};

