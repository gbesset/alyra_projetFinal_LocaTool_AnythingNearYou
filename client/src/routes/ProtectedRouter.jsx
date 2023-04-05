import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedLayout } from '../pages/protected/ProtectedLayout';
import { Renter } from '../pages/protected/Renter';
import { Dao } from '../pages/protected/Dao';
import { EthProvider } from "../contexts/EthContext";
import { NotFound } from '../pages/NotFound';
import { ReservationPage } from '../pages/protected/ReservationPage';
import { Owner } from '../pages/protected/Owner';
import { Admin } from '../pages/protected/Admin';
import { CollectionItemForm } from '../components/OwnerDashboard/CollectionItemForm';

export const ProtectedRouter = () => {
    const location = useLocation();
    const tool = location.state ? location.state.tool : null;

    return (
        <EthProvider>
            <Routes>
                <Route element={<ProtectedLayout/>}>
                    <Route path="/louer" element={<Owner/>} />
                    <Route path="/louer/add" element={<CollectionItemForm />} />
                    <Route path="/location" element={<Renter />} />
                    <Route path="/dao" element={<Dao />} />
                    <Route path="/reservation/:tokenID" element={<ReservationPage />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </EthProvider>
    );
};
