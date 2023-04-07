import React, {useState} from 'react';
import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box, Tabs, TabList, Tab, TabPanels, TabPanel,Flex, Link, Icon, Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { FaUserShield } from 'react-icons/fa';
import { Reservation } from './Reservation';


export const ReservationDashboard = ({rental}) => {
    const { state: { contract, accounts, isOwner} } = useEth();

    const [collectionNFT, setCollectionNFT] = useState('')

   

    return (
        <Box>
          {rental && (
          
          <>
            <Tabs mt="3rem" variant='enclosed' colorScheme='purple' isFitted>
            <TabList>
                <Tab _selected={{ color: 'white', bg: 'white.500' }}>Réserver</Tab>
                <Tab> <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> Valider</Tab>
                <Tab isDisabled>Confirmer</Tab>
                <Tab>Restituer</Tab>
                <Tab> <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> Valider retour</Tab>
                <Tab>Confirmer retour</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                       <Reservation rental={rental} />
                </TabPanel>
                <TabPanel>
                <p>2</p>
                </TabPanel>

                <TabPanel>
                <p>3</p>
                </TabPanel>
                <TabPanel>
                <p>4</p>
                </TabPanel>
                <TabPanel>
                <p>5</p>
                </TabPanel>
            </TabPanels>
            </Tabs>


            <h1>Réserver l'outil {rental.tokenID}</h1>
            <div>
            <h1>Réserver</h1>
            <p>Titre : {rental.title}</p>
            <p>Description : {rental.description}</p>
            <p>Token ID : {rental.tokenID}</p>
            <p>dayPrice : {rental.dayPrice}</p>
            <p>caution : {rental.caution}</p>
            <p>url : {rental.tokenImgURI}</p>
            
            </div>
      </>


          )}
         </Box>
  
    );
};
