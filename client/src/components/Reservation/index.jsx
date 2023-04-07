import React, {useState, useEffect} from 'react';
import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box, Tabs, TabList, Tab, TabPanels, TabPanel,Flex, Link, Icon, Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { FaUserShield } from 'react-icons/fa';
import { Reservation } from './Reservation';
import { ReservationConfirmation } from './ReservationConfirmation';
import { NFTConfirmation } from './NFTConfirmation';
import { RentalStatus, toastError } from '../../utils/Enum';

export const ReservationDashboard = () => {
    const { state: { contract, accounts} } = useEth();
    const { rentalID } = useParams();
    const [rental, setRental] = useState('')
    const [rentalStatus, setRentalStatus]=useState(0)
    const [refreshStatus, setRefreshStatus] =useState(false);
    const [rentalOwner, setRentalOwner] =useState(false);
    
    const [tabIndex, setTabIndex] = useState(0)
    const handleTabsChange = (index) => {
        setTabIndex(index)
      }
    
      let selectedTab={ color: 'white', bg: 'purple.500' };

    const isTabActive = (status) => {
        return rentalStatus==status;
    }
   
    async function handleStatusChange(){
        alert("coucou")
        setRefreshStatus(true)
        await retrieveRental();
    }

    const retrieveRental = async () => {
        try{
            console.log("et oui.........")
            let rent = await contract.methods.getRentalByRentalID(rentalID).call({ from: accounts[0] });
            let nfts = await contract.methods.getToolsCollection(rent.collection.owner).call({ from: accounts[0] });
            
            nfts = nfts.filter((tool)=>tool.tokenID===rent.tokenID);
            
            let rentalComplete ={...nfts, ...rent};
            
            setRental(rentalComplete);
            setRentalStatus(rental.rentalStatus) 
            setRentalOwner(rental.collection.owner==accounts[0])

        }
        catch(error){
            //console.log(error)
            //toastError("Erreur pour récupérer la location")
        }
    }
    
      useEffect( () =>{    
        console.log("je met a jour")
        retrieveRental();
        setTabIndex(parseInt(rentalStatus));

    }, [accounts, contract, rentalStatus, refreshStatus]);

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
                       <Reservation rental={rental} rentalOwner={rentalOwner} updateStatus={handleStatusChange} />
                </TabPanel>
                <TabPanel>
                     <ReservationConfirmation rental={rental} rentalOwner={rentalOwner} updateStatus={handleStatusChange} />
                </TabPanel>
                <TabPanel>
                    <NFTConfirmation rental={rental} rentalOwner={rentalOwner} updateStatus={handleStatusChange} />
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
