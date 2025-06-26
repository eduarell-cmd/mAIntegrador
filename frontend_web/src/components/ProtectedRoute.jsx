/**
 * Componente ProtectedRoute
 * 
 * Este componente protege rutas que requieren autenticación.
 * Si el usuario no está autenticado, lo redirige al login.
 * Si está autenticado, muestra el componente hijo.
 * 
 * ¿Cómo funciona?
 * 1. Verifica si el usuario está autenticado
 * 2. Si no está autenticado, redirige al login
 * 3. Si está autenticado, muestra el componente
 * 4. Opcionalmente verifica si el token está próximo a expirar
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si el usuario está autenticado
        const authenticated = authService.isAuthenticated();
        
        if (authenticated) {
          // Si está autenticado, verificar si el token está próximo a expirar
          if (authService.isTokenExpiringSoon()) {
            try {
              await authService.refreshAccessToken();
              console.log('✅ Token renovado automáticamente en ProtectedRoute');
            } catch (error) {
              console.error('❌ Error renovando token en ProtectedRoute:', error);
              authService.clearTokens();
              setIsAuthenticated(false);
              setIsLoading(false);
              return;
            }
          }
          
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-verificar cuando cambie la ruta

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  // Si requiere autenticación y no está autenticado, redirigir al login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no requiere autenticación y está autenticado, redirigir al dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está bien, mostrar el componente hijo
  return children;
};

export default ProtectedRoute; 