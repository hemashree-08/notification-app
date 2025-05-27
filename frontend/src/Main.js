import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
