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
  const [consejo, setConsejo] = useState("Please press the button located in your app to analyze your face...");
  const [emocionFoto, setEmocionFoto] = useState(null);
  const [nombre, setNombre] = useState(null);
  const [viewMode, setViewMode] = useState('idle');
  const [countdown, setCountdown] = useState(3);

  // Obtener el día del backend
  useEffect(() => {
    fetch("http://localhost:8000/mirror")
      .then(res => res.json())
      .then(data => setDia(data.dia))
      .catch(err => console.error(err));
  }, []);

    useEffect(() => {
    // Reemplaza localhost con la IP de tu servidor si es necesario
    const socket = new WebSocket("ws://localhost:8000/ws/mirror");

    // Función que se ejecuta cuando el servidor envía un mensaje
    socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("Mensaje recibido:", message);

    // Usa un switch para manejar los diferentes tipos de mensajes
    switch (message.status) {
      case 'starting_analysis':
        setViewMode('countdown');
        break;
      case 'analysis_complete':
        const data = message.data;
        setNombre(data.nombre);
        setEmocion(data.emocion);
        setConsejo(data.consejo);
        setEmocionFoto(data.emocion_foto);
        setViewMode('result'); // Cambia a la vista de resultados
        break;
      default:
        console.log("Mensaje desconocido recibido");
    }
  };

    // Función que se ejecuta cuando la conexión se abre
    socket.onopen = () => {
      console.log("Conexión WebSocket establecida con el espejo.");
    };
    
    // Función de limpieza para cerrar la conexión cuando el componente se desmonte
    return () => {
      console.log("Cerrando conexión WebSocket.");
      socket.close();
    };
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  useEffect(() => {
  // Si el modo no es 'countdown', no hagas nada.
  if (viewMode !== 'countdown') return;

  // Reinicia el contador a 3 cada vez que empieza.
  setCountdown(3); 
  
  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(timer); // Detiene el intervalo cuando llega a 1
        return 0; // Opcional, para mostrar "Analizando..."
      }
      return prev - 1;
    });
  }, 1000); // Se ejecuta cada segundo

  // Función de limpieza para evitar problemas de memoria
  return () => clearInterval(timer);
}, [viewMode]);

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
            {emocion ? `You look ${emocion}!` : `No vinculated account!`}
          </h3>
          <p className="noti-text">
            {consejo ? consejo : "Please press the button located in your app to analyze your face and receive a personalized tip!"}
          </p>
        </div>
      </div>
    </div>
  );
}