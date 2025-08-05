import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

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
import logo from '../assets/icons/logo-mai.png'

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

  const [showSureModal, setShowSureModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    nombre: '',
    password: '',
    confirmarPassword: '',
    descripcion: '',
  });
  
  // ——— Carga inicial ———
  useEffect(() => {
    // obtén user de localStorage
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    // aquí tus llamadas: obtenerPromedio(), obtenerTracker(), etc.
  }, []);

  // ——— Handlers del modal de edición ———
  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    if (editProfileData.password !== editProfileData.confirmarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    console.log('Datos a actualizar:', editProfileData);
    setShowEditModal(false);
    // aquí llamas a tu API para guardar los cambios
  };
  
  const [trackerDias, setTrackerDias] = useState(Array(31).fill(false));
  const [weeklyEmotions, setWeeklyEmotions] = useState(Array(7).fill(null));
  const [consejosHoy, setConsejosHoy] = useState([]);
  const [indiceConsejo, setIndiceConsejo] = useState(0);

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

      if (data) {
        setEmocionesAcumuladas(data.promedio);

        setDominante(data.emocion_dominante_hoy);

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

  // Obtener consejos del backend
  const obtenerConsejosHoy = async () => {
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData)._id : null;
      if (!userId) throw new Error('No se encontró user_id');

      const res = await fetch(`http://127.0.0.1:8000/consejos_hoy/${userId}`);
      if (!res.ok) throw new Error("Error en API de consejos");
      const data = await res.json();

      setConsejosHoy(data.consejos || []);
      setIndiceConsejo(0); // Reiniciar al primer consejo
    } catch (err) {
      console.error("Error obteniendo consejos de hoy:", err);
    }
  };

  const siguienteConsejo = () => {
    if (consejosHoy.length > 0) {
      setIndiceConsejo((prev) => (prev + 1) % consejosHoy.length);
    }
  };

  const anteriorConsejo = () => {
    if (consejosHoy.length > 0) {
      setIndiceConsejo((prev) => (prev - 1 + consejosHoy.length) % consejosHoy.length);
    }
  };

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
      await obtenerConsejosHoy();
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
    obtenerConsejosHoy();
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

  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // Asegúrate de tener esta ruta configurada
  };
    
  return (
    <div className='ProfileView'>
        <CirclesBackground />

        <div className="go-home flex-center" onClick={handleGoHome}><img src={logo} alt="" /></div>
        <h3 className='home-banner'>Go home</h3>

        <div className="left-p-section">
            <div className='user-info'>
              <div className="p-img flex-center"><img src={user ? user.image_url : PAvatar} alt="avatar" /></div>
              <div className="p-info">
                <h1>{user ? user.nombre : 'Username'}</h1>
                <h3>{user ? calcularEdad(user.edad) : ''}</h3>
              </div>
              <div className="p-settings flex-center" onClick={() => setShowEditModal(true)} ><img src={settingsIcon} alt=""/></div>
            </div>
            <div className='user-tip'>
              {consejosHoy.length > 0 ? (
                <>
                  <div className="emotion-container interactive">
                    <img 
                      src={emocionesInfo[consejosHoy[indiceConsejo].emocion]?.imagen || Neutral} 
                      alt="emotion" 
                    />
                  </div>
                  <div className="v-line"></div>
                  <div className="tip-text-zone">
                    <h2>{emocionesInfo[consejosHoy[indiceConsejo].emocion]?.nombre || "Consejo"}</h2>
                    <p>{consejosHoy[indiceConsejo].consejo}</p>
                  </div>
                  <div className="arrows-container flex-center">
                    <img src={DownArrow} className='up-arrow' alt="up" onClick={anteriorConsejo} />
                    <img src={DownArrow} className='down-arrow' alt="down" onClick={siguienteConsejo} />
                  </div>
                </>
              ) : (
                <p>There are no tips for today</p>
              )}
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
                    {dominante ? (
                        <>
                            {/* Esto se muestra si hay una emoción dominante */}
                            <h2>{emocionesInfo[dominante]?.nombre || "Emoción"}</h2>
                            <div className="emotion-container interactive">
                                <img src={emocionesInfo[dominante]?.imagen || Neutral} alt="emotion" />
                            </div>
                            <p>{emocionesInfo[dominante]?.mensaje || "Análisis del día."}</p>
                        </>
                    ) : (
                        <>
                            {/* Esto se muestra si NO hay emoción */}
                            <h2>-</h2>
                            <div className="emotion-container interactive">
                                <div className="empty-emotion">-</div>
                            </div>
                            <p>No records for today</p>
                        </>
                    )}
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

            {/* <button onClick={obtenerEmociones}>Analizar emoción</button> */}

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


        {/* ——— Modal de edición ——— */}
      {showEditModal && (
        <div
          className="modal-settings-background flex-center"
          onClick={e =>
            e.target.classList.contains('modal-settings-background') &&
            setShowEditModal(false)
          }
        >
          <div className="modal-settings">
            <h1>Edit profile</h1>

            <form
              onSubmit={handleEditProfileSubmit}
              className="edit-profile-form"
            >
              <label className="entryArea e-p-entry">
                <input
                  type="text"
                  name="nombre"
                  className='input-margin1 input-edit'
                  value={editProfileData.nombre}
                  onChange={handleEditProfileChange}
                />
                <div className="labelLine labelLineDef">Name</div>
              </label>

              <label className="entryArea e-p-entry">
                <input
                  className='input-margin2 input-edit'
                  type="password"
                  name="password"
                  value={editProfileData.password}
                  onChange={handleEditProfileChange}
                />
                <div className="labelLine labelLineDef">New Password</div>
              </label>

              <label className="entryArea e-p-entry">
                <input
                  className='input-margin3 input-edit'
                  type="password"
                  name="confirmarPassword"
                  value={editProfileData.confirmarPassword}
                  onChange={handleEditProfileChange}
                />
                <div className="labelLine labelLineDef">Confirm Password</div>
              </label>
              
                <textarea
                  className="desc-text-input edit-desc-prompt"
                  name="descripcion"
                  value={editProfileData.descripcion}
                  onChange={handleEditProfileChange}
                  placeholder={`
Describe tu personalidad o intereses. Ej:
- Pasatiempos
- Estilo de vida
- Necesidades emocionales
- Valores
                  `}
                />
              <div className="buttons-modal">
                <button type="submit" className="btn-send save-edit-changes">Save</button>
                <a className="logout" onClick={() => setShowSureModal(true)}>⏻ Log out</a>
              </div>
            </form>
          </div>
        </div>
      )}
    {showSureModal && (
      <div
          className="modal-settings-background flex-center"
          onClick={e =>
            e.target.classList.contains('modal-settings-background') &&
            setShowSureModal(false)
          }
        >
          <div className="modal-logout">
            <h1>You are about to log out</h1>
            <p>Are you sure you want to continue? <br /> <br /> If not, click anywhere outside this box in order to close it.</p>
            <button className='logout-btn'>⏻ Log out</button>
          </div>
        </div>
    )}

    </div>
  )
}
