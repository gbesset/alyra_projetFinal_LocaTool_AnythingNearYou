import React from 'react';
import{Box, Flex, Text, Image} from'@chakra-ui/react';

export const NotFound = () => {
    return (
        <Box>
                <Box flex="1" align="center" >
                     <Image  maxWidth="500px" height="auto"  src="/assets/logo.png" alt="logo" />
                </Box>
              
                <Flex  pt="5rem">  
                    <Box flex="1">
                        <Flex h="100%" alignItems="center" justifyContent="center" >
                            <Image src="/assets/computer-tool.png" alt="Location outils" />
                        </Flex>
                        </Box>
                    <Box flex="1" >
                        <Flex h="100%" alignItems="center" justifyContent="center" > 
                            <Text className="text-white">Désolé, la page demandée n'existe pas.....</Text>
                        </Flex>
                    </Box>
            </Flex>

               
        </Box>
    );
};

