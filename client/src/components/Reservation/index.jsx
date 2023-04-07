import React, {useState, useEffect} from 'react';
import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box, Tabs, TabList, Tab, TabPanels, TabPanel,Flex, Link, Icon, Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { FaUserShield } from 'react-icons/fa';
import { Reservation } from './Reservation';
import { RentalStatus } from '../../utils/Enum';

export const ReservationDashboard = ({rental}) => {
    const { state: { contract, accounts, isOwner} } = useEth();

    const [collectionNFT, setCollectionNFT] = useState('')
    const [rentalStatus, setRentalStatus]=useState(rental.rentalStatus)
    
    const [tabIndex, setTabIndex] = useState(0)
    const handleTabsChange = (index) => {
        setTabIndex(index)
      }
    
      let selectedTab={ color: 'white', bg: 'purple.500' };

    const isTabActive = (status) => {
        return rentalStatus==status;
    }
   
      useEffect( () =>{    
          setTabIndex(parseInt(rentalStatus));

    }, [accounts, contract, rentalStatus]);

    return (
        <Box>
          {rental && (
              <>
              Status : {rentalStatus}
            <Tabs mt="3rem" variant='enclosed' colorScheme='white' isFitted index={tabIndex} onChange={handleTabsChange}>
            <TabList>
                {/* _selected={isTabActive(RentalStatus.AVAILABLE)?selectedTab:undefined} */}
                <Tab isDisabled={!isTabActive(RentalStatus.AVAILABLE)} className="text-white">Réserver</Tab>
                <Tab isDisabled={!isTabActive(RentalStatus.RENTAL_REQUESTED)}> <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> Valider</Tab>
                <Tab isDisabled={!isTabActive(RentalStatus.RENTAL_ACCEPTED_NFT_SENT)}>Confirmer NFT</Tab>
                <Tab isDisabled={!isTabActive(RentalStatus.VALIDATE_RECEIPT_PAYMENT)}>Location</Tab>
                <Tab isDisabled={!isTabActive(RentalStatus.VALIDATE_RECEIPT_PAYMENT)}>Restituer</Tab>
                <Tab isDisabled={!isTabActive(RentalStatus.COMPLETED_USER)}> <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> Valider retour</Tab>
                <Tab isDisabled={!isTabActive(RentalStatus.RETURN_ACCEPTED_BY_OWNER) && !isTabActive(RentalStatus.DISPUTE) }>Confirmer retour</Tab>
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
      </>


          )}
         </Box>
  
    );
};
