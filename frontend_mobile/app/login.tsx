import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.80:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const userData = await response.json();
      console.log('Usuario autenticado:', userData);

      router.replace('/(tabs)');

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 24 }}>Iniciar sesión</Text>
      <TextInput
        placeholder="Correo electrónico"
        autoCapitalize="none"
        onChangeText={setCorreo}
        value={correo}
        style={{ borderWidth: 1, padding: 10, borderRadius: 5 }}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={{ borderWidth: 1, padding: 10, borderRadius: 5 }}
      />
      <Button title={loading ? 'Cargando...' : 'Iniciar sesión'} onPress={handleLogin} />
    </View>
  );
}
