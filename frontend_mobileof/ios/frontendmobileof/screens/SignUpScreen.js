import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
  background: '#020211',
  secondary: '#d400ff',
  tertiary: '#d20972',
  white: '#ffffff',
  inputBackground: '#1a1a1f',
  placeholder: '#aaa',
};

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityWord, setSecurityWord] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString('en-GB');
      setDob(formatted);
      // calcular edad
      const today = new Date();
      let y = today.getFullYear() - selectedDate.getFullYear();
      const m = today.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) y--;
      setAge(String(y));
    }
  };

  const pickImage = async () => {
    // pedir permiso
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Debes autorizar el acceso a la galería.');
      return;
    }
    // abrir galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.cancelled) {
      setPhotoUrl(result.uri);
    }
  };

  const handleSignUp = () => {
    if (!name || !dob || !email || !password || !confirmPassword || !securityWord || !photoUrl || !aiPrompt) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    Alert.alert('¡Éxito!', 'Cuenta creada correctamente.');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.title}>Create your Account</Text>

        <TextInput
          placeholder="Full name"
          placeholderTextColor={COLORS.placeholder}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Fecha y edad */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text style={{ color: dob ? COLORS.white : COLORS.placeholder }}>
            {dob || 'Select your birthdate'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
        {!!age && (
          <Text style={styles.ageText}>
            Age: <Text style={{ fontWeight: '600' }}>{age}</Text>
          </Text>
        )}

        <TextInput
          placeholder="E-mail"
          placeholderTextColor={COLORS.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={COLORS.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor={COLORS.placeholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          placeholder="Security word"
          placeholderTextColor={COLORS.placeholder}
          value={securityWord}
          onChangeText={setSecurityWord}
          style={styles.input}
        />

        {/* Selector de imagen */}
        <TouchableOpacity onPress={pickImage} style={styles.input}>
          <Text style={{ color: photoUrl ? COLORS.white : COLORS.placeholder }}>
            {photoUrl ? 'Photo selected' : 'Select a photo from gallery'}
          </Text>
        </TouchableOpacity>

        {/* Vista previa */}
        {photoUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoUrl }} style={styles.image} />
          </View>
        )}

        <TextInput
          placeholder="Describe yourself to teach the A.I. and get better recommendations!"
          placeholderTextColor={COLORS.placeholder}
          value={aiPrompt}
          onChangeText={setAiPrompt}
          multiline
          numberOfLines={5}
          style={[styles.input, styles.textarea]}
        />

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    padding: 20,
    paddingBottom: 60,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 30,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  ageText: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    color: COLORS.placeholder,
  },
  textarea: { height: 120, textAlignVertical: 'top' },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginBottom: 20,
  },
  image: { width: 200, height: 200, resizeMode: 'cover' },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    width: '50%',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
});
