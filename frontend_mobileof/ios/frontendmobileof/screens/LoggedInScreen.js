// screens/LoggedInScreen.js

import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../../services/authContext';

export default function LoggedInScreen({ navigation }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ Sesión iniciada correctamente</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    marginBottom: 24,
  },
});
