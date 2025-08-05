import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Mirror.css';
import { CirclesBackground } from "../small_components/CirclesBackground";
import NotiIcon from '../assets/icons/logo-mai.png';
import WeatherIcon from '../assets/icons/weather.png';
import Happy from '../assets/images/happy.png';
import Sad from '../assets/images/sad-face.png';
import Neutral from '../assets/images/neutral.png';
import Fear from '../assets/images/fear.png';
import Surprised from '../assets/images/surprised.png';
import Angry from '../assets/images/angry.png';
import Disgust from '../assets/images/disgust.png';

const emotionImages = {
  angry: Angry,
  disgust: Disgust,
  fear: Fear,
  happy: Happy,
  sad: Sad,
  surprise: Surprised,
  neutral: Neutral,
};

export default function Mirror() {
  const [dia, setDia] = useState("Loading...");
  const [hora, setHora] = useState("");
  const [temperatura, setTemperatura] = useState(null);
  const [clima, setClima] = useState("Loading...");
  const [emocion, setEmocion] = useState(null); // Keep as null initially
  const [consejo, setConsejo] = useState(null); // Keep as null initially
  const [emocionFoto, setEmocionFoto] = useState(null);
  const [nombre, setNombre] = useState(null);

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
    const userData = JSON.parse(localStorage.getItem("user")); // Tu objeto del localStorage

    if (!userData) {
      alert("❌ No hay datos del usuario en localStorage.");
      return;
    }

    // 1. Llamar a Gemini para obtener el consejo
    const res = await fetch("http://localhost:8000/geminiprompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`❌ ${error.detail}`);
      setNombre(null);
      setEmocionFoto(null);
      setEmocion(null);
      setConsejo(null);
      return;
    }

    const data = await res.json();
    console.log("Respuesta de Gemini:", data);

    setNombre(data.nombre);
    setEmocionFoto(data.emocion_foto);
    setEmocion(data.emocion);
    setConsejo(data.consejo);

    // 2. Guardar el consejo en la base de datos
    if (data.consejo) {
      await fetch("http://localhost:8000/guardar_consejo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData._id,
          emocion_foto: data.emocion_foto,
          emocion: data.emocion,
          consejo: data.consejo,
        }),
      });
    }

  } catch (err) {
    console.error("Error al conectar con Gemini:", err);
    alert("❌ Error al conectar con el servidor.");
    setNombre(null);
    setEmocionFoto(null);
    setEmocion(null);
    setConsejo(null);
  }
};

  return (
    <div className="MirrorView">
      <CirclesBackground />

      <h1>Welcome, <span>{nombre ? `${nombre}!` : `...!`}</span></h1>

      <div className="weather-section">
        <h2 className="date">Today is: <span>{dia}</span></h2>
        <h2 className="time">{hora}</h2>
      </div>

      <div className="weather-section">
        <img src={WeatherIcon} alt="weather" />
        <h2 className="date">Today's weather is: <span>{clima} ({temperatura}°C)</span></h2>
      </div>

      <div className="tip-notification">
        <div className="tip-icon">
          {emocionFoto ? (
            <img src={emotionImages[emocionFoto]} alt={emocionFoto} />
          ) : (
            <img src={NotiIcon} alt="default icon" />
          )}
        </div>
        <div className="verticalLine"></div>
        <div className="tip-texts">
          <h3 className="noti-title">
            {emocion ? `You look ${emocion}!` : `No emotion detected!`}
          </h3>
          <p className="noti-text">
            {consejo ? consejo : "Please press the button located in your app to analyze your face and receive a personalized tip!"}
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