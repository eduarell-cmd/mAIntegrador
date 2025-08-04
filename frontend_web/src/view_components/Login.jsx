// src/pages/Login.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CirclesBackground } from '../small_components/CirclesBackground';
import './Login.css';

import closedEye from '../assets/icons/closedEye.png';
import openEye from '../assets/icons/openedEye.png';
import userImage from '../assets/icons/image.png';
import teachImg from '../assets/icons/teaching.png';

// Importar el servicio de autenticación
import authService from '../services/authService';
import axios from 'axios';

export default function Login() {
  const [loginData, setLoginData] = useState({
    correo: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleToggle = () => {
     setShowLogin(prev => !prev);
     setError(''); // Limpiar errores al cambiar de formulario
  };

  // 1. referencias de lso forms
  const loginRef = useRef(null);
  const registerRef = useRef(null);
  
  const [registerData, setRegisterData] = useState({
    nombre: '',
    edad: '',
    genero:'',
    correo: '',
    palabra_de_seguridad: '',
    password: '',
    confirmarPassword: '',
    descripcion: ''
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar errores al escribir
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usar el nuevo servicio de autenticación
      const result = await authService.login(loginData.correo, loginData.password);
      
      console.log('✅ Login exitoso:', result);
      
      // Redirigir al usuario a la página principal o dashboard
      navigate('/profile'); // Cambiar por la ruta que prefieras
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      setError(error.message || 'Error en el login. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setRegisterData((prev) => {
        const nuevasPreferencias = checked
          ? [...prev.preferencias, value]
          : prev.preferencias.filter((item) => item !== value);
        return { ...prev, preferencias: nuevasPreferencias };
      });
    } else if (type === 'radio') {
      setRegisterData((prev) => ({ ...prev, genero: value }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }
    setError(''); // Limpiar errores al escribir
  };

  // Función para subir imagen a Cloudinary
  async function uploadImageToCloudinary(file) {
    const url = 'https://api.cloudinary.com/v1_1/dfczlyftc/image/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'registro');
    const response = await axios.post(url, formData);
    return response.data.secure_url;
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Función de sanitización
    const sanitizeInput = (input) => {
      if (typeof input === 'string') {
        return input.trim();
      }
      return input;
    };

    // Validaciones y sanitización
    if (!registerData.nombre?.trim()) {
      setError('El nombre es requerido');
      setLoading(false);
      return;
    }

    if (!registerData.correo?.trim()) {
      setError('El correo es requerido');
      setLoading(false);
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.correo)) {
      setError('Por favor, ingrese un correo electrónico válido');
      setLoading(false);
      return;
    }

    // Validación de contraseña
    if (!registerData.password || registerData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validacion de la descripcion del usuario ---------------
    if (!registerData.descripcion.trim()) {
      alert("La descripción es obligatoria.");
      return;
    }

    // Validación de imagen obligatoria
    if (!userImageFile) {
      setError('La imagen es obligatoria.');
      setLoading(false);
      return;
    }

    // Subir imagen a Cloudinary
    let imageUrl = '';
    try {
      imageUrl = await uploadImageToCloudinary(userImageFile);
    } catch (err) {
      setError('Error subiendo la imagen.');
      setLoading(false);
      return;
    }

    // Creación del payload con datos sanitizados
    const payload = {
      nombre: sanitizeInput(registerData.nombre),
      edad: registerData.edad,
      genero: registerData.genero,
      correo: sanitizeInput(registerData.correo).toLowerCase(),
      palabra_de_seguridad: sanitizeInput(registerData.palabra_de_seguridad),
      password: registerData.password,
      descripcion: sanitizeInput(registerData.descripcion),
      image_url: imageUrl
    };

    try {
      // Usar el nuevo servicio de autenticación
      const result = await authService.signup(payload);
      console.log("[DEBUG]. datos de registrar :" + payload)
      console.log('✅ Registro exitoso:', result);
      
      // Redirigir al usuario a la página principal o dashboard
      navigate('/Profile'); 
      
    } catch (error) {
      console.error('❌ Error en registro:', error);
      if (error.response && error.response.status === 409) {
        setError('El correo ya está registrado. Usa otro o inicia sesión.');
      } else {
        setError(error.message || 'Error en el registro. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

const handleVerificarRostroSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:8000/facerecog");
    const data = await res.json();
    console.log("Respuesta del backend:", data);

    // Dependiendo de cómo venga la respuesta del backend:
    if (typeof data.mensaje === 'string') {
      if (data.mensaje.toLowerCase().includes("voltea") || data.mensaje.toLowerCase().includes("mirar")) {
        alert("👀 Por favor, voltea hacia la cámara");
      } else {
        alert(data.mensaje);
      }
    } else if (data.mensaje?.estado === "no_detectado") {
      alert("👀 No se detectó tu rostro. Por favor, mira a la cámara.");
    } else {
      alert("✅ Rostro detectado correctamente.");
    }

  } catch (err) {
    console.error("Error al llamar al backend:", err);
    alert("❌ Error al conectar con el servidor.");
  }
};

// ---------- OCULTAR Y MOSTRAR LA MODAL DE DESCRIPCION ---------
const [showPrompt, setShowPrompt] = useState(false);

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowPrompt(false);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);

//  ----------- SECCION PARA GUARDAR LAS IMAGENES ---------------
const [userImageFile, setUserImageFile] = useState(null);

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setUserImageFile(file);
    console.log("📷 Imagen seleccionada:", file.name);
    // NOTAAA: Aquí se guarda la imagen, desde aqui, redireccionenla a donde la vayan a utilizar! (DANI, LALO)
  } else {
    alert("Por favor, selecciona un archivo de imagen válido.");
  }
};


  return (
    
    <div className="login-page">

      <CirclesBackground />

      {/* <h1 className='login-title'>Iniciar Sesión</h1> */}

      {/* ---------------------- login FORM ------------------ */}
      
      <form className={ showLogin ? 'openLF' : 'closedLF' } onSubmit={handleLoginSubmit} ref={loginRef}>
        <h1 className="formTitle eas">Log in</h1>
        <a className='alternate-forms' id='alternate-forms' onClick={handleToggle} >{showLogin ? 'Create an account' : 'Login'}</a> 
        
        {/* Mostrar errores */}
        {error && (
          <div className="error-message" style={{
            color: '#ff4444',
            backgroundColor: '#ffe6e6',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <label className='entryArea eas'>
          <input 
            type="text" 
            name="correo" 
            id='correo'
            placeholder=" "
            value={loginData.correo}
            onChange={handleLoginChange}
            required
            disabled={loading}
          />
          <div className="labelLine eas">E-mail</div>
        </label>
        <label className='entryArea passwordArea eas'>
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            id='password'
            placeholder=" "
            value={loginData.password}
            onChange={handleLoginChange}
            required
            disabled={loading}
          />
          <div className="labelLine eas">Password</div>
          <img 
            src={showPassword ? openEye : closedEye} 
            alt={showPassword ? 'Hide password' : 'Show password'}
            className="toggleIcon"
            onClick={togglePasswordVisibility}
          />
        </label>
        <h3 className='p-forgot eas'>Forgot password?</h3>
        <button className='btn-send eas' type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Login'}
        </button>
        {/* SECTION DE DISPLAY NONE PARA CAJA GRIS */}
        <a className='test-btn' id='alternate-forms' onClick={handleToggle} >{showLogin ? 'Register' : 'Login'}</a> 
        <h2 className='altern-h2'>Welcome back</h2>
        <p className="altern-p">You've been missed. <br /> Ready to dive back in?</p>
      </form>

      {/* <h1>Registrate perro</h1> */}


{/* ALTERNATE FORMS BTN */}
      {/* <button className='test-btn' id='alternate-forms' onClick={handleToggle} >{showLogin ? 'Switch to Register' : 'Back to Login'}</button>  */}

      <form className={ showLogin ? 'closedRF' : 'openRF' } onSubmit={handleRegisterSubmit} ref={loginRef}>
        <h1 className="formTitle">Sign up</h1>
        <div className="middle-su-content">
          <div className="left-su-side">
            <a className='alternate-forms' id='alternate-forms' onClick={handleToggle} >{showLogin ? 'Create an account' : 'Log in'}</a> 
            <label className='entryArea'>
              <input required type="text" name="nombre" value={registerData.nombre} onChange={handleRegisterChange} disabled={loading} />
              <div className="labelLine">Name</div>
            </label>
            {/* <br/>.  */}
            <label className='entryArea'>
              <input required type="date" name="edad" value={registerData.edad} onChange={handleRegisterChange} disabled={loading} />
              <div className="labelLine">Birthday</div>
            </label>
            {/* <br/>  cambiar Tipo de dato a bool */ }
            <label className='entryArea'>
            <div className="labelLine">Género</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label>
                <input
                  type="radio"
                  name="genero"
                  value="male"
                  checked={registerData.genero === 'male'}
                  onChange={handleRegisterChange}
                  disabled={loading}
                  required
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="genero"
                  value="female"
                  checked={registerData.genero === 'female'}
                  onChange={handleRegisterChange}
                  disabled={loading}
                  required
                />
                Female
              </label>
            </div>
          </label>
            {/* <br/>  */}
            <label className='entryArea'> 
              <input required type="email" name="correo" value={registerData.correo} onChange={handleRegisterChange} disabled={loading} />
              <div className="labelLine">E-mail</div>
            </label>
            {/* <br/> */}
            <label className='entryArea'>
              <input required type="password" name="password" value={registerData.password} onChange={handleRegisterChange} disabled={loading} />
              <div className="labelLine">Password</div>
            </label>
            {/* <br/> */}
            <label className='entryArea'>
              <input required type="password" name="confirmarPassword" value={registerData.confirmarPassword} onChange={handleRegisterChange} disabled={loading} />
              <div className="labelLine">Confirm Password</div>
            </label>
            {/* <br/> */}
            <label className='entryArea'>
              <input required type="password" name="palabra_de_seguridad" value={registerData.palabra_de_seguridad} onChange={handleRegisterChange} disabled={loading} />
              <div className="labelLine">Security word</div>
            </label>
            {/* <br/> */}
            {/* <label className='select-section'>
              <h3>Gender</h3>
              <div className="gender-radio">
                <input className='radio-check' type="radio" name="sexo" value="masculino" checked={registerData.sexo === 'masculino'} onChange={handleRegisterChange} />
                <label htmlFor="masculine">H</label>
                <input className='radio-check' type="radio" name="sexo" value="femenino" checked={registerData.sexo === 'femenino'} onChange={handleRegisterChange} />
                <label htmlFor="feminine">M</label>
              </div>
            </label>

            <label className='select-section'>
              Preferencias:
              <input type="checkbox" name="preferencias" value="gym" checked={registerData.preferencias.includes("gym")} onChange={handleRegisterChange}/>
              <label>Gym</label>
              <input type="checkbox" name="preferencias" value="paint" checked={registerData.preferencias.includes("paint")} onChange={handleRegisterChange}/>
              <label>Pintura</label>
              <input type="checkbox" name="preferencias" value="music" checked={registerData.preferencias.includes("music")} onChange={handleRegisterChange}/>
              <label>Música</label>
            </label> */}
          </div>
          <div className="right-su-side">

           <label className="user-su-img flex-center" htmlFor="userImageInput">
            <img className='.userImgIcon' src={userImage} alt="upload preview" />
            <h4 className="user-su-p">Upload file <span>here</span></h4>
            <input
              id="userImageInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {userImageFile && (
              <img
                src={URL.createObjectURL(userImageFile)}
                alt="Vista previa"
                className="preview-image"
              />
            )}

          </label>

           <div className="user-su-description flex-center" onClick={() => setShowPrompt(true)}>
              <img className='.teachImgIcon' src={teachImg} alt="Teach AI" />
              <h4 className='user-su-p'>Teach the IA <span>here</span></h4>
           </div>
          </div>
        </div>
        <button className='btn-send' type="submit">Register</button>
        <a className='test-btn' id='alternate-forms' onClick={handleToggle} >{showLogin ? 'Register' : 'Login'}</a> 
      {/* SECCION PARA DISPLAY NONE DEL CONTENEDOR DE CAJA GRIS */}
          <h2 className='altern-h2'>No account?</h2>
          <p className="altern-p">Create one down here</p>
          
      </form>

      {showPrompt && (
        <div
          className="prompt-su-window flex-center"
          onClick={(e) => {
            if (e.target.classList.contains('prompt-su-window')) {
              setShowPrompt(false);
            }
          }}
        >
          <div className="prompt-su-container flex-center">
            <button className="close-btn" onClick={() => setShowPrompt(false)}>✖</button>
            <label className='entryArea entryAreaModal'>
              <div className="labelLine2">Tell us about <span>you</span></div>
              <textarea
                required
                className='desc-text-input'
                name="descripcion"
                value={registerData.descripcion}
                onChange={handleRegisterChange}
                placeholder="Describe tu personalidad o tus intereses usando de ejemplo el siguiente texto: 

  Este ejemplo da información clara sobre:

        - Pasatiempos

        - Estilo de vida

        - Gustos personales

        - Necesidades emocionales

        - Interacción social

        - Valores"
              />
            </label>
            <div className="teach-btn flex-center" onClick={() => setShowPrompt(false)} >I have finished</div>
          </div>
        </div>
      )}


      <form onSubmit={handleVerificarRostroSubmit}>
        {/* <button type="submit" id='backend-test' className='backend-test'>boton de backend</button> */}
      </form>
        
      <div className="btn-container">

        <Link to="/Mirror" className="loginBtn">
          Mirror View
          <div className="loginBtnCircle"></div>
        </Link>

      </div>
      

    </div>
  );
}
