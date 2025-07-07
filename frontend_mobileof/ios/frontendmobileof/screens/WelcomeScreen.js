// screens/WelcomeScreen.js

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a mi App!</Text>
      <Button 
        title="Ir a Login" 
        onPress={() => navigation.navigate('Login')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20,
  },
});
