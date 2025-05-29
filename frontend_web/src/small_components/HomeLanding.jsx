import React from 'react'
import './HomeLanding.css'
import girlImg from '../assets/images/final-girl-grid-endpoint.png';
import NextButton from './next_button';

export const HomeLanding = () => {
  return (
    <div className='HomeLanding'>
        <div className="div1"><h1 className="FandM"><b>Face <span className='and-landing'>&</span> Emotions</b></h1><h1 className='R'><b>Reco<span className='g'>g</span>nition</b></h1></div>
        <div className="div2"><h2>Scan result:</h2><p>You look confident today!</p></div>
        <div className="div3"><img src={girlImg} alt="girl" className="girlImage" /></div>
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
  )
}
