import React from 'react';

function Map(){
  const token = localStorage.getItem('token');
  const artist1 = localStorage.getItem('artist1');
  const artist2 = localStorage.getItem('artist2');

  async function fetchData(){

    

  }


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
