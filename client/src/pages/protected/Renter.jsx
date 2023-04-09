import React, { useEffect } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box, Text, Icon} from '@chakra-ui/react';
import { Authent } from '../../components/Authent/Authent';
import {FaTools } from 'react-icons/fa';

export const Renter = () => {
    const { state: { contract, accounts, artifact} } = useEth();

    const refreshStatus = async () => {
        try{
            console.log("aller chercher l'etat des locations")
            //const status = await contract.methods.workflowStatus().call({ from: accounts[0] });
            //etWorkflowStatus(parseInt(status));
        }
        catch(error){
           // console.log(error)
            //toastError("Problem to retrieve workflow status")
        }
    }

    useEffect( () =>{    
        async function getWorkflowStatus() {
            if (contract && contract?.methods) {
               refreshStatus()
            }
        }
      
        console.log(process.env.PINATA_URL)
        getWorkflowStatus();
    }, [accounts, contract, artifact]);

    return (
        <Box>
           {accounts ? (
                <> <Heading as="h1">Mes locations</Heading>
                  
                  <Text className="text-white" pl="3rem" pt="1rem">
                  <Icon as={FaTools} w={5} h={5} color="white.500" mr="1rem" /> Page en construction....
                    </Text>

                  </>
                ) : (
                    <>
                    <Authent />
                    </>
                )
                }
        </Box>
    );
};
