import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

export const login = async (correo, password) => {
  console.log('[LOGIN] Intentando login con:', correo);
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  });
  console.log('[LOGIN] Status:', response.status);
  let data;
  try {
    data = await response.json();
    console.log('[LOGIN] Respuesta JSON:', data);
  } catch (err) {
    console.log('[LOGIN] Error parseando JSON:', err);
    throw new Error('Respuesta inválida del servidor');
  }
  if (!response.ok) {
    throw new Error(data?.message || 'Credenciales incorrectas');
  }
  try {
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
    console.log('[LOGIN] Tokens guardados');
  } catch (err) {
    console.log('[LOGIN] Error guardando tokens:', err);
    throw new Error('No se pudieron guardar los tokens');
  }
  return data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
};

export const getAccessToken = async () => {
  return await AsyncStorage.getItem('access_token');
};

export const getRefreshToken = async () => {
  return await AsyncStorage.getItem('refresh_token');
}; 