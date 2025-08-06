import React, { useState } from 'react';
import { login } from '../../../services/authService';
import { useAuth } from '../../../services/authContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  ImageBackground
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import fondo from '../assets/images/ciruclosfondo.png';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import logo from '../assets/images/logo-mai.png';


const COLORS = {
  background: '#0c0c1e',
  card: '#1a1a2f',
  input: '#2c2c3e',
  primary: '#ffffff',
  secondary: '#9f5fff',
  accent: '#d400ff',
  textMuted: '#9a9aaf',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();

  const handleLogin = async () => {
    if (email && password) {
      setLoading(true);
      try {
        const loginData = await login(email, password); 
        loginSuccess();
        navigation.replace('Profile', { user: loginData.user }); 
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Empty fields', 'Write your e-mail and password');
    }
  };

  return (
    <View style={styles.container}>
    <ImageBackground
      source={fondo}
      resizeMode="cover"
      style={{
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      

      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Encabezado fuera de la carta */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />

        <View style={styles.titleRow}>
          <Text style={styles.appTitle}>M.</Text>
          <MaskedView
            maskElement={<Text style={[styles.appTitle, { backgroundColor: 'transparent' }]}>AI</Text>}
          >
            <LinearGradient
              colors={['#00f0ff', '#ff00ff', '#9f5fff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.appTitle, { opacity: 0 }]}>AI</Text>
            </LinearGradient>
          </MaskedView>
        </View>
      </View>

      {/* Carta de login */}
      <BlurView intensity={40} tint="dark" style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Login</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="E-mail"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.link}>
              No account? <Text style={styles.linkAccent}>Sign up</Text>
            </Text>
          </TouchableOpacity>

          {/* BOTÓN TEMPORAL DE PERFIL */}
          <TouchableOpacity
            style={[styles.profileTestButton]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileTestButtonText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
      </ImageBackground>
    </View>
  );

}

const GradientText = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 1 }}>
      <Text style={styles.normalText}>M.</Text>
      <MaskedView
        maskElement={
          <Text style={[styles.title, { backgroundColor: 'transparent' }]}>
            AI
          </Text>
        }
      >
        <LinearGradient
          colors={['#00f0ff', '#ff00ff', '#9f5fff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.title, { opacity: 0 }]}>AI</Text>
        </LinearGradient>
      </MaskedView>
    </View>

  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    //paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 40,
    fontWeight: 800,
    color: COLORS.primaryText || '#fff',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: '-12'
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginBottom: 32,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: '10',
  },
  input: {
    backgroundColor: COLORS.input,
    color: COLORS.primary,
    padding: 14,
    borderRadius: 50,
    textAlign: 'center',
    marginBottom: 18,
    fontSize: 16,
    width: '80%',
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    width: '40%',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 14,
  },
  linkAccent: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 58,
    color: COLORS.primary,
    fontWeight: 400,
  },
  cardContainer: {
    flex: 1,
    width: '98%',
    borderRadius: 50,
    padding: 24,
    paddingTop: 36,
    alignItems: 'center',
    justifyContent: 'flex-start',

    // Glassmorphism
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // negro semi-transparente
    borderWidth: 2,
    borderColor: '#222', // gris claro
    overflow: 'hidden', // importante para que el blur no se desborde

    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,

    // Posición
    marginTop: 10,
    bottom: -40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 12,
    marginTop: 30,
  },  
  profileTestButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  profileTestButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },


});
