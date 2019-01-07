import React from 'react';
import Page from './Page';
import Header from './Header';
import './index.css';

class App extends React.Component{
  render(){
    return (

      <div>
        <Header />
        <Page />
      </div>
    );
  }
}

export default App;
