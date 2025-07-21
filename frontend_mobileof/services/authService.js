import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

export const login = async (correo, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  });
  if (!response.ok) {
    throw new Error('Credenciales incorrectas');
  }
  const data = await response.json();
  await AsyncStorage.setItem('access_token', data.access_token);
  await AsyncStorage.setItem('refresh_token', data.refresh_token);
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