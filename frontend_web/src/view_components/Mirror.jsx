import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Mirror.css';
import { CirclesBackground } from "../small_components/CirclesBackground";
import NotiIcon from '../assets/icons/logo-mai.png';
import WeatherIcon from '../assets/icons/weather.png'

export default function Mirror() {
  const [dia, setDia] = useState("Loading...");
  const [hora, setHora] = useState("");
  const [temperatura, setTemperatura] = useState(null);
  const [clima, setClima] = useState("Loading...");

  // Obtener el día del backend
  useEffect(() => {
    fetch("http://localhost:8000/mirror")
      .then(res => res.json())
      .then(data => setDia(data.dia))
      .catch(err => console.error(err));
  }, []);

  // Actualizar la hora local cada segundo
  useEffect(() => {
    const updateLocalTime = () => {
      const now = new Date();
      const options = { hour: 'numeric', minute: 'numeric', hour12: true };
      setHora(now.toLocaleTimeString('en-US', options).toLowerCase());
    };

    updateLocalTime();
    const timer = setInterval(updateLocalTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Obtener clima desde el backend FastAPI
  useEffect(() => {
    fetch("http://localhost:8000/weather")
      .then(res => res.json())
      .then(data => {
        setTemperatura(data.temperature);
        setClima(data.condition);
      })
      .catch(err => console.error("Error al obtener clima:", err));
  }, []);

  return (
    <div className="MirrorView">
        <h1>Bienvenido, <span>Dittrichgod!</span></h1>
        <div className="weather-section">
            <h2 className="date">Today is: <span>{dia}</span></h2>
            <h2 className="time">{hora}</h2>
        </div>
        <div className="weather-section">
          <img src={WeatherIcon} alt="weather" />
          <h2 className="date">Today's weather is: <span>{clima} ({temperatura}°C)</span></h2>
        </div>
        <div className="tip-notification">
            <div className="tip-icon"><img src={NotiIcon} alt="" /></div>
            <div className="verticalLine"></div>
            <div className="tip-texts">
                <h3 className="noti-title">You look stunning!</h3>
                <p className="noti-text">You should talk to people, that way you will let yourself highlight.</p>
            </div>
        </div>
    </div>
  )
}
