import React, { useState } from 'react';
import { Box, Heading, Text, Switch, Button, FormControl, FormLabel,} from "@chakra-ui/react";
import { useEth } from '../../contexts/EthContext';

export const Admin = () => {
    const { state: { accounts, isOwner, isRenter, ownerAddress} } = useEth();

    return (
        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Vos informations
          </Heading>
    
          {accounts &&  <>
                    <Box mb={4}>
                        <Text mb={2}>Adresse de votre wallet:</Text>
                        <Text>{accounts}</Text>
                    </Box>
                
                    <FormControl display="flex" alignItems="center" mb={4}>
                        <FormLabel htmlFor="owner-switch" mb="0">
                        Êtes-vous Loueur ?
                        </FormLabel>
                        <Switch
                        id="owner-switch"
                        isChecked={isOwner}
                        ml={2}
                        />
                    </FormControl>
                
                    {isOwner && (
                        <>
                        <Box mb={4}>
                            <Text mb={2}>Adresse de votre collection:</Text>
                            <Text>{ownerAddress}</Text>
                        </Box>
                
                        <Box mb={4}>
                            <Text mb={2}>Nom de votre collection:</Text>
                            <Text>Todo</Text>
                        </Box>
                
                        <Box mb={4}>
                            <Text mb={2}>Symbole de votre collection:</Text>
                            <Text>Todo</Text>
                        </Box>
                        </>
                    )}
                
                    <FormControl display="flex" alignItems="center" mb={4}>
                        <FormLabel htmlFor="tenant-switch" mb="0">
                        Êtes-vous locataire ?
                        </FormLabel>
                        <Switch
                        id="tenant-switch"
                        isChecked={isRenter}
                        ml={2}
                        />
                    </FormControl>
                
                    {isRenter && (
                        <Box mb={4}>
                        <Text mb={2}>Nombre de locations réalisées:</Text>
                        <Text>TODO</Text>
                        </Box>
                    )}
            </>
            }
            </Box>
      );
};
