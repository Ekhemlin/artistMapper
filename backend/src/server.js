import express from 'express';
import bodyParser from 'body-parser'
const queryString = require('query-string');
var request = require('request'); // "Request" library
var rp = require('request-promise');
const fetch = require('node-fetch');

const app = express();





app.use(bodyParser.json())


async function getArtistID(artistName, token){
 const searchParams = {'q' : artistName, 'type' : 'artist'};

 var retJSON;
 await fetch(('https://api.spotify.com/v1/search?' + queryString.stringify(searchParams)), {
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + token },
    })

    .then(res => res.json())
    .then(function(json){
      console.log(json['artists']['items'][0]['id']);
      retJSON = json['artists']['items'][0]['id'];
    })

    //.then(json => console.log(json['artists']['items'][0]['id']))
    .catch(err => console.error(err))
    return retJSON;
}

async function getRelatedArtist(artistID, token){
}







app.get('/hello', (req, res) => res.send('Hello!'));


app.post('/fetchArtistMap', async function(req, res){
  const artist1ID = await getArtistID(req.body.artist1, req.body.token);
  console.log(artist1ID);
  const artist2ID = await getArtistID(req.body.artist2, req.body.token);
  console.log(artist2ID);

  res.send({"artist1ID" : artist1ID,
    "artist2ID" : artist2ID});
});






app.listen(8000, ()=> console.log("listening on 8000"));
