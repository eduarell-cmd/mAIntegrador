import React from 'react';
import './Ready.css';
import iphoneImg from '../assets/images/mobile-notch.png';
import { Link } from 'react-router-dom';

export const Ready = () => {
  return (
    <div className='ReadySection'>
        <div className="purple-container">
            <div className="phone">
                <img src={iphoneImg} alt="iphone-divein" />
            </div>

            <div className="ready-texts">
                <h2><span><b>Ready?</b></span> Get started with <br /> M.AI and get and awesome <br />experience.</h2>
                <p>Start to get you know better in front of your mirror, <br /> and never let your feelings and body down. <br />Let's dive in!</p>
                <Link to="/login" className="btn-primary"><b>Start</b></Link>
                
            </div>
        </div>
    </div>
  )
}
