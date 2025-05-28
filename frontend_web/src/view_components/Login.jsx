// src/pages/Login.jsx
import React from 'react';

export default function Login() {
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
      
      {/* NO TOCAR EL BOTON DE ABAJO! (OPEN REGISTER FORM) /// IGNORE*/}
      <button id='open_register_form'>Open <br /> Register <br /> section</button> 

      <form className='sign_up_form' method='POST'>
        <label>
          Nombre: 
            <input type="text" name="register_name" id='register_name'/>
        </label>
        <br/>
        <label>
          Edad:
          <input type="number" />
        </label>
        <br/>
        <label>
          Correo:
          <input type="email" name="register_email" id="register_email" />
        </label>
        <br/>
        <label>
          Contraseña:
          <input type="password" name="register_password" id="register_password"/>
        </label>
        <br/>
        <label>
          Confirmar contraseña:
          <input type="password" name="confirm_password" id="confirm_password"/>
        </label>
        <br/>
        <label>
          Palabra de seguridad: 
          <input type="password" name="register_security_word" id="register_security_word" />
        </label>
        <br/>
        <label>
          Genero:
          <input type="radio" name='masculine' id='masculine' value="masculine"/>
          <label>Hombre</label>
          <input type="radio" name='femenine' id='femenine' value="femenine"/>
          <label>Mujer</label>
        </label>
        <br/>
        <label>
          Preferencias:
          <input type="radio" name='gym' id='gym' value="gym"/>
          <label>Gym</label>
          <input type="radio" name='paint' id='paint' value="paint"/>
          <label>Pintura</label>
          <input type="radio" name='music' id='music' value="music"/>
          <label>Musica</label>
        </label>
        <br/>
        <button type="submit">REGISTRARSE</button>
      </form>

    </div>
  );
}
