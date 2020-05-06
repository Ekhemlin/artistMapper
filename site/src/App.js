import * as ReactDOM from 'react-dom';
import React from 'react';
import HomePage from './pages/homepage';
import Callback from './pages/callback';
import Map from './pages/map';
import Graph from './pages/graph';





import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import './App.css';

function App() {
  return (
    <Router>
    <div className="App" >
    <Route path = "/" component = {HomePage} exact />
    <Route path = "/callback" component = {Callback} />
    <Route path = "/map" component = {Map} />
    <Route path = "/graph" component={Graph} />
    </div>
    </Router>
  );
}

export default App;
