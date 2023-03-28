import React from 'react';
import { Outlet } from 'react-router-dom';
import {Footer } from '../components/Footer/Footer';
import { HeaderHome } from '../components/Header/HeaderHome';

import {Flex, Divider} from '@chakra-ui/react';

export const Layout = () => {
    return (
        <>
            <div className="gradient-bg-welcome">
            
                <HeaderHome/>
    
                <Flex alignItems="center" direction="column" minHeight="80vh">
                    <Outlet/>
                </Flex>
                
                <Divider />
               <Footer />
    
            </div>
        </>
    );
};
