// src/pages/Login.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CirclesBackground } from '../small_components/CirclesBackground';
import './Login.css';

import closedEye from '../assets/icons/closedEye.png';
import openEye from '../assets/icons/openedEye.png';


export default function Login() {
  const [loginData, setLoginData] = useState({
    correo: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  const handleToggle = () => {
     setShowLogin(prev => !prev);
  };

  // 1. referencias de lso forms
  const loginRef = useRef(null);
  const registerRef = useRef(null);
  
  const [registerData, setRegisterData] = useState({
    nombre: '',
    edad: '',
    preferencias: [],
    sexo: '',
    correo: '',
    palabra_de_seguridad: '',
    password: ''
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log('Respuesta del backend:', data);
      if (response.ok) {
        // Guardar el token en localStorage si el backend lo devuelve
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        alert('Login exitoso');
        // Aquí puedes redirigir al usuario a otra página
        // window.location.href = '/dashboard';
      } else {
        alert(data.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Error al hacer login:', error);
      alert('Error al conectar con el servidor');
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
      setRegisterData((prev) => ({ ...prev, sexo: value }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Función de sanitización
    const sanitizeInput = (input) => {
      if (typeof input === 'string') {
        return input.trim();
      }
      return input;
    };

    // Validaciones y sanitización
    if (!registerData.nombre?.trim()) {
      alert('El nombre es requerido');
      return;
    }

    if (!registerData.correo?.trim()) {
      alert('El correo es requerido');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.correo)) {
      alert('Por favor, ingrese un correo electrónico válido');
      return;
    }

    // Validación de contraseña
    if (!registerData.password || registerData.password.length < 2) {//subir a 8
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (registerData.password !== registerData.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validación de edad
    const edad = parseInt(registerData.edad);
    if (isNaN(edad) || edad < 18 || edad > 100) {
      alert('Por favor, ingrese una edad válida (entre 18 y 100 años)');
      return;
    }

    // Creación del payload con datos sanitizados
    const payload = {
      nombre: sanitizeInput(registerData.nombre),
      edad: edad,
      preferencias: registerData.preferencias, // Mantenemos como array
      sexo: sanitizeInput(registerData.sexo),
      correo: sanitizeInput(registerData.correo).toLowerCase(),
      palabra_de_seguridad: sanitizeInput(registerData.palabra_de_seguridad),
      password: registerData.password
    };

    try {
      const res = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Error en el registro');
      }

      console.log('Respuesta del backend:', data);
      alert('Registro exitoso');
    } catch (error) {
      console.error('Error al registrarse:', error);
      alert(`Error al enviar el formulario: ${error.message}`);
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

  return (
    
    <div className="login-page">

      <CirclesBackground />

      {/* <h1 className='login-title'>Iniciar Sesión</h1> */}

      {/* ---------------------- login FORM ------------------ */}
      
      <form className={ showLogin ? 'openLF' : 'closedLF' } onSubmit={handleLoginSubmit} ref={loginRef}>
        <h1 className="formTitle eas">Log in</h1>
        <label className='entryArea eas'>
          <input 
            type="email" 
            name="correo" 
            id='correo'
            placeholder=" "
            value={loginData.correo}
            onChange={handleLoginChange}
            required
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
        <button className='btn-send eas' type="submit">Login</button>
        {/* SECTION DE DISPLAY NONE PARA CAJA GRIS */}
        <button className='test-btn' id='alternate-forms' onClick={handleToggle} >{showLogin ? 'Register' : 'Login'}</button> 
        <h2 className='altern-h2'>Welcome back</h2>
        <p className="altern-p">You’ve been missed. <br /> Ready to dive back in?</p>
      </form>

      {/* <h1>Registrate perro</h1> */}


{/* ALTERNATE FORMS BTN */}
      {/* <button className='test-btn' id='alternate-forms' onClick={handleToggle} >{showLogin ? 'Switch to Register' : 'Back to Login'}</button>  */}

      <form className={ showLogin ? 'closedRF' : 'openRF' } onSubmit={handleRegisterSubmit} ref={loginRef}>
        <h1 className="formTitle">Sign up</h1>
        <label className='entryArea'>
          <input required type="text" name="nombre" value={registerData.nombre} onChange={handleRegisterChange} />
          <div className="labelLine">Name</div>
        </label>
        <br/>
        <label className='entryArea'>
          <input required type="number" name="edad" value={registerData.edad} onChange={handleRegisterChange} />
          <div className="labelLine">Age</div>
        </label>
        <br/>
        <label className='entryArea'>
          <input required type="email" name="correo" value={registerData.correo} onChange={handleRegisterChange} />
          <div className="labelLine">E-mail</div>
        </label>
        <br/>
        <label className='entryArea'>
          <input required type="password" name="password" value={registerData.password} onChange={handleRegisterChange} />
          <div className="labelLine">Password</div>
        </label>
        <br/>
        <label className='entryArea'>
          <input required type="password" name="confirmarPassword" value={registerData.confirmarPassword} onChange={handleRegisterChange} />
          <div className="labelLine">Confirm Password</div>
        </label>
        <br/>
        <label className='entryArea'>
          <input required type="password" name="palabra_de_seguridad" value={registerData.palabra_de_seguridad} onChange={handleRegisterChange} />
          <div className="labelLine">Security word</div>
        </label>
        <br/>
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
        <button className='btn-send' type="submit">Register</button>
        <button className='test-btn' id='alternate-forms' onClick={handleToggle} >{showLogin ? 'Register' : 'Login'}</button> 
      {/* SECCION PARA DISPLAY NONE DEL CONTENEDOR DE CAJA GRIS */}
          <h2 className='altern-h2'>No account?</h2>
          <p className="altern-p">Create one down here</p>
      </form>

      <form onSubmit={handleVerificarRostroSubmit}>
        <button type="submit" id='backend-test' className='backend-test'>boton de backend</button>
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
