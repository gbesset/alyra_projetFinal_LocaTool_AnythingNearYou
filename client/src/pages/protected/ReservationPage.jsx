import { useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';

export const ReservationPage = () => {
   const location = useLocation();
   const { rental } = location?.state;
  
  return (
    <div className="text-white">
        {rental ? (<>
                <h1>Réserver l'outil {rental.tokenID}</h1>
                <div>
                <h1>Réserver</h1>
                <p>Titre : {rental.title}</p>
                <p>Description : {rental.description}</p>
                <p>Token ID : {rental.tokenID}</p>
                <p>dayPrice : {rental.dayPrice}</p>
                <p>caution : {rental.caution}</p>
                <p>url : {rental.tokenImgURI}</p>
                
                </div>
      </>
   
        ) : "aucun outils selectionné " }
    </div>
  );
}
