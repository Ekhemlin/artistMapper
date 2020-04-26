import express from 'express';
import bodyParser from 'body-parser'
const queryString = require('query-string');
var request = require('request'); // "Request" library
var rp = require('request-promise');
const fetch = require('node-fetch');

const app = express();

class Artist{
  constructor(id, name, genres, popularity){
    this.id = id;
    this.name = name;
    this.genres = genres;
    this.popularity = popularity;
  }
}




app.use(bodyParser.json())


async function findArtist(artistName, token){
 const searchParams = {'q' : artistName, 'type' : 'artist'};

 var artist;
 await fetch(('https://api.spotify.com/v1/search?' + queryString.stringify(searchParams)), {
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + token },
    })
    .then(res => res.json())
    .then(function(json){
      const result = json['artists']['items'][0];
      artist = new Artist(result['id'],result['name'], result['genres'], result['popularity']);
    })
    //.then(json => console.log(json['artists']['items'][0]['id']))
    .catch(err => console.error(err))
    return artist;
}

async function getRelatedArtist(artistID, token){
  var retJSON;
  await fetch(`https://api.spotify.com/v1/artists/${artistID}/related-artists`, {
         method: 'get',
         headers: { 'Authorization': 'Bearer ' + token },
     })
     .then(res => res.json())
     .then(function(json){
       console.log(json['artists']);
       retJSON = json['artists'];
     })
     //.then(json => console.log(json['artists']['items'][0]['id']))
     .catch(err => console.error(err))
     return retJSON;
}



app.get('/hello', (req, res) => res.send('Hello!'));


app.post('/fetchArtistMap', async function(req, res){
  const artist1 = await findArtist(req.body.artist1, req.body.token);
  const relatedArtist1 = await getRelatedArtist(artist1.id, req.body.token);

  const artist2 = await findArtist(req.body.artist2, req.body.token);
  const relatedArtist2 = await getRelatedArtist(artist2.id, req.body.token);

  console.log(JSON.stringify(artist2));


  res.send({"artist1ID" : artist1.id,
    "artist2ID" : artist1.name});
});






app.listen(8000, ()=> console.log("listening on 8000"));
