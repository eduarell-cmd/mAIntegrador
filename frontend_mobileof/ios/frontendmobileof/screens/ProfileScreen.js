import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
  Alert
} from 'react-native';
import DownArrowIcon from '../assets/icons/downArrow.png';
import happyFace from '../assets/images/happy.png';
import sadImageFace from '../assets/images/sad-face.png';
import surprisedFace from '../assets/images/surprised.png';
import neutralFace from '../assets/images/neutral.png';
import fearFace from '../assets/images/fear.png';
import disgustFace from '../assets/images/disgust.png';
import angryFace from '../assets/images/angry.png';

import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../../services/config';
import { getAccessToken } from '../../../services/authService';
import { useAuth } from '../../../services/authContext';
import { jwtDecode } from 'jwt-decode';

import cameraIconImg from '../assets/icons/camera.png';
import fondo from '../assets/images/ciruclosfondo.png';

import { BlurView } from 'expo-blur';

// --- ASSETS ---
// Usando URIs de placeholder para  las imágenes.
// Para imágenes locales, usarías: const happyImage = require('../assets/happy.png');
const happyImage = happyFace;
const Neutral = neutralFace;
const DownArrow = DownArrowIcon;

// INSTANCIACION DE LAS CONSTANTES PARA LAS IMAGENES
const emocionesInfo = {
  angry: {
    nombre: "Angry",
    mensaje: "You showed some anger today. Try to relax and take care of yourself.",
    imagen: angryFace // Ya tienes esta variable importada
  },
  disgust: {
    nombre: "Disgust",
    mensaje: "You felt a bit uncomfortable today. It's okay to notice what bothers you.",
    imagen: disgustFace
  },
  fear: {
    nombre: "Fear",
    mensaje: "You seemed a bit worried today. Remember, it's normal to feel this way sometimes.",
    imagen: fearFace
  },
  happy: {
    nombre: "Happy",
    mensaje: "You looked happy today! Enjoy these positive moments.",
    imagen: happyFace
  },
  sad: {
    nombre: "Sad",
    mensaje: "You felt a bit down today. Take time for yourself and reach out if you need support.",
    imagen: sadImageFace
  },
  surprise: { // El nombre de la emoción es 'surprise' no 'surprised'
    nombre: "Surprised",
    mensaje: "You experienced some surprises today. Life is full of unexpected moments.",
    imagen: surprisedFace
  },
  neutral: {
    nombre: "Neutral",
    mensaje: "Your mood was calm and balanced today.",
    imagen: neutralFace
  }
};

const emotionColors = {
  angry: 'rgba(239, 38, 38, 0.9)',
  disgust: 'rgba(85, 107, 47, 0.8)',
  fear: 'rgba(148, 74, 148, 0.9)',
  happy: 'rgba(255, 255, 113, 0.9)',
  sad: 'rgba(77, 149, 242, 0.9)',
  surprise: 'rgb(255, 152, 26)',
  neutral: 'rgba(128, 128, 128, 0.7)',
};

const COLORS = {
  background: '#0a0a0a',
  secondary: '#d400ff',
  white: '#ffffff',
  boxesBG: '#1f1f2e',
  text: '#eaeaea',
  primary: '#4e4e4e',
};

