import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './ios/frontendmobileof/screens/WelcomeScreen';
import LoginScreen from './ios/frontendmobileof/screens/LoginScreen';
import SplashScreen from './ios/frontendmobileof/screens/SplashScreen';
import LoggedInScreen from './ios/frontendmobileof/screens/LoggedInScreen';
import SignUpScreen from './ios/frontendmobileof/screens/SignUpScreen';

import { AuthProvider, useAuth } from './services/authContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={isAuthenticated ? "LoggedIn" : "Login"}
      screenOptions={{ headerShown: false }}>
      {/* Puedes agregar WelcomeScreen o SplashScreen si lo deseas */}
      {/* <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: 'Bienvenido' }} /> */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Iniciar Sesión' }} 
      />
      <Stack.Screen 
        name="LoggedIn" 
        component={LoggedInScreen} 
        options={{ title: 'Bienvenido' }} 
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
        options={{ title: 'Crear Cuenta' }} 
      />

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

