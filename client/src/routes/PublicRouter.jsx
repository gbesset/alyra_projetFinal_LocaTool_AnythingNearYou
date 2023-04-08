import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Layout } from '../pages/Layout';
import { NotFound } from '../pages/NotFound';
import { CGU } from '../pages/cgu';
import { Whitepaper } from '../pages/Whitepaper';

export const PublicRouter = () => {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route index element={<Home/>} />
                <Route path="/home" element={<Home />} />
                <Route path="/cgu" element={<CGU />} />
                <Route path="/whitepaper" element={<Whitepaper />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};
