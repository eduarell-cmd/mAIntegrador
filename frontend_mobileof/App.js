import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './ios/frontendmobileof/screens/WelcomeScreen';
import LoginScreen from './ios/frontendmobileof/screens/LoginScreen';
import SplashScreen from './ios/frontendmobileof/screens/SplashScreen';
import LoggedInScreen from './ios/frontendmobileof/screens/LoggedInScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }} 
        />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

