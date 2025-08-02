import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';

export default function ProfileScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Pedir permisos al cargar el componente
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCameraAccess = async () => {
    if (hasPermission === false) {
      Alert.alert('Permiso denegado', 'No puedes acceder a la cámara');
    } else if (hasPermission === null) {
      Alert.alert('Esperando permisos...');
    } else {
      Alert.alert('¡Permiso concedido!', 'Aquí es donde abrirías la cámara 🎥');
      // Aquí puedes abrir una nueva vista de cámara real si gustas más adelante
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vista de Perfil</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Login')}>
        <Text style={styles.buttonText}>Volver al Login</Text>
      </TouchableOpacity>

      <View style={styles.cameraContainer}>
        <TouchableOpacity style={styles.cameraButton} onPress={() => navigation.navigate('TakePhoto')}>
          <Text style={styles.cameraButtonText}>Abrir Cámara</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const COLORS = {
  background: '#020211',
  secondary: '#d400ff',
  tertiary: '#d20972',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: COLORS.tertiary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cameraContainer: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
  },
  cameraButton: {
    backgroundColor: COLORS.secondary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
