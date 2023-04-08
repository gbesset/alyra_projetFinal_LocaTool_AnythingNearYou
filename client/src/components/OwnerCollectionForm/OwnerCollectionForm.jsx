import React, { useEffect, useState } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,  Flex, Text } from '@chakra-ui/react';
import {FormControl, FormLabel, Input, Button, VStack } from "@chakra-ui/react";
import { toastInfo, toastError } from '../../utils/utils';

export const OwnerCollectionForm = () => {
    const { state: { contract, accounts} } = useEth();

    const [collectionName, setCollectionName] = useState("");
    const [colletionSymbol, setCollectionSymbol] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!collectionName || !colletionSymbol) {
            toastError("Veuillez remplir tous les champs");
            return;
          }
        
        if(collectionName && collectionName.length>0 && colletionSymbol && colletionSymbol.length>0 && colletionSymbol.length<8){
            try{
                await contract.methods.createCollection(collectionName, colletionSymbol).send({from:accounts[0]});

                toastInfo("Compte de proprétaire crée !");
            }catch(error){
                console.log(error)
                toastError("Vous avez déjà une collection ");
            }
        }
      };  

    return (
        <>
          <Heading as="h3">Devenez Loueur</Heading>
            <Text mt="4">Vous avez des objets qui ne servent pas souvent ? </Text>
            <Text mt="2">Devenez Loueur pour pouvoir les mettre en location, les rentabiliser, générer des benefices et entrer dans la crypto !
            </Text>
            <Box w="80%" mx="auto" pt="4rem">
                <Heading as="h3" size="lg">Créer votre propre collection</Heading>

                    <VStack spacing="4" pt="2rem">
                        <FormControl isRequired>
                            <FormLabel>Nom de la collection NFT</FormLabel>
                            <Input
                                type="text"
                                placeholder="Entrez le nom de la collection NFT"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Colletion Symbol</FormLabel>
                            <Input
                                type="text"
                                placeholder="Entrez le symbole"
                                value={colletionSymbol}
                                onChange={(e) => setCollectionSymbol(e.target.value)}
                            />
                        </FormControl>

                        <Button mt="4" colorScheme="purple" onClick={handleSubmit}> Devenir Loueur </Button>
                    </VStack>             
            </Box>
        </>
    );
};
