# Artist Mapper

This project is a full-stack web app written entirely in Javascript, using Node.js, Express, and MongoDB for the backend, and React for the frontend. The site uses the Spotify API to allow users to explore the connections between musicians using their related artists.  

After the initial artist search, the web app displays each musician's top 5 related artists, in addition to the number of genres they each have in common. The data is displayed in an interactive map created using Uber's open source [react-digraph](https://github.com/uber/react-digraph) component. 

![Alt Text](https://thumbs.gfycat.com/ElatedEmotionalEelelephant-size_restricted.gif)

The user is then able to continuously expand the dynamic map by exploring the connections of any of the related artists. 

![Alt Text](https://thumbs.gfycat.com/GlassCluelessBorer-size_restricted.gif)_ 

Artists are cached in a MongoDB database for faster response. The project is currently hosted on an AWS's EC2 server. 

## Future plans for improvement:

 - Transfer the backend entirely to AWS Lambda and API Gateway.  
 - Determine artist similarity based on more data from Spotify's API, such as audio analysis of their top tracks. 
 - Find an efficient way to cache musician connections in the database, in addition to their basic artist data.  

