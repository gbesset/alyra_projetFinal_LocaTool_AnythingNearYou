
import { useState } from "react";



  const [dayPrice, setDayPrice] = useState("");
  const [caution, setCaution] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Send form data to the server
    console.log({ dayPrice, caution, image });
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  return (
    <>
      <div>
        <label htmlFor="dayPrice">Day Price</label>
        <input
          type="number"
          id="dayPrice"
          value={dayPrice}
          onChange={(event) => setDayPrice(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="caption">Caption</label>
        <input
          type="text"
          id="caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="image">Image</label>
        <input type="file" id="image" onChange={handleImageChange} />
      </div>
      <button type="submit" onClick={handleSubmit}>Générer Annonce</button>
      </>
  );
}
