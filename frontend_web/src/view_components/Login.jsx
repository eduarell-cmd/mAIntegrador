// src/pages/Login.jsx
import React, { useState } from 'react';

export default function Login() {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

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
    if (registerData.password !== registerData.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    //chech
    const payload = {
      nombre: registerData.nombre,
      edad: parseInt(registerData.edad),
      preferencias: registerData.preferencias,
      sexo: registerData.sexo,
      correo: registerData.correo,
      palabra_de_seguridad: registerData.palabra_de_seguridad,
      password: registerData.password
    };
    
    console.log('Datos que se envían al backend:', payload);

    try {
      const res = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.detail || 'Error en el registro');
      }
      
      const data = await res.json();
      console.log('Respuesta del backend:', data);

      alert('Registro exitoso');
    } catch (error) {
      console.error('Error al registrarse:', error);
      alert(`Error al enviar el formulario: ${error.message}`);
    }
  };
  return (
     <div className="login-page">

      <h1>Iniciar Sesión</h1>
      
      <form className='login_form' onSubmit={handleLoginSubmit}>
        <label>
          Correo:
          <input 
            type="email" 
            name="email" 
            id='email'
            value={loginData.email}
            onChange={handleLoginChange}
            required
          />
        </label>
        <label>
          Contraseña:
          <input 
            type="password" 
            name="password" 
            id='password'
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />
        </label>
        <button type="submit">Entrar</button>
      </form>

      <h1>Registrate perro</h1>

  
      <button id='open_register_form'>Open <br /> Register <br /> section</button> 

      <form className='sign_up_form' onSubmit={handleRegisterSubmit}>
        <label>
          Nombre: 
          <input type="text" name="nombre" value={registerData.nombre} onChange={handleRegisterChange} />
        </label>
        <br/>
        <label>
          Edad:
          <input type="number" name="edad" value={registerData.edad} onChange={handleRegisterChange} />
        </label>
        <br/>
        <label>
          Correo:
          <input type="email" name="correo" value={registerData.correo} onChange={handleRegisterChange} />
        </label>
        <br/>
        <label>
          Contraseña:
          <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} />
        </label>
        <br/>
        <label>
          Confirmar contraseña:
          <input type="password" name="confirmarPassword" value={registerData.confirmarPassword} onChange={handleRegisterChange} />
        </label>
        <br/>
        <label>
          Palabra de seguridad: 
          <input type="password" name="palabra_de_seguridad" value={registerData.palabra_de_seguridad} onChange={handleRegisterChange} />
        </label>
        <br/>
        <label>
          Género:
          <input type="radio" name="sexo" value="masculino" checked={registerData.sexo === 'masculino'} onChange={handleRegisterChange} />
          <label htmlFor="masculine">H</label>
          <input type="radio" name="sexo" value="femenino" checked={registerData.sexo === 'femenino'} onChange={handleRegisterChange} />
          <label htmlFor="feminine">M</label>
        </label>

        <br/>
        <label>
          Preferencias:
          <input type="checkbox" name="preferencias" value="gym" checked={registerData.preferencias.includes("gym")} onChange={handleRegisterChange}/>
          <label>Gym</label>
          <input type="checkbox" name="preferencias" value="paint" checked={registerData.preferencias.includes("paint")} onChange={handleRegisterChange}/>
          <label>Pintura</label>
          <input type="checkbox" name="preferencias" value="music" checked={registerData.preferencias.includes("music")} onChange={handleRegisterChange}/>
          <label>Música</label>
        </label>
        <br/>
        <button type="submit">REGISTRARSE</button>
      </form>

    </div>
  );
}
