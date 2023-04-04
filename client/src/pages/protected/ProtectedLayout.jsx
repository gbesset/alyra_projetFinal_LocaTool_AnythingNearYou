import React from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../../components/Footer/Footer';
import { HeaderApp } from '../../components/Header/HeaderApp';
import {Flex, Divider, Box } from "@chakra-ui/react"
export const ProtectedLayout = () => {
    return (
        <>
        <div className="gradient-bg-welcome">
        
            <HeaderApp/>

            <Flex alignItems="center"  className="text-white" direction="column" minHeight="80vh">
                <Box className="hero">
                    <Outlet/>
                </Box>
            </Flex>
            
            <Divider />
           <Footer />

        </div>
    </>

    );
};
