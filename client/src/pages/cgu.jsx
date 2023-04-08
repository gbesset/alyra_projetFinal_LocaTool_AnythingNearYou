import React from 'react';
import { Text, Box, Heading} from '@chakra-ui/react';

export const CGU = () => {
    return (
        
  
        <Box flex="1" align="center" width="80%">
                
            <Heading className="text-gradient" p="2rem" >CGU</Heading>
            <Box height="100vh">
            <object data="/assets/pdf/cgu_dapp.pdf" type="application/pdf" width="100%" height="100%">
                <Text>CGU </Text>
            </object>
            </Box>
            
        </Box>
        
    );
};

