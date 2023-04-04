import React, { useEffect, useState } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,  Flex, Text, Button } from '@chakra-ui/react';
import { Authent } from '../../components/Authent/Authent';
import { OwnerDashboard } from '../../components/OwnerDashboard';
import { OwnerCollectionForm } from '../../components/OwnerCollectionForm/OwnerCollectionForm';

export const Owner = () => {
    const { state: { contract, accounts, artifact} } = useEth();

    const [isOwner, setIsOwner] = useState(true);

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
      
   
        getWorkflowStatus();
    }, [accounts, contract, artifact]);

    return (
        <Box>
            {Math.random()}<br/>
            {accounts ? accounts[0]:"not connected"}

            {accounts ? (
                <>
                    <Heading as="h1">Bienvenue sur votre page de propriétaire</Heading>
                    <Box p="4">
                        {isOwner ? <OwnerDashboard /> : <OwnerCollectionForm /> }
                        <OwnerDashboard />  <OwnerCollectionForm/>
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
};
