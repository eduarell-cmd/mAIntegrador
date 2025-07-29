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


export default function Profile() {
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

  // Cuántas veces se ha actualizado (para el promedio)
  const [contador, setContador] = useState(0);

  // Emoción dominante actual
  const [dominante, setDominante] = useState("");

  // Función para obtener emociones y actualizar promedio
  const obtenerEmociones = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/pruebaemocion");
      if (!res.ok) throw new Error("Error en la API");

      const data = await res.json();

      // Convertir strings a números
      const nuevasEmocionesNumeros = {};
      for (const key in data.emociones) {
        nuevasEmocionesNumeros[key] = parseFloat(data.emociones[key]);
      }

      if (contador === 0) {
        // Primera vez: asignamos directamente
        setEmocionesAcumuladas(nuevasEmocionesNumeros);
        setContador(1);
      } else {
        // Siguientes veces: calculamos nuevo promedio
        setEmocionesAcumuladas((prev) => {
          const nuevoContador = contador + 1;
          const promedioActualizado = {};

          for (const key in nuevasEmocionesNumeros) {
            promedioActualizado[key] =
              (prev[key] * contador + nuevasEmocionesNumeros[key]) / nuevoContador;
          }

          setContador(nuevoContador);
          return promedioActualizado;
        });
      }

      setDominante(data.emocion_dominante);
    } catch (err) {
      console.error("Error obteniendo emociones:", err);
    }
  };

  // Debug para ver cambios reales
  useEffect(() => {
    console.log("Emociones acumuladas:", emocionesAcumuladas);
    console.log("Contador:", contador);
  }, [emocionesAcumuladas, contador]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Altura mínima 1% para que siempre se vea
  const getBarHeight = (value) => `${Math.max(value, 0.5)}%`;

    
  return (
    <div className='ProfileView'>
        <CirclesBackground />
        <div className="left-p-section">
            <div className='user-info'>
              <div className="p-img flex-center"><img src={user ? user.image_url : PAvatar} alt="avatar" /></div>
              <div className="p-info">
                <h1>{user ? user.nombre : 'Nombre de usuario'}</h1>
                <h3>{user ? user.edad + ' years old' : ''}</h3>
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
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Fear } alt="emotion" />
                </div>
                <h3>Mon</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Happy } alt="emotion" />
                </div>
                <h3>Tue</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Angry } alt="emotion" />
                </div>
                <h3>Wed</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Surprised } alt="emotion" />
                </div>
                <h3>Thu</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Sad } alt="emotion" />
                </div>
                <h3>Fri</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Happy } alt="emotion" />
                </div>
                <h3>Sat</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Happy } alt="emotion" />
                </div>
                <h3>Sun</h3>
              </div>
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
                  <div className="every-day">
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
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
                  <h2>Happy</h2>
                  <div className="emotion-container interactive">
                    <img src={ Happy } alt="emotion" />
                  </div>
                  <p>Today you seemed really happy!</p>
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
