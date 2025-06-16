import { Link } from "react-router-dom";
import './Mirror.css';
import { CirclesBackground } from "../small_components/CirclesBackground";
import NotiIcon from '../assets/icons/logo-mai.png';
import WeatherIcon from '../assets/icons/weather.png'

import React from 'react';

export default function Mirror() {
  return (
    <div className="MirrorView">
        <h1>Bienvenido, <span>Dittrichgod!</span></h1>
        <div className="weather-section">
            <h2 className="date">Today is: <span>Monday</span></h2>
            <h2 className="time">7:30 am</h2>
        </div>
        <div className="weather-section">
          <img src={WeatherIcon} alt="weather" />
          <h2 className="date">Today's weather is: <span>Cloudy</span></h2>
        </div>
        <div className="tip-notification">
            <div className="tip-icon"><img src={NotiIcon} alt="" /></div>
            <div className="verticalLine"></div>
            <div className="tip-texts">
                <h3 className="noti-title">You look stuning!</h3>
                <p className="noti-text">You should talk to people, that way you will let yourself highlight. </p>
            </div>
        </div>
    </div>
  )
}
