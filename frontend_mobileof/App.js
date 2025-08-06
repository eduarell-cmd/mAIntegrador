// App.js

import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
// Añade Linking, Alert, y Platform
import { Linking, StyleSheet, Text, View, ActivityIndicator, Alert, Platform } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { API_BASE_URL } from './services/config';
import WelcomeScreen from './ios/frontendmobileof/screens/WelcomeScreen';
import LoginScreen from './ios/frontendmobileof/screens/LoginScreen';
import SplashScreen from './ios/frontendmobileof/screens/SplashScreen';
import LoggedInScreen from './ios/frontendmobileof/screens/LoggedInScreen';
import SignUpScreen from './ios/frontendmobileof/screens/SignUpScreen';
import ProfileScreen from './ios/frontendmobileof/screens/ProfileScreen';

import { AuthProvider, useAuth } from './services/authContext';

const Stack = createNativeStackNavigator();

// --- LÓGICA DEL DEEP LINK INTEGRADA AQUÍ ---
function AppNavigator() {
  // Ahora obtenemos 'getAccessToken' en lugar de 'token'
  const { isAuthenticated, loading, getAccessToken } = useAuth();


  useEffect(() => {
    const handleDeepLink = async (event) => {
      if (!event.url) return;
      const url = event.url;
      console.log('Deep link recibido:', url);

      const parts = url.split('/');
      if (parts.length >= 4 && parts[2] === 'qr-login') {
        const sessionId = parts[3];
        console.log('Session ID extraído:', sessionId);

        // ▼ Llamamos a la función para obtener el token ▼
        const token = await getAccessToken(); 

        if (!token) {
          Alert.alert('Error de Autenticación', 'Debes tener una sesión activa en la app para usar esta función.');
          return;
        }

        if (!sessionId) {
          Alert.alert('Error', 'No se pudo leer el código QR. Inténtalo de nuevo.');
          return;
        }

        try {
          // 3. USA LA VARIABLE IMPORTADA
          const response = await axios.post(
            `${API_BASE_URL}/auth/qr/scan/${sessionId}`, // <--- USA API_BASE_URL
            {},
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (response.status === 200) {
            Alert.alert('¡Éxito!', 'Has iniciado sesión en tu otro dispositivo.');
          }
        } catch (error) {
          console.error('Error al escanear el QR:', error.response?.data || error.message);
          Alert.alert('Error', 'No se pudo completar el inicio de sesión.');
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [getAccessToken]); // Dependemos de la función getAccessToken del contexto

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="LoggedIn" component={LoggedInScreen} options={{ title: 'Bienvenido' }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Crear Cuenta' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}