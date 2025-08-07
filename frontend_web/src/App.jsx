import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//------ VISTA DE LANDING ------
import Landing from './view_components/Landing';
import Login from './view_components/Login'
import ResetPassword from './view_components/ResetPassword';
import Orbit from './view_components/Orbit'; 
import Mirror from './view_components/Mirror';
import Profile from './view_components/Profile';
import Countdown from './view_components/Countdown';
import QR from './view_components/QR';

// TEST ----------------------
// export default function App() {
//   return <Orbit />;
// }
// TEST ----------------------


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Orbit />}    />
        <Route path="/kaka"      element={<Landing />}  />
        <Route path="/login"     element={<Login />}    />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/Mirror"    element={<Mirror />}   />
        <Route path="/Profile"   element={<Profile />}  />
        <Route path="/Timer"     element={<Countdown />}/>
        <Route path="/QR"     element={<QR />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App
