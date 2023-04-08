import React, {useState, useEffect} from 'react';
import { useParams } from "react-router-dom";
import { useEth } from '../../contexts/EthContext';
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel,Icon, Text } from '@chakra-ui/react';
import { FaUserShield, FaAward } from 'react-icons/fa';
import { Reservation } from './Reservation';
import { ReservationConfirmation } from './ReservationConfirmation';
import { NFTConfirmation } from './NFTConfirmation';
import { Location } from './Location';
import { RetourValidation } from './RetourValidation';
import { ConfirmRetourValidation } from './ConfirmRetourValidation';
import { ReRent } from './ReRent';
import { Dispute } from './Dispute';
import { DisputeDeclared } from './DisputeDeclared';
import { RentalStatus } from '../../utils/Enum';

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

    const isTabActive = (status) => {
        return rentalStatus==status;
    }
   
    const isRentalStatusAvailable = () =>{
        setIsRentalAvailable(rental.rentalStatus==RentalStatus.AVAILABLE)
    }

    const isRentalStatusDispute = () =>{
       return (rental.rentalStatus==RentalStatus.DISPUTE || rental.rentalStatus==RentalStatus.DISPUTE_SOLVED)?true:false;
        
    }
    const isRentalStatusDisputeConfirmed = () =>{
        return (rental.rentalStatus==RentalStatus.DISPUTE && rental.rentalData.isDisputeConfirmed )?true:false;
         
     }
    async function handleStatusChange(){
        console.log("declenchement")
        setRentalStatus(rental.rentalStatus+1) 
    }

    const setTabIndexFromRental= (status) => {
        setTabIndex(status);
        if( status==RentalStatus.DISPUTE || status==RentalStatus.DISPUTE_SOLVED )
            setTabIndex(6);
        else if(status==RentalStatus.RENTAL_ENDED || (isRentalStatusDisputeConfirmed() ))
            setTabIndex(7);

    }

    const retrieveRental = async () => {
        try{
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
        retrieveRental();
        setTabIndexFromRental(parseInt(rentalStatus))

    }, [accounts, contract, rentalStatus]);

    return (
        <Box> 

          { (isRentalAvailable || (isRenter || isRentalOwner) ) && (<> 
                    {rental && (
                            <>
                        <Tabs mt="3rem" variant='enclosed' colorScheme='white' isFitted index={tabIndex} onChange={handleTabsChange}>
                        <TabList>
                            {/* _selected={isTabActive(RentalStatus.AVAILABLE)?selectedTab:undefined} */}
                            <Tab isDisabled={!isTabActive(RentalStatus.AVAILABLE)} className="text-white">Réserver</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.RENTAL_REQUESTED)}> <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> Valider</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.RENTAL_ACCEPTED_NFT_SENT)}>Confirmer NFT</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.VALIDATE_RECEIPT_PAYMENT)}>Location</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.COMPLETED_USER)}><Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" /> Valider retour</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.RETURN_ACCEPTED_BY_OWNER)}>Fin location</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.DISPUTE) }> <Icon as={FaAward} w={5} h={5} color="white.500" mr="1rem" />Litige</Tab>
                            <Tab isDisabled={!isTabActive(RentalStatus.RENTAL_ENDED)}> <Icon as={FaUserShield} w={5} h={5} color="white.500" mr="1rem" />Relouer</Tab>
                            
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
                            <TabPanel>
                                    {!isRentalStatusDisputeConfirmed() &&<DisputeDeclared rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />}
                                    {isRentalStatusDisputeConfirmed() && <Dispute rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />}
                            </TabPanel>
                            <TabPanel>
                                    {!isRentalStatusDispute() && <ReRent rental={rental} rentalOwner={isRentalOwner} updateStatus={handleStatusChange} />}                                    
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
