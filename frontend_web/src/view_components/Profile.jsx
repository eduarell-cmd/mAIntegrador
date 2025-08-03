import React, { useEffect, useState } from 'react'

import './Profile.css'
import { CirclesBackground } from '../small_components/CirclesBackground';
import settingsIcon from '../assets/icons/settings.png';
import PAvatar from '../assets/images/avatar2.png';
import DownArrow from '../assets/icons/downArrow.png';
import Happy from '../assets/images/happy.png';
import Sad from '../assets/images/sad-face.png';
import Neutral from '../assets/images/neutral.png';
import Fear from '../assets/images/fear.png';
import Surprised from '../assets/images/surprised.png';
import Angry from '../assets/images/angry.png';
import Disgust from '../assets/images/disgust.png';

const emocionesInfo = {
  angry: {
    nombre: "Angry",
    mensaje: "You showed some anger today. Try to relax and take care of yourself.",
    imagen: Angry
  },
  disgust: {
    nombre: "Disgust",
    mensaje: "You felt a bit uncomfortable today. It's okay to notice what bothers you.",
    imagen: Disgust
  },
  fear: {
    nombre: "Fear",
    mensaje: "You seemed a bit worried today. Remember, it's normal to feel this way sometimes.",
    imagen: Fear
  },
  happy: {
    nombre: "Happy",
    mensaje: "You looked happy today! Enjoy these positive moments.",
    imagen: Happy
  },
  sad: {
    nombre: "Sad",
    mensaje: "You felt a bit down today. Take time for yourself and reach out if you need support.",
    imagen: Sad
  },
  surprise: {
    nombre: "Surprised",
    mensaje: "You experienced some surprises today. Life is full of unexpected moments.",
    imagen: Surprised
  },
  neutral: {
    nombre: "Neutral",
    mensaje: "Your mood was calm and balanced today.",
    imagen: Neutral
  }
};


