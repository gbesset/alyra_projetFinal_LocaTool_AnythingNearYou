import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';

export const ReservationPage = () => {
   const location = useLocation();
   const { tool } = location?.state;
  
  return (
    <div className="text-white">
        {tool ? (<>
                <h1>Réserver l'outil {tool.tokenID}</h1>
                <div>
                <h1>Réserver</h1>
                <p>Titre : {tool.title}</p>
                <p>Description : {tool.description}</p>
                <p>Token ID : {tool.tokenID}</p>
                
                </div>
      </>
   
        ) : "aucun outils selectionné " }
    </div>
  );
}
