import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeaderLanding.css';

export const HeaderLanding = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si estamos en <600px
    const mm = window.matchMedia('(max-width: 599px)');
    const handler = e => setIsMobile(e.matches);
    setIsMobile(mm.matches);
    mm.addEventListener('change', handler);
    return () => mm.removeEventListener('change', handler);
  }, []);

  return (
    <div className="header">
      {/* Logo siempre visible */}
      <a href="#1" className="logo">M.AI</a>

      {/** 
       * En modo escritorio (>=600px) mostramos directamente las secciones 
       * y el botón “Log in”, en el mismo contenedor .sections + .loginBtn
       */}
      {!isMobile && (
        <>
          <li className='headerList'>
            <div className="sections">
              <a href="#2">Functionalities</a>
              <a href="#3">How it works</a>
              <a>Team</a>
            </div>
          </li>
          <Link to="/login" className="loginBtn">
            Log in
            <div className="loginBtnCircle"></div>
          </Link>

        </>
      )}

      {/**
       * En mobile (<600px), sólo mostramos el ícono “burger”. 
       * Cuando menuOpen == true, renderizamos un menú desplegable con clase .burgerMenu 
       */}
      {isMobile && (
        <>
          <button
            className={`burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>

          {menuOpen && (
            <div className="burgerMenu">
              <a href="#2">Functionalities</a>
              <a href="#3">How it works</a>
              <a>Team</a>
              <Link to="/login" className="loginBtn">
                Log in
                <div className="loginBtnCircle"></div>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};
