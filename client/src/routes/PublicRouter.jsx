import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Whitepaper } from '../pages/Whitepaper';
import { Layout } from '../pages/Layout';
import { NotFound } from '../pages/NotFound';

export const PublicRouter = () => {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route index element={<Home/>} />
                <Route path="/home" element={<Home />} />
                <Route path="/whitepaper" element={<Whitepaper />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};
