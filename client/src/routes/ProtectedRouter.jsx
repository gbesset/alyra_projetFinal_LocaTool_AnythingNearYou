import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from '../pages/protected/ProtectedLayout';
import { Owner } from '../pages/protected/Owner';
import { Renter } from '../pages/protected/Renter';
import { Dao } from '../pages/protected/Dao';
import { EthProvider } from "../contexts/EthContext";
import { NotFound } from '../pages/NotFound';

export const ProtectedRouter = () => {
    return (
        <EthProvider>
            <Routes>
                <Route element={<ProtectedLayout/>}>
                    <Route path="/louer" element={<Owner />} /> 
                    <Route path="/location" element={<Renter />} />
                    <Route path="/dao" element={<Dao />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </EthProvider>
    );
};
