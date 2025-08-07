import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Puedes reusar estilos de Login.css o crear uno nuevo

export default function ResetPassword() {
  const [passwords, setPasswords] = useState({
    nueva_password: '',
    confirmar_password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hook para obtener el token de la URL (ej. /reset-password/:token)
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación 1: Las contraseñas no coinciden
    if (passwords.nueva_password !== passwords.confirmar_password) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    // Validación 2: Contraseña muy corta
    if (passwords.nueva_password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        token: token,
        nueva_password: passwords.nueva_password
      };
      const response = await axios.post('http://localhost:8000/reset-password', payload);
      setMessage(response.data.message + ' Serás redirigido al login en 3 segundos.');

      // Redirigir al login después de un momento
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.detail || 'El enlace es inválido, ha expirado o ya fue utilizado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page"> {/* Reusando el contenedor principal */}
      <div className="login-form-container"> {/* Un contenedor para centrar el formulario */}
        <h2>Restablecer Contraseña</h2>
        
        {message && <div style={{ color: 'lightgreen', margin: '15px' }}>{message}</div>}
        {error && <div style={{ color: 'red', margin: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className='entryArea'>
            <input
              type="password"
              name="nueva_password"
              placeholder=" "
              value={passwords.nueva_password}
              onChange={handleChange}
              required
              disabled={loading || !!message} // Deshabilitar si está cargando o si ya tuvo éxito
            />
             <div className="labelLine">Nueva Contraseña</div>
          </label>
          <label className='entryArea' style={{marginTop: '1rem'}}>
            <input
              type="password"
              name="confirmar_password"
              placeholder=" "
              value={passwords.confirmar_password}
              onChange={handleChange}
              required
              disabled={loading || !!message}
            />
            <div className="labelLine">Confirmar Nueva Contraseña</div>
          </label>
          <button className='btn-send' type="submit" disabled={loading || !!message} style={{marginTop: '2rem'}}>
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}