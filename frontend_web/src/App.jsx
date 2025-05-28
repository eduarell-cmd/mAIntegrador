import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//------ VISTA DE LANDING ------
import Landing from './view_components/Landing';
import Login from './view_components/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<Landing />} />
        <Route path="/login" element={<Login />}   />
      </Routes>
    </BrowserRouter>
  );
}

export default App
