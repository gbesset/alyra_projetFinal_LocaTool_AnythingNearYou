
import { useState } from "react";
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,  Flex, Text } from '@chakra-ui/react';
import {FormControl, FormLabel, Input, Button, VStack, HStack , Textarea, InputGroup, InputLeftElement} from "@chakra-ui/react";
import { toastInfo, toastError } from '../../utils/utils';
import { FaEuroSign } from "react-icons/fa"

export const CollectionItemForm = () => {
  const { state: { contract, accounts} } = useEth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [serial, setSerial] = useState("");
  const [dayPrice, setDayPrice] = useState("");
  const [caution, setCaution] = useState("");
  const [image, setImage] = useState(null);

  
  function canSubmit() {
    return name && description && serial && dayPrice && caution && image;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if(!canSubmit()) {
      return;
    }

    if (!name || !description || !serial || !dayPrice || !caution || !image) {
      toastError("Veuillez remplir tous les champs");
      return;
    }
    if (isNaN(Number(dayPrice)) || isNaN(Number(caution))) {
      toastError("Les champs 'Prix par jour' et 'Caution' doivent être des nombres");
      return;
    }

    console.log({ dayPrice, caution, image });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedImage = e.dataTransfer.files[0];
    setImage(droppedImage);
  };
  
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };
  
  return (
    <>
         <Box w="80%" mx="auto" pt="4rem">
            <Heading as="h3" size="lg">Ajouter un element à votre collection</Heading>

                <VStack spacing="4" pt="2rem">
                    <FormControl isRequired>
                        <FormLabel>Nom</FormLabel>
                        <Input
                            type="text"
                            placeholder="Entrez le titre de l'objet"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            placeholder="Donnez une description de votre objet"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormControl>
                    <FormControl isRequired mr={4}>
                          <FormLabel>Numéro de série</FormLabel>
                              <InputGroup>
                                <InputLeftElement
                                  pointerEvents='none'
                                  children={<FaEuroSign color='gray.300' />}
                                />
                                <Input type='number' value={serial} onChange={(e) => setSerial(e.target.value)} placeholder='Prix de location par jour' />
                              </InputGroup>
                        </FormControl>
                    <Flex width="100%">
                        <FormControl isRequired mr={4}>
                          <FormLabel>Prix par jour</FormLabel>
                              <InputGroup>
                                <InputLeftElement
                                  pointerEvents='none'
                                  children={<FaEuroSign color='gray.300' />}
                                />
                                <Input type='number' value={dayPrice} onChange={(e) => setDayPrice(e.target.value)} placeholder='Prix de location par jour' />
                              </InputGroup>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Caution</FormLabel>
                          <InputGroup>
                            <InputLeftElement
                              pointerEvents='none'
                              children={<FaEuroSign color='gray.300' />}
                            />
                            <Input type='number' value={caution} onChange={(e) => setCaution(e.target.value)} placeholder='Caution de votre objet' />
                          </InputGroup>
                        </FormControl>
                    </Flex>
                    <Flex width="100%">
                    <FormControl isRequired>
                          <FormLabel>Ajouter une image</FormLabel>
                          <Box width="80%" mr={4} 
                              mx="auto"         //centrer hrozontalement
                              border="2px dashed gray"
                              borderRadius="md"
                              p={4}
                              onDrop={handleDrop}
                              onDragOver={(e) => e.preventDefault()}
                            >
                              {image ? (
                                <>
                                  <Text mb={2}>File name: {image.name}</Text>
                                  <Text>File size: {image.size} bytes</Text>
                                </>
                              ) : (
                                <Text>Drop your image here</Text>
                              )}
                            </Box>
                      {/*  <Input type="file" onChange={handleImageChange} />*/}
                      </FormControl>
                    </Flex>

                    <Button mt="4" colorScheme="purple" onClick={handleSubmit} isDisabled={!canSubmit()}> Ajouter mon Objet </Button>
                </VStack>

            </Box>

      </>
  );
}

