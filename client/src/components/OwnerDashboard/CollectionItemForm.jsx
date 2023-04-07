
import { useState } from "react";
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,  Flex, Text } from '@chakra-ui/react';
import {FormControl, FormLabel, Input, Button, VStack, List, ListIcon, ListItem , Textarea, InputGroup, InputLeftElement} from "@chakra-ui/react";
import { toastInfo, toastError, isImageValid } from '../../utils/utils';
import { FaEuroSign, FaCheck } from "react-icons/fa"
import { pinFileToPinata, pinJsonToPinata } from '../../utils/pinata'
import { useNavigate } from 'react-router-dom';

export const CollectionItemForm = () => {
  const { state: { contract, accounts, isOwner} } = useEth();
  const navigate = useNavigate();


  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [serial, setSerial] = useState("");
  const [dayPrice, setDayPrice] = useState("");
  const [caution, setCaution] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  
  function canSubmit() {
    return name && description && serial && dayPrice && caution && image;
  }

  const handleSubmit = async (event) => {
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
    if (!isImageValid(image)) {
      toastError("L'image doit etre de type png, jpg,, jpeg et < 5Mo");
      return;
    }
    
    if(contract && isOwner){
        try{
            setLoading(true);
            const imgCID = await pinFileToPinata(image);
            let jsonCID= ''
            if(imgCID){
              
              let u = accounts[0].substring(0,5)+"..."+accounts[0].substring(accounts[0].length-4,accounts[0].length);
              let nftName= u+"_"+name;
              jsonCID = await pinJsonToPinata(nftName, imgCID, name, serial, name, description);

              toastInfo("NFT crée sur pinata !");


              // Ecoute de l'evenement de creation du NFT pour declencher la cration du Renal
              contract.events.NFTToolAddedToCollection({ filter: { renter: accounts[0] } })
                .once('data', async (eventData) => {
                    toastInfo("Felicitations ! votre NFT a été mint !");
                    const tokenID = eventData.returnValues.tokenId;
                    
                    let urlImg = `${process.env.PINATA_URL}/${imgCID}`
                    await contract.methods.addToolToRentals(urlImg,parseInt(dayPrice),parseInt(caution), parseInt(tokenID)).call({from: accounts[0]})
                    await contract.methods.addToolToRentals(urlImg,parseInt(dayPrice),parseInt(caution), parseInt(tokenID)).send({from: accounts[0]})
                  });

                  //Ecoute dee l'evenement de creation du rental pour rediriger
              contract.events.ToolAddedToRentals({ filter: { renter: accounts[0] } })
                .once('data', () => {

                      setLoading(false);
                      setTimeout(()=>{
                        navigate("/app/louer")    ;
                      }, 2000)
                      toastInfo("Felicitations! votre annonce en lien avec votre NFT a été crée!");
                  });
            
              let urlJson = `${process.env.PINATA_URL}/${jsonCID}`
              await contract.methods.addToolToCollection(urlJson, parseInt(serial), name, description).call({from:accounts[0]});
              await contract.methods.addToolToCollection(urlJson, parseInt(serial), name, description).send({from:accounts[0]});

            }
            else{
             throw new Error("img CID null")
            }
          setLoading(false);
        
        }
        catch(error){
          toastError("Erreur durant l'upload NFT ou son mint...........");
          console.log(error)
          setLoading(false);
        }

    }

    console.log({ dayPrice, caution, image });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedImage = e.dataTransfer.files[0];
    setImage(droppedImage);
  };
  /*
  const handleImageChange = async (event) => {
    setImage(event.target.files[0]);
  };*/
  
  return (
    <>
         <Box w="80%" mx="auto" pt="4rem">
            <Heading as="h3" size="lg">Ajouter un element à votre collection</Heading>
              <Box ml="2rem" mt="2rem">
                <Text>L'ajout se déroule en deux étapes</Text>
                <List spacing={3}>
                    <ListItem>
                      <ListIcon as={FaCheck} color='purple.500' />
                      Mint votre NFT sur votre collection, il pourra être utilisé partout et bientôt servir à d'autres usages...
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheck} color='purple.500' />
                      Déposez votre annonce sur le contrat de location
                    </ListItem>
                /</List>
              </Box>
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
                                <Input type='number' value={serial} onChange={(e) => setSerial(e.target.value)} placeholder='Numero de série' />
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
                       {/* <Input type="file" accept=".jpg, .jpeg, .png" onChange={handleImageChange} /> */}
                      </FormControl>
                    </Flex>

                    <Button isLoading={loading} mt="4" colorScheme="purple" onClick={handleSubmit} isDisabled={!canSubmit()}> Ajouter mon Objet </Button>
                </VStack>

            </Box>

      </>
  );
}

