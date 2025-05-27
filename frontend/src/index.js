// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Load environment variables
if (process.env.NODE_ENV === 'development') {
  console.log('Development environment');
  console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
  console.log('NGROK Backend URL:', process.env.REACT_APP_BACKEND_URL_NGROK);
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);