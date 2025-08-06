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
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../../services/config';

// 🎨 Colores globales (originales)
const COLORS = {
  background: '#020211',
  secondary: '#d400ff',
  tertiary: '#d20972',
  accent: '#ff5f79',
  white: '#ffffff',
  inputBG: '#1a1a1f',
  placeholder: '#aaa',
  border: '#333', // Se mantiene para consistencia
  inputBackground: '#25252b', // Color de fondo de input original
};

// ✅ Componente de Input sin cambios
function InputField({ icon, placeholder, value, onChangeText, secureText, keyboardType, multiline }) {
  const containerStyle = [
    styles.inputContainer,
    multiline && styles.textAreaContainer,
  ];

  const inputStyle = [
    styles.inputField,
    multiline && styles.textAreaField,
  ];

  return (
    <View style={containerStyle}>
      <Ionicons name={icon} size={20} color={COLORS.placeholder} style={styles.inputIcon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        style={inputStyle}
        secureTextEntry={secureText}
        keyboardType={keyboardType}
        multiline={!!multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}


// 👇 COMPONENTE PRINCIPAL
export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState(''); // fecha de nacimiento en formato YYYY-MM-DD
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityWord, setSecurityWord] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [genero, setGenero] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // FIX: Se agrega un estado dedicado para el objeto Date del picker
  const [date, setDate] = useState(new Date());

  // FIX: Nueva función para mostrar el picker y establecer su fecha inicial
  const showDatepicker = () => {
    // Si ya hay una fecha, el picker iniciará en esa fecha. Si no, en la actual.
    const initialDate = dob ? new Date(dob.replace(/-/g, '/')) : new Date();
    setDate(initialDate);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    // En Android, el picker se cierra solo, así que ocultamos el estado.
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    // Asegurarse de que el usuario no canceló la selección
    if (selectedDate) {
      // Actualiza el estado temporal 'date' para que el picker refleje el cambio
      setDate(selectedDate);
      
      // En Android, solo se confirma con el evento 'set' (botón OK)
      // En iOS, con el modo 'spinner', cada cambio se considera una selección
      if (event.type === 'set' || Platform.OS === 'ios') {
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;
        setDob(formatted);
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Autoriza el acceso a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const apiUrl = 'https://api.cloudinary.com/v1_1/dfczlyftc/image/upload';
    const upload_preset = 'registro';
    const fileName = imageUri.split('/').pop();
    const match = /\.([^.]+)$/.exec(fileName);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    let mimeType = `image/${ext}`;
    if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      name: fileName,
      type: mimeType,
    });
    formData.append('upload_preset', upload_preset);

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    if (!response.ok || !data.secure_url) {
        console.error('Error de Cloudinary:', data);
        throw new Error('Error subiendo la imagen');
    }
    return data.secure_url;
  };

  const registerUser = async (userData) => {
    const urlsignup = API_BASE_URL+'/auth/signup'
    const backendUrl =  urlsignup;
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error en el registro desde el servidor');
    }
    return await response.json();
  };

  const handleSignUp = async () => {
    if (!name || !dob || !email || !password || !confirmPassword || !securityWord || !photoUrl || !aiPrompt || !genero) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos para continuar.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error de contraseña', 'Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(photoUrl);
      
      const userData = {
        nombre: name,
        edad: dob, 
        genero: genero,
        correo: email,
        palabra_de_seguridad: securityWord,
        password: password,
        descripcion: aiPrompt,
        image_url: imageUrl,
      };

      await registerUser(userData);
      
      Alert.alert('¡Éxito!', 'Tu cuenta ha sido creada correctamente.');
      navigation.navigate('Login');

    } catch (err) {
      console.error("Error detallado en handleSignUp:", JSON.stringify(err, null, 2));
      Alert.alert('Error en el registro', err.message || 'Ocurrió un problema inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayDate = dob ? dob.split('-').reverse().join('/') : 'Birthdate';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.safe}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Your Account</Text>
          <View style={styles.card}>
            <InputField icon="person-outline" placeholder="Full Name" value={name} onChangeText={setName} />
            
            <TouchableOpacity style={styles.inputContainer} onPress={showDatepicker}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.placeholder} style={styles.inputIcon} />
              <Text style={[styles.inputField, dob ? styles.inputText : { color: COLORS.placeholder }]}> 
                {displayDate}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={'spinner'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Selector de género con el diseño original */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: COLORS.placeholder, marginBottom: 8, marginLeft: 5 }}>Gender</Text>
              <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => setGenero('hombre')}
                  style={{
                    backgroundColor: genero === 'hombre' ? COLORS.secondary : '#f0f0f0',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: genero === 'hombre' ? COLORS.secondary : '#ccc',
                  }}
                >
                  <Text style={{ color: genero === 'hombre' ? '#fff' : '#666' }}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setGenero('mujer')}
                  style={{
                    backgroundColor: genero === 'mujer' ? COLORS.secondary : '#f0f0f0',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: genero === 'mujer' ? COLORS.secondary : '#ccc',
                  }}
                >
                  <Text style={{ color: genero === 'mujer' ? '#fff' : '#666' }}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            <InputField icon="mail-outline" placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureText />
            <InputField icon="lock-closed-outline" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureText />
            <InputField icon="shield-checkmark-outline" placeholder="Security Word" value={securityWord} onChangeText={setSecurityWord} />

            <TouchableOpacity style={styles.inputContainer} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color={COLORS.placeholder} style={styles.inputIcon} />
              <Text style={[styles.inputField, photoUrl ? styles.inputText : { color: COLORS.placeholder }]}> 
                {photoUrl ? 'Photo selected' : 'Add Profile Photo'}
              </Text>
            </TouchableOpacity>
            {photoUrl && (
              <Image source={{ uri: photoUrl }} style={styles.previewImage} />
            )}

            <InputField
              icon="chatbox-ellipses-outline"
              placeholder="Tell us about yourself..."
              value={aiPrompt}
              onChangeText={setAiPrompt}
              multiline
            />

            <TouchableOpacity disabled={isLoading} onPress={handleSignUp} style={styles.buttonWrapper}>
              <LinearGradient
                colors={[COLORS.secondary, COLORS.tertiary]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos restaurados a la versión original del usuario
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 20 },
  card: { width: '100%', backgroundColor: COLORS.inputBG, borderRadius: 20, padding: 20, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: COLORS.inputBackground,
    height: 60,
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingTop: 15,
  },
  inputIcon: { marginRight: 8 },
  inputField: { flex: 1, color: COLORS.white, fontSize: 16 },
  textAreaField: { height: 100, textAlignVertical: 'top' },
  previewImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 16 },
  buttonWrapper: { marginTop: 10, borderRadius: 30, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  inputText: { color: COLORS.white, fontSize: 16, flex: 1 },
});
