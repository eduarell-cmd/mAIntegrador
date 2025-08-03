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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  background: '#020211',
  secondary: '#d400ff',
  tertiary: '#d20972',
  accent: '#ff5f79',
  white: '#ffffff',
  inputBG: '#1a1a1f',
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
  const [isLoading, setIsLoading] = useState(false);

  // Reusable input
  const InputField = ({ icon, placeholder, value, onChangeText, secureText, keyboardType, multiline }) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color={COLORS.placeholder} style={styles.inputIcon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[styles.inputField, multiline && styles.textAreaField]}
        secureTextEntry={secureText}
        keyboardType={keyboardType}
        multiline={!!multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString('en-GB');
      setDob(formatted);
      const today = new Date();
      let y = today.getFullYear() - selectedDate.getFullYear();
      const m = today.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) y--;
      setAge(String(y));
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
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('¡Éxito!', 'Cuenta creada correctamente.');
      navigation.navigate('Login');
    }, 1500);
  };

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
            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.placeholder} style={styles.inputIcon} />
              <Text style={[styles.inputField, dob ? styles.inputText : { color: COLORS.placeholder }]}> 
                {dob || 'Birthdate'}
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
            {!!age && <Text style={styles.ageText}>Age: {age}</Text>}

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
                  <Text style={styles.buttonText}>Loading...</Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 20 },
  card: { width: '100%', backgroundColor: COLORS.inputBG, borderRadius: 20, padding: 20, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, marginBottom: 16, paddingHorizontal: 12, height: 50 },
  inputIcon: { marginRight: 8 },
  inputField: { flex: 1, color: COLORS.white, fontSize: 16 },
  textAreaField: { height: 100, textAlignVertical: 'top' },
  ageText: { color: COLORS.placeholder, marginBottom: 16 },
  previewImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 16 },
  buttonWrapper: { marginTop: 10, borderRadius: 30, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
});