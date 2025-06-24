/**
 * Componente Dashboard
 * 
 * Este es un ejemplo de dashboard que muestra:
 * - Información del usuario autenticado
 * - Gestión de sesiones
 * - Funcionalidades de logout
 * - Datos protegidos del backend
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [protectedData, setProtectedData] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar información del usuario
      const userData = await authService.getCurrentUser();
      setUser(userData.user);

      // Cargar sesiones del usuario
      const sessionsData = await authService.getUserSessions();
      setSessions(sessionsData.sessions || []);

      // Cargar datos protegidos del backend
      const data = await authService.authenticatedRequest('http://localhost:8000/protected-data');
      setProtectedData(data);

    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
      setError('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Limpiar tokens localmente y redirigir
      authService.clearTokens();
      navigate('/login');
    }
  };

  const handleLogoutAllSessions = async () => {
    try {
      await authService.logoutAllSessions();
      navigate('/login');
    } catch (error) {
      console.error('❌ Error cerrando todas las sesiones:', error);
      // Limpiar tokens localmente y redirigir
      authService.clearTokens();
      navigate('/login');
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      await authService.logoutSession(sessionId);
      // Recargar sesiones
      const sessionsData = await authService.getUserSessions();
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      setError('Error cerrando sesión');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Bienvenido, {user?.nombre}</span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-content">
        {/* Información del Usuario */}
        <section className="user-section">
          <h2>Información del Usuario</h2>
          <div className="user-card">
            <div className="user-avatar">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h3>{user?.nombre}</h3>
              <p><strong>Email:</strong> {user?.correo}</p>
              <p><strong>Edad:</strong> {user?.edad} años</p>
              <p><strong>Sexo:</strong> {user?.sexo}</p>
              {user?.preferencias && user.preferencias.length > 0 && (
                <p><strong>Preferencias:</strong> {user.preferencias.join(', ')}</p>
              )}
            </div>
          </div>
        </section>

        {/* Datos Protegidos del Backend */}
        <section className="protected-data-section">
          <h2>Datos Protegidos</h2>
          <div className="protected-data-card">
            {protectedData ? (
              <div>
                <p><strong>Mensaje:</strong> {protectedData.message}</p>
                <p><strong>Usuario:</strong> {protectedData.user_data?.nombre}</p>
                <p><strong>Email:</strong> {protectedData.user_data?.correo}</p>
                <p><strong>Session ID:</strong> {protectedData.user_data?.session_id}</p>
              </div>
            ) : (
              <p>No hay datos disponibles</p>
            )}
          </div>
        </section>

        {/* Gestión de Sesiones */}
        <section className="sessions-section">
          <h2>Gestión de Sesiones</h2>
          <div className="sessions-header">
            <p>Sesiones activas: {sessions.length}</p>
            <button 
              onClick={handleLogoutAllSessions} 
              className="logout-all-btn"
              disabled={sessions.length === 0}
            >
              Cerrar Todas las Sesiones
            </button>
          </div>
          
          <div className="sessions-list">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div key={session.session_id} className="session-card">
                  <div className="session-info">
                    <p><strong>Session ID:</strong> {session.session_id}</p>
                    <p><strong>IP:</strong> {session.ip_address}</p>
                    <p><strong>Dispositivo:</strong> {session.user_agent}</p>
                    <p><strong>Creada:</strong> {new Date(session.created_at).toLocaleString()}</p>
                    <p><strong>Última actividad:</strong> {new Date(session.last_activity).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => handleLogoutSession(session.session_id)}
                    className="logout-session-btn"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ))
            ) : (
              <p>No hay sesiones activas</p>
            )}
          </div>
        </section>

        {/* Acciones Rápidas */}
        <section className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            <button 
              onClick={() => navigate('/profile')} 
              className="action-btn"
            >
              Ver Perfil
            </button>
            <button 
              onClick={() => navigate('/settings')} 
              className="action-btn"
            >
              Configuración
            </button>
            <button 
              onClick={() => window.open('http://localhost:8000/docs', '_blank')} 
              className="action-btn"
            >
              API Docs
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard; 