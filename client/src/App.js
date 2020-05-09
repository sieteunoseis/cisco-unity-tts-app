import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import FormPage from './components/FormPage';
import Carousel from './components/Carousel';
import Footer from './components/Footer';
import './index.css';

class App extends Component {
  
  render() {
    return (
        <div className="flexible-content m-2">
          <Helmet>
            <title>Automate.Builders</title>
          </Helmet>
          <Carousel />
          <FormPage />
          <Footer />
        </div>
    );
  }
}

export default App;
