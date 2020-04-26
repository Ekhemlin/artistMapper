import React, {useState} from 'react';

var querystring = require('querystring');

function Callback(){


  const [artist1, setArtist1] = useState('');
  const [artist2, setArtist2] = useState('');


  //optimize
  const urlString = String(window.location);
  const queryParams = urlString.split("#")[1];
  const firstParam = queryParams.split("&")[0];
  const token = firstParam.split("=")[1];
  //end

  function submit(){
    localStorage.setItem('token', token);
    localStorage.setItem('artist1', artist1);
    localStorage.setItem('artist2', artist2);
    window.location = '/map'
  }



  return(
    <div>
    <label>
      Artist1:
      <input type = "First artist" value = {artist1} onChange={(event) => setArtist1(event.target.value)}/>
    </label>
    <label>
      Artist2:
      <input type = "Second artist" value = {artist2} onChange={(event) => setArtist2(event.target.value)}/>
    </label>
    <button onClick={() => submit()}>Submit artists</button>
    </div>
  );
}

export default Callback;
