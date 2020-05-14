import express from 'express';
import bodyParser from 'body-parser'
const queryString = require('query-string');
var request = require('request'); // "Request" library
var rp = require('request-promise');
const fetch = require('node-fetch');
import {MongoClient} from 'mongodb';

const app = express();

class Artist{
  constructor(id, name, genres, popularity){
    this.id = id;
    this.name = name;
    this.genres = genres;
    this.popularity = popularity;
    this.genresInCommon = 0;
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


async function retrieveRelatedArtists(artistID){
  const client = await MongoClient.connect(`mongodb://localhost:27017`, {useNewUrlParser : true});
  const db = client.db('artistStorage');
  const artist = await db.collection("relatedArtists").findOne({"relatedTo": artistID});
  client.close();
  return artist;
}

async function saveRelatedArtists(artistID, artistArray){
  const client = await MongoClient.connect(`mongodb://localhost:27017`, {useNewUrlParser : true});
  const db = client.db('artistStorage');
  const artist = await db.collection('relatedArtists').insertOne({relatedTo: artistID, relatedArray : artistArray});
  client.close()
}


async function getArtistFromID(artistID, token){
 var artist;
 await fetch(`https://api.spotify.com/v1/artists/${artistID}`,{
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + token },
    })
    .then(res => res.json())
    .then(function(json){
      //console.log(json);
      artist = new Artist(artistID,json['name'], json['genres'], json['popularity']);
    })
    //.then(json => console.log(json['artists']['items'][0]['id']))
    .catch(err => console.error(err))
    return artist;
}



async function findArtist(artistName, token){
 const searchParams = {'q' : artistName, 'type' : 'artist'};

 var artist;
 await fetch(('https://api.spotify.com/v1/search?' + queryString.stringify(searchParams)), {
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + token },
    })
    .then(res => res.json())
    .then(function(json){
      //console.log(json);
      const result = json['artists']['items'][0];
      artist = new Artist(result['id'],result['name'], result['genres'], result['popularity']);
    })
    //.then(json => console.log(json['artists']['items'][0]['id']))
    .catch(err => console.error(err))
    return artist;
}

async function getRelatedArtist(artistID, token){

  const dbEntry = await retrieveRelatedArtists(artistID);

  if(dbEntry==null){
    // console.log("USING API");
    var relatedArtistsArray = [];
    await fetch(`https://api.spotify.com/v1/artists/${artistID}/related-artists`, {
           method: 'get',
           headers: { 'Authorization': 'Bearer ' + token },
       })
       .then(res => res.json())
       .then(function(json){
         const artists = json['artists'];
        //console.log(artists);
       for(var index in artists){
         const artistJSON = artists[index];
         var artist = new Artist(artistJSON['id'],artistJSON['name'], artistJSON['genres'], artistJSON['popularity']);
         relatedArtistsArray.push(artist);
        // console.log(artist);
       }


       })
       .catch(err => console.error(err))
       saveRelatedArtists(artistID, relatedArtistsArray);
       return relatedArtistsArray;
    }
    else{
      // console.log("DATABASE ENTRY");
      return dbEntry.relatedArray;
    }
}


// TODO:  change naming to related artist 1 vs artist 2

/* Takes the array of 20 related artists and returns the top <numAritsts>
determined by their amount of shared genres. */
function sortTopRelatedArtists(artist, relatedArtists, numArtists){
  console.log("sorting related artists closest to " + artist.name);




  function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
  }

  /*let N be number of genres in artists
  creates array of N empty arrays.
  Array[index] holds the artists with <index> shared genres*/
  const genres = artist.genres;
  const numGenres = artist.genres.length;

  var sortedArtists = [];

  for(var i=0; i<numGenres; i++){
    sortedArtists.push([]);
  }
  for(var index in relatedArtists){
    const related = relatedArtists[index];
    const commonGenres = intersect(genres, related.genres).length;
    related.genresInCommon = commonGenres;
    try{
      sortedArtists[commonGenres].push(related);
    }
    catch(error){
      sortedArtists[commonGenres] = [related];
    }
  }

  var returnArray = [];
  for(var i=numGenres-1; i>=0; i--){

    var subArray = sortedArtists[i];
    for(var j=0; j<subArray.length; j++){
      if(returnArray.length==numArtists){return(returnArray)};
      returnArray.push(subArray[j]);
      //console.log(subArray[j]);
    }
  }



}


app.get('/hello', function(req, res){
    console.log("HELLO");
    res.send("HELLO!")
});


app.post('/fetchArtistMap', async function(req, res){
  const numArtists = req.body.numRelated;

  const artist1 = await findArtist(req.body.artist1, req.body.token);
  const relatedArtists1 = await getRelatedArtist(artist1.id, req.body.token);

  const artist2 = await findArtist(req.body.artist2, req.body.token);
  const relatedArtists2 = await getRelatedArtist(artist2.id, req.body.token);

  const sortedRelatedArtist1 = sortTopRelatedArtists(artist2, relatedArtists1, numArtists);
  const sortedRelatedArtist2 = sortTopRelatedArtists(artist1, relatedArtists2, numArtists);
  const retJSON = {"artist1": artist1, "related1" : sortedRelatedArtist1, "artist2" : artist2, "related2": sortedRelatedArtist2};
  console.log(retJSON);
  res.send(retJSON);
});

app.post('/expandArtistMap', async function(req, res){
  const numArtists = req.body.numRelated;

  const artist1ID = req.body.artist1ID;
  const artist1 = await getArtistFromID(artist1ID, req.body.token);
  const relatedArtists1 = await getRelatedArtist(artist1ID, req.body.token);

  const artist2ID = req.body.artist2ID;
  const artist2 = await getArtistFromID(artist2ID, req.body.token);
  const relatedArtists2 = await getRelatedArtist(artist2ID, req.body.token);

  const sortedRelatedArtist1 = sortTopRelatedArtists(artist2, relatedArtists1, numArtists*2);
  const sortedRelatedArtist2 = sortTopRelatedArtists(artist1, relatedArtists2, numArtists*2);

  const retJSON = {"related1" : sortedRelatedArtist1, "related2": sortedRelatedArtist2};
  console.log(retJSON);
  res.send(retJSON);
});


app.listen(8000, ()=> console.log("listening on 8000"));
