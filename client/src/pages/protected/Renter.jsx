import React, { useEffect } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box, Text} from '@chakra-ui/react';
import { Authent } from '../../components/Authent/Authent';

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
      
   
        getWorkflowStatus();
    }, [accounts, contract, artifact]);

    return (
        <Box>
           {accounts ? (
                <> <Heading as="h1">Mes locations</Heading>
                  
                  <Text className="text-white" pl="3rem" pt="1rem">
                   En constuction....
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
