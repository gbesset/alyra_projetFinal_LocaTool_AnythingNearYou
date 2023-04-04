import React, { useEffect, useState } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,  Flex, Text, Button } from '@chakra-ui/react';
import { Authent } from '../../components/Authent/Authent';
import { OwnerDashboard } from '../../components/OwnerDashboard';
import { OwnerCollectionForm } from '../../components/OwnerCollectionForm/OwnerCollectionForm';
import { actions } from "../../contexts/EthContext/state";

export const Owner = () => {
    const { state: { contract, accounts, artifact, isOwner},dispatch } = useEth();

    const refreshStatus = async () => {
        try{
   
            let test = await contract.methods.isAddressOwner(accounts[0]).call({ from: accounts[0] });
        }
        catch(error){
            console.log(error)
            //toastError("Problem to retrieve workflow status")
        }
    }
    useEffect( () =>{    
        async function getWorkflowStatus() {
            if (contract && contract?.methods) {
               refreshStatus()
            }
        }
      
        async function retrieveProposalRegisteredEvent(){
            if(contract){
              contract.events.NFTCollectionCreated({fromBlock:"earliest"})
              .on('data', event => {
                dispatch({ type: actions.setIsOwner, data: true });
                //ICI JE VEUX METTRE A JOUR MON EthProvider => isOwner
               
                })          
            }
        }
        retrieveProposalRegisteredEvent();
   
        getWorkflowStatus();
    }, [accounts, contract, artifact]);

    return (
        <Box>
            {Math.random()}<br/>
            {accounts ? accounts[0]:"not connected"}
            {isOwner ? "tue s owner !" :"tu n'es pas owner"}
            {accounts ? (
                <>
                    <Heading as="h1">Bienvenue sur votre page de propriétaire</Heading>
                    <Box p="4">
                        {isOwner ? <OwnerDashboard /> : <OwnerCollectionForm /> }
                       
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
