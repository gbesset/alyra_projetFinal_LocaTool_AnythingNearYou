import React, {useState, useEffect} from 'react';
import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box, Tabs, TabList, Tab, TabPanels, TabPanel,Flex, Link, Icon, Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { FaUserShield } from 'react-icons/fa';
import { Reservation } from './Reservation';
import { ReservationConfirmation } from './ReservationConfirmation';
import { NFTConfirmation } from './NFTConfirmation';
import { Location } from './Location';
import { RetourValidation } from './RetourValidation';
import { ConfirmRetourValidation } from './ConfirmRetourValidation';

import { RentalStatus, toastError } from '../../utils/Enum';

export const ReservationDashboard = () => {
    const { state: { contract, accounts} } = useEth();
    const { rentalID } = useParams();
    const [rental, setRental] = useState('')
    const [rentalStatus, setRentalStatus]=useState(0)
    const [isRentalAvailable, setIsRentalAvailable] =useState(false);
    const [isRentalOwner, setIsRentalOwner] =useState(false);
    const [isRenter, setIsRenter] =useState(false);
    const [tabIndex, setTabIndex] = useState(0)

    const handleTabsChange = (index) => {
        setTabIndex(index)
      }
    
      let selectedTab={ color: 'white', bg: 'purple.500' };

    const isTabActive = (status) => {
        return rentalStatus==status;
    }
   
    const isRentalStatusAvailable = () =>{
        setIsRentalAvailable(rental.rentalStatus==RentalStatus.AVAILABLE)
    }

    async function handleStatusChange(){
        console.log("declenchement")
        //setRefreshStatus(refreshStatus+1)
        setRentalStatus(rental.rentalStatus+1) 
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
            setIsRentalOwner(rental.collection.owner==accounts[0])
            setIsRenter(rental.renter===accounts[0])
            isRentalStatusAvailable();
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

    }, [accounts, contract, rentalStatus]);

    return (
        <Box> 
            Status : {rentalStatus}  index {tabIndex} 
          { (isRentalAvailable || (isRenter || isRentalOwner) ) && (<> 
                    {rental && (
                            <>
                        <Tabs mt="3rem" variant='enclosed' colorScheme='white' isFitted index={tabIndex} onChange={handleTabsChange}>
                        <TabList>
                            {/* _selected={isTabActive(RentalStatus.AVAILABLE)?selectedTab:undefined} */}
                            <Tab isDisabled={!isTabActive(RentalStatus.AVAILABLE)} className="text-white">Réserver</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.RENTAL_REQUESTED)}> <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> Valider</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.RENTAL_ACCEPTED_NFT_SENT)}>Confirmer NFT</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.COMPLETED_USER)}>Location</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.VALIDATE_RECEIPT_PAYMENT)}>Restituer</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.RETURN_ACCEPTED_BY_OWNER)}> <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> Valider retour</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Reservation rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />
                            </TabPanel>
                            <TabPanel>
                                <ReservationConfirmation rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />
                            </TabPanel>
                            <TabPanel>
                                <NFTConfirmation rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />
                            </TabPanel>
                            <TabPanel>
                                <Location rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />
                            </TabPanel>
                            <TabPanel>
                                <RetourValidation rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />
                            </TabPanel>
                            <TabPanel>
                                <ConfirmRetourValidation rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />
                            </TabPanel>
                        </TabPanels>
                        </Tabs>
                    </>
                    )}
                
         </>
        )}
            {(!isRentalAvailable && !isRenter && !isRentalOwner) && (
                <Text>L'objet est en cours de location......</Text>
            )}
         </Box>
  
    );
};
