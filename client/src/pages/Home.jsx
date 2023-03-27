import React from 'react';
import { useNavigate } from "react-router-dom";
import { Hero } from '../components/LandingPage/Hero';
import { Service } from '../components/LandingPage/Service';


export const Home = () => {

    const navigate = useNavigate();
    
    function routeChange(){ 
      let path = '/protected/voter'; 
      navigate(path);
    }

    return (
        <>
        <Hero/>

        <Service/>

        <br/>
      </>
    );
};
