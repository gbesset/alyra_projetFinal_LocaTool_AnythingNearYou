import React, { useEffect, useState } from 'react';
import { Button } from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom';

export const Account = ({accounts, isOwner}) => {
    
    const [user, setUser] = useState('');
    
    useEffect(()=>{
        if(accounts){
            let u = accounts[0].substring(0,5)+"..."+accounts[0].substring(accounts[0].length-4,accounts[0].length);
            setUser(u);
        }
        else{
            setUser("not connected");
        }
    },[accounts]);

    
    return (
        <div>
            { isOwner===true ?(
                <>
              
                    <Button leftIcon={<SettingsIcon />} as={Link} to="/app/admin" colorScheme='whiteAlpha' variant='solid'>
                     {user}
                    </Button>

           
                </>
            ) : user!== "not connected" ? (
                 <Button width="8rem">    
                         {user}
                </Button>
            ) : (
                 <Button width="8rem" isDisabled={true}>    
                         {user}
                </Button>
            )}
           
        </div>
    );
};
