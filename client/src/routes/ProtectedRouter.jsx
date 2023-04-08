import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from '../pages/protected/ProtectedLayout';
import { Renter } from '../pages/protected/Renter';
import { Dao } from '../pages/protected/Dao';
import { EthProvider } from "../contexts/EthContext";
import { NotFound } from '../pages/NotFound';
import { ReservationPage } from '../pages/protected/ReservationPage';
import { Owner } from '../pages/protected/Owner';
import { Admin } from '../pages/protected/Admin';
import { CollectionItemForm } from '../components/OwnerDashboard/CollectionItemForm';
import { Rentals } from '../components/RentalsList';

export const ProtectedRouter = () => {
   //const rental = location.state ? location.state.rental : null;

    return (
        <EthProvider>
            <Routes>
                <Route element={<ProtectedLayout/>}>
                    <Route path="/rentals" element={<Rentals />} />
                    <Route path="/louer" element={<Owner/>} />
                    <Route path="/louer/add" element={<CollectionItemForm />} />
                    <Route path="/location" element={<Renter />} />
                    <Route path="/dao" element={<Dao />} />
                    <Route path="/reservation/:rentalID" element={<ReservationPage />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </EthProvider>
    );
};
