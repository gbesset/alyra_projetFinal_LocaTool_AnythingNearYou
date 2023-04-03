import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRouter } from './ProtectedRouter';
import { PublicRouter } from './PublicRouter';
import { NotFound } from '../pages/NotFound';

export const AppRouter = () => {
    return (

            <Routes>
               <Route path="/*" element={<PublicRouter/>} />
               <Route path="/app/*" element={<ProtectedRouter/>}/>
               <Route path="*" element={<NotFound />} />
            </Routes>

    );
};