const ProfileScreen = ({ route, navigation, handleCameraAccess }) => {
  const { logout } = useAuth();

  const handleCameraAndVerify = async () => {
  try {
    await handleCameraAccess(); // tu lógica actual para tomar la foto
    // Luego, enviar petición al backend que activa la verificación
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const resp = await fetch(`${API_BASE_URL}/trigger_verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: decodedUserId /* o route.params.user */ }),
    });
    if (!resp.ok) {
      console.error('Error al disparar verificación en mirror', await resp.text());
    } else {
      console.log('Verificación desencadenada exitosamente');
    }
  } catch (err) {
    console.error('Error en cámara/verificación', err);
    Alert.alert('Error', 'No se pudo realizar la verificación.');
  }
};

  const handleLogout = async () => {
    await logout(); // Esto borra los tokens del AsyncStorage
    navigation.replace('Login'); // Envía al usuario de vuelta al Login
  };

  // --- Estados para manejar los datos dinámicos ---
  const [user, setUser] = React.useState(route.params?.user || null);
  const [loading, setLoading] = React.useState(true);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  
  // Estados para cada sección (reemplazan los datos de ejemplo)
  const [consejos, setConsejos] = React.useState([]);
  const [weeklyEmotions, setWeeklyEmotions] = React.useState(Array(7).fill({ day: '...', emotion: null }));
  const [dailyEmotion, setDailyEmotion] = React.useState(null);
  const [emotionChart, setEmotionChart] = React.useState([]);
  const [trackerDays, setTrackerDays] = React.useState(Array(31).fill(false));

  // El estado para el índice del consejo ya lo tienes, puedes mantenerlo
  const [indiceConsejo, setIndiceConsejo] = React.useState(0);

  const fetchProfileData = async () => {
    console.log("--- Iniciando fetchProfileData ---");
    if (!userId) {
      console.log("fetchProfileData abortado: Aún no hay userId.");
      return;
    }
    
    console.log(`UserID para el fetch: ${userId}`);
    setLoading(true);

    try {
      const token = await getAccessToken();
      //const headers = { 'Authorization': `Bearer ${token}` };

      console.log("Intentando fetch a: /consejos_hoy...");
      const consejosRes = await fetch(`${API_BASE_URL}/consejos_hoy/${userId}`, { headers });
      console.log(`Respuesta de /consejos_hoy -> Status: ${consejosRes.status}`);

      if (consejosRes.ok) {
        const data = await consejosRes.json();
        console.log("Datos de consejos recibidos:", data);
        setConsejos(data.consejos || []);
      } else {
        const errorText = await consejosRes.text();
        console.error("Error en la respuesta de /consejos_hoy:", errorText);
      }

      // Por ahora, las otras llamadas están desactivadas para la prueba.

    } catch (error) {
      console.error("ERROR CATASTRÓFICO en fetch:", error);
      Alert.alert("Error de Red", "No se pudo conectar al servidor. Revisa la IP, el puerto y la conexión WiFi.");
    } finally {
      console.log("--- Finalizando fetchProfileData. setLoading(false) ---");
      setLoading(false);
    }
  };

  const refreshProfileData = useCallback(async (showLoading = true) => {
  if (showLoading) setLoading(true);

  try {
    const token = await getAccessToken();
    if (!token) return navigation.replace('Login');
    
    const decodedToken = jwtDecode(token);
    const currentUserId = decodedToken.user_id;
    if (!currentUserId) throw new Error("ID de usuario no encontrado.");

    const headers = { 'Authorization': `Bearer ${token}` };

    const [promedioRes, semanalRes, trackerRes, consejosRes] = await Promise.all([
      fetch(`${API_BASE_URL}/promedioemocion/${currentUserId}`, { headers }),
      fetch(`${API_BASE_URL}/weekly_emotions/${currentUserId}`, { headers }),
      fetch(`${API_BASE_URL}/tracker/${currentUserId}`, { headers }),
      fetch(`${API_BASE_URL}/consejos_hoy/${currentUserId}`, { headers }),
    ]);

    if (promedioRes.ok) {
        const data = await promedioRes.json();
        setDailyEmotion(data.emocion_dominante_hoy);
        const chartData = Object.keys(data.promedio).map(key => ({
            name: key, value: data.promedio[key], color: emotionColors[key] || '#ccc', icon: emocionesInfo[key]?.imagen,
        }));
        setEmotionChart(chartData);
    }
    if (semanalRes.ok) {
        const data = await semanalRes.json();
        setWeeklyEmotions(data.weekly_emotions);
    }
    if (trackerRes.ok) {
        const data = await trackerRes.json();
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        setTrackerDays(data.dias.slice(0, daysInMonth));
    }
    if (consejosRes.ok) {
        const data = await consejosRes.json();
        setConsejos(data.consejos || []);
        setIndiceConsejo(0);
    }
  } catch (error) {
    console.error("Error al refrescar los datos:", error);
  } finally {
    if (showLoading) setLoading(false);
  }
}, [navigation]);

  
  useFocusEffect(
    useCallback(() => {
      refreshProfileData();
    }, [refreshProfileData])
  );

  const handleFaceAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    Alert.alert("Analizando...", "Estamos analizando tu expresión, por favor espera.");

    try {
      const token = await getAccessToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // 1. Llama a /geminiprompt para obtener el análisis
      const geminiRes = await fetch(`${API_BASE_URL}/geminiprompt`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(user), // Usa el objeto 'user' del estado
      });

      if (!geminiRes.ok) {
        throw new Error("Respuesta inválida del servidor de análisis.");
      }
      const analysisData = await geminiRes.json();

      // 2. Llama a /guardar_consejo para almacenar el resultado
      if (analysisData.consejo) {
        await fetch(`${API_BASE_URL}/guardar_consejo`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            user_id: jwtDecode(token).user_id,
            emocion_foto: analysisData.emocion_foto,
            emocion: analysisData.emocion,
            consejo: analysisData.consejo,
          }),
        });
      }

      // 3. Refresca los datos del perfil para mostrar la nueva info
      await refreshProfileData(false);
      Alert.alert("¡Éxito!", "Tu perfil ha sido actualizado.");

    } catch (error) {
      Alert.alert("Error", `Ocurrió un problema durante el análisis: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const anteriorConsejo = () => {
    setIndiceConsejo((prev) => (prev > 0 ? prev - 1 : consejos.length - 1));
  };
  const siguienteConsejo = () => {
    if (consejos.length > 0){
      setIndiceConsejo((prev) => (prev < consejos.length - 1 ? prev + 1 : 0));
    }
  };

    if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background}}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={{color: 'white', marginTop: 10}}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
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
      <ScrollView style={styles.container && styles.mTop}>
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Image 
            source={user?.image_url ? { uri: user.image_url } : require('../assets/images/mainavatar.png')}
            style={styles.avatar} 
          />

          <View style={styles.verticalLine} />

          <View style={styles.userTextContainer}>
            <Text style={styles.username}>{user?.nombre || 'Usuario'}</Text>
            <Text style={styles.prompt}>{user?.descripcion || 'Sin descripción.'}</Text>
            <Text style={styles.prompt}>Age: {user?.edad ? `${new Date().getFullYear() - new Date(user.edad).getFullYear()} years` : 'N/A'}</Text>
          </View>
        </View>


        {/* Tracking Record + Emoción */}
        <View style={styles.rowContainer}>
          {/* Tracking Record */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tracking Record</Text>
            <View style={styles.daysRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <View key={index} style={styles.dayCircle}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.grid}>
              {trackerDays.map((day, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridCircle,
                    {
                      backgroundColor: day ? '#df0aadff' : '#353535ff',
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Emoción de hoy */}
          <View style={styles.card}>
            {dailyEmotion && emocionesInfo[dailyEmotion] ? (
              <>
                {/* Esto muestra el nombre de la emoción como título */}
                <Text style={styles.username}>{emocionesInfo[dailyEmotion].nombre}</Text>
                
                <Image source={emocionesInfo[dailyEmotion].imagen} style={styles.dailyEmotionImage} />
                
                {/* Esto muestra el mensaje detallado */}
                <Text style={styles.prompt}>{emocionesInfo[dailyEmotion].mensaje}</Text>
              </>
            ) : ( 
              <Text style={styles.prompt}>No records for today</Text>
            )}
          </View>
        </View>

        {/* Botón cámara */}
        <View style={styles.explanationContainer}>
          <Text style={styles.sectionTitle}>Take a photo</Text>
          <TouchableOpacity 
            style={styles.circleButton} 
            onPress={handleFaceAnalysis} 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="large" color={COLORS.secondary} />
            ) : (
              <Text style={styles.cameraIcon}>📷</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.explanationText}>
            {isAnalyzing 
              ? "Analizando tu rostro..." 
              : "Presiona para que el espejo capture tu expresión actual y analice tu rostro."
            }
          </Text>
        </View>

        {/* --- SECCIÓN DEL CONSEJO PSICOLÓGICO --- */}
        <View style={styles.userTipContainer}>
          {consejos.length > 0 ? (
            <>
              {/* Contenedor de la emoción */}
              <View style={styles.emotionWrapper}>
                  <View style={styles.emotionContainer}>
                      <Image
                          source={emocionesInfo[consejos[indiceConsejo]?.emocion]?.imagen || Neutral}
                          style={styles.emotionImage}
                      />
                  </View>
              </View>

              {/* Línea Vertical */}
              <View style={styles.verticalLine} />

              {/* Zona de Texto */}
              <View style={styles.tipTextZone}>
                <Text style={styles.emotionTitle}>
                  {emocionesInfo[consejos[indiceConsejo].emocion]?.nombre || "Consejo"}
                </Text>
                <Text style={styles.tipText}>
                  {consejos[indiceConsejo].consejo}
                </Text>
              </View>

              {/* Contenedor de Flechas */}
              <View style={styles.arrowsContainer}>
                <TouchableOpacity onPress={anteriorConsejo}>
                  <Image source={DownArrow} style={[styles.arrow, styles.upArrow]} />
                </TouchableOpacity>
                <TouchableOpacity onPress={siguienteConsejo}>
                  <Image source={DownArrow} style={styles.arrow} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.tipText}>No hay consejos para hoy</Text>
          )}
        </View>

        {/* Seguimiento semanal */}
        {/* --- SEGUIMIENTO SEMANAL (IMPLEMENTADO) --- */}
        <View style={styles.cardFullWidth}>
          <Text style={styles.sectionTitle}>Weekly Tracker</Text>
          <View style={styles.weeklyContainer}>
            {weeklyEmotions.map((item, index) => (
              <TouchableOpacity key={index} style={styles.weeklyDayContainer}>
                <View style={[
                  styles.weeklyEmotionCircle,
                  // Si no hay emoción, el círculo es más oscuro
                  !item.emotion && styles.emptyEmotionCircle
                ]}>
                  {item.emotion ? (
                    <Image
                      source={emocionesInfo[item.emotion]?.imagen || Neutral}
                      style={styles.weeklyEmotionImage}
                    />
                  ) : null}
                </View>
                <Text style={styles.weeklyDayText}>{item.day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- GRÁFICA DE EMOCIONES (IMPLEMENTADA) --- */}
        <View style={styles.cardFullWidth}>
          <Text style={styles.sectionTitle}>Your Emotions</Text>
          <View style={styles.graphContainer}>
            {/* Fondo de la Gráfica (Líneas) */}
            <View style={styles.graphBackground}>
                <View style={[styles.hLine, {bottom: '0%'}]} />
                <View style={[styles.hLine, {bottom: '25%'}]} />
                <View style={[styles.hLine, {bottom: '50%'}]} />
                <View style={[styles.hLine, {bottom: '75%'}]} />
                <View style={[styles.hLine, {bottom: '100%'}]} />
                <View style={styles.vLine} />
            </View>

            {/* Barras de Progreso */}
            <View style={styles.barsContainer}>
                {emotionChart.map((item) => (
                    <View key={item.name} style={[styles.bar, {height: `${item.value}%`, backgroundColor: item.color}]} />
                ))}
            </View>
          </View>

          {/* Iconos/Etiquetas de Emociones */}
          <View style={styles.emotionLabelsContainer}>
              {emotionChart.map((item) => (
                  <View key={item.name} style={styles.emotionLabelItem}>
                      <Image source={item.icon} style={styles.emotionLabelIcon} />
                  </View>
              ))}
          </View>
        </View>
      </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // transparencia blanca
    borderColor: 'rgba(255,255,255,0.3)', // borde sutil
    borderWidth: 1.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: 'cover',
    marginRight: 12,
    borderColor: '#fff',
    borderWidth: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // transparencia blanca
    borderColor: 'rgba(255,255,255,0.3)', // borde sutil
    borderWidth: 1.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    height: 190,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  cardFullWidth: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // transparencia blanca
    borderColor: 'rgba(255,255,255,0.3)', // borde sutil
    borderWidth: 1.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 10,
    
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 8,
  },
  dayCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: 7 * (10 + 8), // 7 círculos * (ancho + margen)
    marginTop: 10,
  },
  gridCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 4,
  },
  dailyEmotionImage: {
    height: 60,
    width: 60,
    marginVertical: 15,
  },
  explanationContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // transparencia blanca
    borderColor: 'rgba(255,255,255,0.3)', // borde sutil
    borderWidth: 1.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 30,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  explanationText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
  },
  circleButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderColor: '#aaa',
    borderWidth: 3,
    marginVertical: 20,
  },
  cameraIcon: {
    fontSize: 30,
  },
  placeholderText: {
    color: COLORS.text,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
  },
  // --- ESTILOS PARA EL CONTENEDOR DE CONSEJOS ---
  userTipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // transparencia blanca
    borderColor: 'rgba(255,255,255,0.3)', // borde sutil
    borderWidth: 1.5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    height: 160,
    marginHorizontal: 10,
  },
  emotionWrapper: {
    width: '28%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emotionContainer: {
    height: 70,
    width: 70,
    borderRadius: 45,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  emotionImage: {
    height: '80%',
    width: '80%',
    resizeMode: 'contain',
    borderRadius: 40,
  },
  verticalLine: {
    width: 1.5,
    height: '70%',
    backgroundColor: '#d0d0d0',
    borderRadius: 1,
  },
  userTextContainer: {
    flex: 1,
  },
  tipTextZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  emotionTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  tipText: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  arrowsContainer: {
    width: '15%',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
  },
  arrow: {
    height: 30,
    width: 30,
    tintColor: COLORS.white,
  },
  upArrow: {
    transform: [{ rotate: '180deg' }],
  },
  // --- ESTILOS PARA SEGUIMIENTO SEMANAL ---
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  weeklyDayContainer: {
    alignItems: 'center',
    flex: 1, // Para que cada día ocupe el mismo espacio
  },
  weeklyEmotionCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  emptyEmotionCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fondo más oscuro si no hay emoción
    borderColor: '#2a2a2a',
  },
  weeklyEmotionImage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  weeklyDayText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  // -------------------------- ESTILOS PARA LA GRÁFICA DE EMOCIONES -------------------
  graphContainer: {
    height: 200, // Altura fija para la gráfica
    marginTop: 20,
    position: 'relative', // Necesario para posicionar las líneas de fondo
  },
  graphBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '3%', // Margen izquierdo para el eje Y
    right: 0,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  vLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end', // Las barras crecen desde abajo
    justifyContent: 'space-around',
    marginLeft: '8%', // Alinear con el fondo de la gráfica
    paddingHorizontal: 10, // Espacio entre las barras
  },
  bar: {
    width: 25, // Ancho de cada barra
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  emotionLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: '8%', // Alinear con las barras
    paddingHorizontal: 10,
    marginTop: 10,
    height: 40, // Altura para los íconos
  },
  emotionLabelItem: {
    width: 25, // Mismo ancho que las barras
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionLabelIcon: {
    width: 30,
    height: 30,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // transparencia blanca
    borderColor: 'rgba(255,255,255,0.3)', // borde sutil
    borderWidth: 2,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  mTop: {
    marginTop: 28,
  }
});

export default ProfileScreen;
