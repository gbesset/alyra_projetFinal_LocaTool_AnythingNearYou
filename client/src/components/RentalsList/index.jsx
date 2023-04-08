import React, { useEffect, useState } from 'react';
import { useEth } from '../../contexts/EthContext';
import { Heading, Box,   Text, } from '@chakra-ui/react';
import { Authent } from '../../components/Authent/Authent';
import { RentalList } from './RentalsList';

export const Rentals = () => {
    const { state: { contract, accounts, web3, txhash } } = useEth();

    const [rentals, setRentals] = useState('')

    
    useEffect( () =>{   
        async function retrieveRentalsEventsData(){
            if(contract){
                const deployTx = await web3.eth.getTransaction(txhash)
                //retrieve all past events
                const rentalsAdded = await contract.getPastEvents("ToolAddedToRentals", {fromBlock:deployTx.blockNumber , toBlock:"latest"});

                //retrieve all past events IDs
                const rentals = rentalsAdded.map(
                    (event)=>{
                        const { renter, rentalID, tokenID, title, description, tokenImgURI, dayPrice, caution, timestamp } = event.returnValues;
                        return { renter, rentalID, tokenID, title, description, tokenImgURI, dayPrice, caution, timestamp };
                        //event.returnValues.toolID
                      })

                setRentals([...rentals]);            
            }
        }

        retrieveRentalsEventsData();
    }, [accounts, contract]);
   
    return (
        <>
        <Box >

            {accounts ? (
                <>      <Heading as="h3">Annonces publiées</Heading>
                        { (rentals && rentals.length)  ?  (            
                            <RentalList rentals={rentals} />
                        ):
                        (
                        <Text>Aucune n'annonce n'a encore été publiée..... :(</Text>
                        )}
                </>
            ) : (
                <>
                <Authent />
                </>
            )
            }
            
        </Box>
        </>
    );
};
