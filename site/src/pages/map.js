import React from 'react';
const queryString = require('query-string');

function Map(){
  const token = localStorage.getItem('token');
  const artist1 = localStorage.getItem('artist1');
  const artist2 = localStorage.getItem('artist2');

  const fetchData = async (artist1, artist2, token) => {
    const result = await fetch('/fetchArtistMap', {
      method: 'post',
      body: JSON.stringify({"artist1": artist1, "artist2" : artist2, "token" : token, "numRelated" : 5}),
      headers: {
        'Content-Type' : 'application/json'
      }
    });
    const body = await result.json();
  };


fetchData(artist1,artist2,token);

return(
  <div>
  <h1> Map </h1>
  <p>{token}</p>
  <p>{artist1}</p>
  <p>{artist2}</p>
  </div>
);
}

export default Map;
