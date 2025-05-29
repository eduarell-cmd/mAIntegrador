// src/pages/Login.jsx
import React, { useState } from 'react';
export default function Login() {
  const [registerData, setRegisterData] = useState({
    nombre: '',
    edad: '',
    preferencias: '',
    sexo: '',
    correo: '',
    palabra_de_seguridad: '',
    password: '',
  });

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
    const payload = {
      nombre: registerData.nombre,
      correo: registerData.correo,
      mensaje: "Usuario registrado",
      edad: registerData.edad,
      palabra: registerData.palabra,
      sexo: registerData.sexo,
      preferencias: registerData.preferencias
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
      console.log('Respuesta del backend:', data);
      alert('Registro exitoso');
    } catch (error) {
      console.error('Error al registrarse:', error);
      alert('Error al enviar el formulario');
    }
  };
  return (
     <div className="login-page">

      <h1>Iniciar Sesión</h1>
      
      <form className='login_form' method='POST'>
        <label>
          Correo:
          <input type="text" name="email" id='email'/>
        </label>
        <label>
          Contraseña:
          <input type="password" name="password" id='password'/>
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
          <input type="password" name="palabra" value={registerData.palabra} onChange={handleRegisterChange} />
        </label>
        <br/>
        <label>
          Género:
          <input type="radio" name="genero" value="masculino" checked={registerData.genero === 'masculino'} onChange={handleRegisterChange} />
          <label htmlFor="masculine">H</label>
          <input type="radio" name="genero" value="femenino" checked={registerData.genero === 'femenino'} onChange={handleRegisterChange} />
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
