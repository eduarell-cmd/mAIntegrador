import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Mirror.css';
import { CirclesBackground } from "../small_components/CirclesBackground";
import NotiIcon from '../assets/icons/logo-mai.png';
import WeatherIcon from '../assets/icons/weather.png';

export default function Mirror() {
  const [dia, setDia] = useState("Loading...");
  const [hora, setHora] = useState("");
  const [temperatura, setTemperatura] = useState(null);
  const [clima, setClima] = useState("Loading...");
  const [emocion, setEmocion] = useState(null); // Keep as null initially
  const [consejo, setConsejo] = useState(null); // Keep as null initially

  // Obtener el día del backend
  useEffect(() => {
    fetch("http://localhost:8000/mirror")
      .then(res => res.json())
      .then(data => setDia(data.dia))
      .catch(err => console.error(err));
  }, []);

  // Actualizar hora local cada segundo
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

  // Obtener clima desde backend
  useEffect(() => {
    console.log("Fetch al Clima")
    fetch("http://localhost:8000/weather")
      .then(res => res.json())
      .then(data => {
        setTemperatura(data.temperature);
        setClima(data.condition);
      })
      .catch(err => console.error("Error al obtener clima:", err));
  }, []);

  // Modificada la función handleVerificarRostroSubmit
const handleVerificarRostroSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:8000/geminiprompt");

    if (!res.ok) {
      const error = await res.json();
      alert(`❌ ${error.detail}`);
      setEmocion(null);
      setConsejo(null);
      return;
    }

    const data = await res.json();
    console.log("Respuesta de Gemini:", data);

    // Puedes mostrar emoción si backend la devuelve también
    if (data.consejo?.error) {
      alert(`❌ ${data.consejo.error}`);
      setConsejo(null);
      setEmocion(null);
      return;
    }
    
    const emocionDetectada = data.consejo?.emocion || "emocion detectada";
    setEmocion(emocionDetectada);
    setConsejo(data.consejo?.consejo);

  } catch (err) {
    console.error("Error al conectar con Gemini:", err);
    alert("❌ Error al conectar con el servidor.");
    setEmocion(null);
    setConsejo(null);
  }
};

  return (
    <div className="MirrorView">
      <CirclesBackground />

      <h1>Bienvenido, <span>DittrichDog!</span></h1>

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
          <h3 className="noti-title">
            {emocion ? `You look ${emocion}!` : `No emotion detected!`}
          </h3>
          <p className="noti-text">
            {consejo ? consejo : "You should talk to people, that way you will let yourself highlight."}
          </p>
        </div>
      </div>

      <form onSubmit={handleVerificarRostroSubmit}>
        <button type="submit" className="btn-send">
          Verificar rostro ahora
        </button>
      </form>
    </div>
  );
}