export default function Profile() {
  const [trackerDias, setTrackerDias] = useState(Array(31).fill(false));

  const [weeklyEmotions, setWeeklyEmotions] = useState(Array(7).fill(null));

  // Estado para el promedio acumulado de emociones
  const [emocionesAcumuladas, setEmocionesAcumuladas] = useState({
    angry: 0,
    disgust: 0,
    fear: 0,
    happy: 0,
    sad: 0,
    surprise: 0,
    neutral: 0,
  });

  // Emoción dominante actual
  const [dominante, setDominante] = useState("");

  // Obtener promedio desde el backend
  const obtenerPromedio = async () => {
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData)._id : null;
      if (!userId) throw new Error('No se encontró el user_id en localStorage');

      const res = await fetch(`http://127.0.0.1:8000/promedioemocion/${userId}`);
      if (!res.ok) throw new Error("Error en la API");
      const data = await res.json();

      if (data.promedio) {
        setEmocionesAcumuladas(data.promedio);

        const emociones = data.promedio;
        const dominante = Object.keys(emociones).reduce((a, b) => emociones[a] > emociones[b] ? a : b);

        setDominante(dominante);

      }
    } catch (err) {
      console.error("Error obteniendo promedio:", err);
    }
  };
  // Función para calcular la edad a partir de la fecha de nacimiento (YYYY-MM-DD)
  function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return `${edad} years old`;
}
  // Analizar emoción (guarda nueva lectura y luego obtiene promedio actualizado)
  const obtenerEmociones = async () => {
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData)._id : null;
      if (!userId) throw new Error('No se encontró el user_id en localStorage');

      const res = await fetch("http://127.0.0.1:8000/pruebaemocion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      if (!res.ok) throw new Error("Error en la API");

      const data = await res.json();
      console.log("Datos emociones guardados:", data);

      setDominante(data.emocion_dominante);

      // Actualizar promedio después de guardar
      await obtenerPromedio();
      await obtenerTracker();
      await obtenerSemanales();
    } catch (err) {
      console.error("Error obteniendo emociones:", err);
    }
  };

  const obtenerTracker = async () => {
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData)._id : null;
      if (!userId) throw new Error('No se encontró user_id');

      const res = await fetch(`http://127.0.0.1:8000/tracker/${userId}`);
      const data = await res.json();

      if (data.dias) {
        setTrackerDias(data.dias);
      }
    } catch (err) {
      console.error("Error obteniendo tracker:", err);
    }
  };

  const obtenerSemanales = async () => {
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData)._id : null;
      if (!userId) throw new Error('No user_id found');

      const res = await fetch(`http://127.0.0.1:8000/weekly_emotions/${userId}`);
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      setWeeklyEmotions(data.weekly_emotions || []);
    } catch (err) {
      console.error("Error obteniendo emociones semanales:", err);
    }
  };

  // Cargar promedio inicial cuando se monta el componente
  useEffect(() => {
    obtenerPromedio();
    obtenerTracker();
    obtenerSemanales();
  }, []);

  // Usuario
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Altura mínima 1% para que siempre se vea
  const getBarHeight = (value) => `${Math.max(value, 0.5)}%`;

  // Calcular en qué día de la semana empieza el mes actual
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const offset = (primerDiaMes.getDay() + 6) % 7; 

  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  // +6 para que Lunes sea el primer día (0 = Lunes, 6 = Domingo)
    
  return (
    <div className='ProfileView'>
        <CirclesBackground />
        <div className="left-p-section">
            <div className='user-info'>
              <div className="p-img flex-center"><img src={user ? user.image_url : PAvatar} alt="avatar" /></div>
              <div className="p-info">
                <h1>{user ? user.nombre : 'Nombre de usuario'}</h1>
                <h3>{user ? calcularEdad(user.edad) : ''}</h3>
              </div>
              <div className="p-settings flex-center"><img src={settingsIcon} alt="" /></div>
            </div>
            <div className='user-tip'>
              <div className="emotion-container interactive">
                  <img src={ Happy } alt="emotion" />
              </div>
              <div className="v-line"></div>
              <div className="tip-text-zone">
                <h2>You look happy!</h2>
                <p>You should write about why you are feeling well.</p>
              </div>
              <div className="arrows-container flex-center">
                <img src={DownArrow} className='up-arrow' alt="up" />
                <img src={DownArrow} className='down-arrow' alt="down" />
              </div>
            </div>
            <div className='user-weekly'>
              {weeklyEmotions.map((day, index) => (
                <div className="weekly-emotion" key={index}>
                  <div className="emotion-container">
                    {day?.emotion ? (
                      <img 
                        src={emocionesInfo[day.emotion]?.imagen || Neutral} 
                        alt="emotion" 
                      />
                    ) : (
                      <div className="empty-emotion">-</div>
                    )}
                  </div>
                  <h3>{day?.day || "..."}</h3>
                </div>
              ))}
            </div>
        </div>
        <div className="right-p-section">
            <div className="tracking-section">
                <div className="monthly-record">
                  <>Tracking record</>
                  <div className="flex-center K">
                    <p>M</p>
                    <p>T</p>
                    <p>W</p>
                    <p>T</p>
                    <p>F</p>
                    <p>S</p>
                    <p>S</p>
                  </div>
                  <div className="h-line"></div>
                    <div className="every-day" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                      {trackerDias
                        .slice(0, ultimoDiaMes)
                        .map((activo, index) => (
                          <div
                            key={index}
                            className={`day-circle ${activo ? "active-circle-day" : "empty-circle-day"}`}
                            style={ index === 0 ? { gridColumnStart: offset + 1 } : {} }
                          ></div>
                        ))}
                    </div>
                  <div className="h-line"></div>
                  <div className="tracked-empty">
                    <div className="active-circle-day"></div>
                    <p>Tracked</p>
                    <div className="empty-circle-day"></div>
                    <p>Empty</p>
                  </div>
                </div>
                <div className="user-emotion">
                  <h2>{emocionesInfo[dominante]?.nombre || "Neutral"}</h2>
                  <div className="emotion-container interactive">
                    <img src={emocionesInfo[dominante]?.imagen || Neutral} alt="emotion" />
                  </div>
                  <p>{emocionesInfo[dominante]?.mensaje || "Your mood seems neutral today."}</p>
                </div>
            </div>
            {/* lineas horizontales de FRONT - NO BACK - NO MOVER */}
            <div className="daily-emotions">
              <div className="v-line-d"></div>
              <div className="h-line-d"></div>
              <div className="h-line-d hd1"></div>
              <div className="h-line-d hd2"></div>
              <div className="h-line-d hd3"></div>
              <div className="h-line-d hd4"></div>

              {/* AQUI SE LLENAN LAS GRAFICAS, EN EL FRONT NOMAS SE MODIFICAN LOS PORCENTAJES, CUANDO HAGAN ESTO ME PIDEN AYUDA */}
              
            {/* 
            mongod --dbpath "C:\data\27018" --port 27018 --replSet "rs0" --bind_ip localhost
            mongod --dbpath "C:\data\27018" --port 27019 --replSet "rs0" --bind_ip localhost

            rs.initiate(
              {_id: "rs0", version:1, members:[
                {_id:0, host:"localhost:27017"}, 
                {_id:1, host:"localhost:27018"},
                {_id:2, host:"localhost:27019"}
                ]}
                )
            */}

            <button onClick={obtenerEmociones}>Analizar emoción</button>

              <div className="d-progress-bars">
                {/* AQUI SE PONEN LOS PORCENTAJES DE LAS EMOCIONES EN EL STYLE DE HEIGHT */}
                {/* La emocion tendra un porcentaje, el cual se pondra directamente en la altura de su barra de emocion correspondiente */}
                <div className="angry-bar" style={{ height: getBarHeight(emocionesAcumuladas.angry) }}></div>                
                <div className="disgusted-bar" style={{ height: getBarHeight(emocionesAcumuladas.disgust) }}></div>
                <div className="fear-bar" style={{ height: getBarHeight(emocionesAcumuladas.fear) }}></div>
                <div className="happy-bar" style={{ height: getBarHeight(emocionesAcumuladas.happy) }}></div>
                <div className="sad-bar" style={{ height: getBarHeight(emocionesAcumuladas.sad) }}></div>
                <div className="surprised-bar" style={{ height: getBarHeight(emocionesAcumuladas.surprise) }}></div>
                <div className="neutral-bar" style={{ height: getBarHeight(emocionesAcumuladas.neutral) }}></div>
              </div>

              <div className="d-emtions-container">
                  
                <div className="weekly-emotion">
                  <div className="emotion-container">
                    <img src={ Angry } alt="emotion" />
                  </div>  
                </div>

                <div className="weekly-emotion">
                  <div className="emotion-container">
                    <img src={ Disgust } alt="emotion" />
                  </div>
                </div>

                <div className="weekly-emotion">
                  <div className="emotion-container">
                    <img src={ Fear } alt="emotion" />
                  </div>
                  
                </div>
                <div className="weekly-emotion">
                  <div className="emotion-container">
                    <img src={ Happy } alt="emotion" />
                  </div>
                  
                </div>
                <div className="weekly-emotion">
                  <div className="emotion-container">
                    <img src={ Sad } alt="emotion" />
                  </div>

                </div>
                <div className="weekly-emotion">
                  <div className="emotion-container">
                    <img src={ Surprised } alt="emotion" />
                  </div>

                </div>
                <div className="weekly-emotion">
                  <div className="emotion-container">
                    <img src={ Neutral } alt="emotion" />
                  </div>

                </div>

              </div>

            </div>
        </div>
    </div>
  )
}
