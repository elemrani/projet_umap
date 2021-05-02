import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import{CreateLayers} from './v2/Model/CreateLayers'
import reportWebVitals from './reportWebVitals';
import{Training} from './v2/Training/Training'
import{MyRoute} from './v2/Route/MyRoute'
import {ModelsProvider} from './v2/Provider/ModelsProvider'
/*
  <React.StrictMode>
  <CreateLayers/>
  </React.StrictMode> ,

<ModelsProvider>
  <MyRoute />
  </ModelsProvider>*/
ReactDOM.render(

 
  <ModelsProvider>
  <MyRoute />
  </ModelsProvider>
 ,

  document.getElementById("data-myd3")
); 




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
