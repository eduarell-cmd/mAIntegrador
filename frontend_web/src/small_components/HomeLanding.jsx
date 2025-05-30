import React, { useState, useEffect } from 'react';
import './HomeLanding.css';
import girlImg from '../assets/images/final-girl-grid-endpoint.png';
import girlImgMedia from '../assets/images/grid-landing-girl.png'
import NextButton from './next_button';

export const HomeLanding = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mm = window.matchMedia('(min-width: 600px) and (max-width: 1023px)');
    const handler = e => setIsTablet(e.matches);
    // Initialize
    setIsTablet(mm.matches);
    // Listen for changes
    mm.addEventListener('change', handler);
    return () => mm.removeEventListener('change', handler);
  }, []);

  // Elements for div2 and div3
  const elementDiv2 = (
    <div className="div2">
      <h2>Scan result:</h2>
      <p>You look confident today!</p>
    </div>
  );

  const elementDiv3 = (
    <div className="div3">
      <img src={girlImg} alt="girl" className="girlImage" />
    </div>
  );

  return (
    <div className='HomeLanding'>
      <div className="div1">
        <h1 className="FandM">
          <b>Face <span className='and-landing'>&</span> Emotions</b>
        </h1>
        <h1 className='R'>
          <b>Reco<span className='g'>g</span>nition</b>
        </h1>
      </div>

      {isTablet ? (
        <div className="tablet-wrapper">
          {elementDiv2}
          {elementDiv3}
        </div>
      ) : (
        <>
          {elementDiv2}
          {elementDiv3}
        </>
      )}

      <div className="div4">
        <div className="avatars">
          <div className="avatar av1"></div>
          <div className="avatar av2"></div>
          <div className="avatar av3"></div>
          <div className="avatar av4"></div>
          <div className="avatar av5"></div>
        </div>
        <p>Welcome, Sabrina!</p>
      </div>

      <div className="buttonPosition">
        <NextButton />
      </div>
    </div>
  );
};
