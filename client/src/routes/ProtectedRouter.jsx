import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from '../pages/protected/ProtectedLayout';
import { Location } from '../pages/protected/location';
import { Dao } from '../pages/protected/Dao';
import { EthProvider } from "../contexts/EthContext";
import { NotFound } from '../pages/NotFound';

export const ProtectedRouter = () => {
    return (
        <EthProvider>
            <Routes>
                <Route element={<ProtectedLayout/>}>
                    <Route path="/location" element={<Location />} />
                    <Route path="/dao" element={<Dao />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </EthProvider>
    );
};
