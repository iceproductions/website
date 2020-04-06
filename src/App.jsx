import React from 'react';

import './sass/main.scss';

import Page from './pages/index';
import Header from './els/header';
import Footer from './els/footer';

function App() {
  return (<div className="App">
    
    <Header />
    <Page />
    <Footer />

  </div>
  );
}

export default App;