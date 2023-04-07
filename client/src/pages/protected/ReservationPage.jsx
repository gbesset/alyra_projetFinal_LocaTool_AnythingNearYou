import React, {useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box, Tabs, TabList, Tab, TabPanels, TabPanel,Flex, Link, Icon, Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { Authent } from '../../components/Authent/Authent';
import { ReservationDashboard } from '../../components/Reservation';

export const ReservationPage = () => {
  const { state: {  accounts} } = useEth();
   const location = useLocation();
   const { rental } = location?.state;
  
   useEffect( () =>{    
  
}, [accounts]);

  return (
    <Box className="text-white">
          {accounts ? (
              <>
                 <Heading as="h2">Suivi de la location</Heading>
                  <Box p="4">
                    <ReservationDashboard rental={rental} /> 
                  </Box>
                
                </>
              ) : (
                  <>
                  <Authent />
                  </>
              )
              }
      </Box>

  );
}
