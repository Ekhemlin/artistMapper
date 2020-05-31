import React from 'react';
var querystring = require('querystring');

function HomePage(){

  async function login(){
    var client_id = '2be7fd88da5d44ff818556c6d53a62a0'; // Your client id
    var redirect_uri = 'http://ec2-100-26-121-105.compute-1.amazonaws.com/callback'; // Your redirect uri

    const authAPI = `https://accounts.spotify.com/authorize?` + querystring.stringify({
          client_id: client_id,
          response_type: 'token',
          redirect_uri: redirect_uri,
        });

    window.location = authAPI;
    // Default options are marked with *
  }


return(
  <div>
  <h1> Please log into spotify below </h1>
  <button onClick={() => login()}> Authenticate</button>
  </div>
);
}

export default HomePage;
