// /services/authContext.js (MODIFICADO)

import React, { createContext, useContext, useState, useEffect } from 'react';
// Asegúrate de que getAccessToken esté exportado desde authService
import { getAccessToken, logout as authLogout } from './authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const logout = async () => {
    await authLogout();
    setIsAuthenticated(false);
  };

  const loginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    //                                          AÑADIMOS getAccessToken AQUÍ
    //                                                          ▼
    <AuthContext.Provider value={{ isAuthenticated, loading, loginSuccess, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);