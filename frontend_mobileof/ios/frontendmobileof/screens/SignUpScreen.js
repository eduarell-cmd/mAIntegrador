import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityWord, setSecurityWord] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const handleSignUp = () => {
    if (
      name &&
      dob &&
      email &&
      password &&
      confirmPassword &&
      securityWord &&
      photoUrl &&
      aiPrompt
    ) {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
      Alert.alert('Éxito', '¡Cuenta creada con éxito!');
      navigation.navigate('Login');
    } else {
      Alert.alert('Error', 'Completa todos los campos');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Botón de retroceso */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Crear Cuenta</Text>

        <TextInput
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Fecha de nacimiento (DD/MM/AAAA)"
          value={dob}
          onChangeText={setDob}
          style={styles.input}
        />
        <TextInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Palabra de seguridad"
          value={securityWord}
          onChangeText={setSecurityWord}
          style={styles.input}
        />
        <TextInput
          placeholder="URL de tu foto"
          value={photoUrl}
          onChangeText={setPhotoUrl}
          style={styles.input}
        />
        <TextInput
          placeholder="Describe quién eres para enseñarle a la IA"
          value={aiPrompt}
          onChangeText={setAiPrompt}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textarea]}
        />

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 14,
    fontSize: 16,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
