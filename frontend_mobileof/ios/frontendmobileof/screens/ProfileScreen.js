import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import DownArrowIcon from '../assets/icons/downArrow.png';
import happyFace from '../assets/images/happy.png';
import sadImageFace from '../assets/images/sad-face.png';
import surprisedFace from '../assets/images/surprised.png';
import neutralFace from '../assets/images/neutral.png';
import fearFace from '../assets/images/fear.png';
import disgustFace from '../assets/images/disgust.png';
import angryFace from '../assets/images/angry.png';

// --- ASSETS ---
// Usando URIs de placeholder para las imágenes.
// Para imágenes locales, usarías: const happyImage = require('../assets/happy.png');
const happyImage = happyFace;
const Neutral = neutralFace;
const DownArrow = DownArrowIcon;

// --- DATOS DE EJEMPLO para CONSEJOS---
const consejosHoy = [
    { emocion: 'happy', consejo: 'Aprovecha esta energía para conectar con otros. Una sonrisa puede cambiar el día de alguien.' },
    { emocion: 'neutral', consejo: 'Es un buen momento para la introspección. Medita sobre tus metas y cómo te sientes.' },
    { emocion: 'sad', consejo: 'Permítete sentir. Escucha música tranquila o escribe lo que sientes. No estás solo.' },
];

// INSTANCIACION DE LAS CONSTANTES PARA LAS IMAGENES
const emocionesInfo = {
    happy: { nombre: 'Felicidad', imagen: happyImage },
    neutral: { nombre: 'Neutralidad', imagen: Neutral },
    sad: { nombre: 'Tristeza', imagen: sadImageFace },
    angry: { nombre: 'Enojo', imagen: angryFace },
    surprise: { nombre: 'Sorpresa', imagen: surprisedFace },
    disgust: { nombre: 'Disgusto', imagen: disgustFace },
    fear: { nombre: 'Miedo', imagen: fearFace },
};

// --- DATOS PARA LA GRÁFICA DE BARRAS ---
const dailyEmotionData = [
    { name: 'angry', value: 75, color: 'rgba(239, 38, 38, 0.9)', icon: angryFace },
    { name: 'disgust', value: 20, color: 'rgba(85, 107, 47, 0.8)', icon: disgustFace },
    { name: 'fear', value: 40, color: 'rgba(148, 74, 148, 0.9)', icon: fearFace },
    { name: 'happy', value: 90, color: 'rgba(255, 255, 113, 0.9)', icon: happyFace },
    { name: 'sad', value: 60, color: 'rgba(77, 149, 242, 0.9)', icon: sadImageFace },
    { name: 'surprise', value: 80, color: 'rgb(255, 152, 26)', icon: surprisedFace },
    { name: 'neutral', value: 30, color: 'rgba(128, 128, 128, 0.7)', icon: neutralFace },
];

const COLORS = {
  background: '#0a0a0a',
  secondary: '#d400ff',
  white: '#ffffff',
  boxesBG: '#1f1f2e',
  text: '#eaeaea',
  primary: '#4e4e4e',
};

// DIAS QUE SE USO LA APP - DAILY TRACKING
const usedDays = [0, 1, 5, 12, 20];

// --- DATOS DE EJEMPLO PARA LA SEMANA ---
const weeklyEmotions = [
  { day: 'MON', emotion: 'happy' },
  { day: 'TUE', emotion: 'neutral' },
  { day: 'WED', emotion: 'sad' },
  { day: 'THU', emotion: 'happy' },
  { day: 'FRI', emotion: null }, // Día sin registro
  { day: 'SAT', emotion: 'neutral' },
  { day: 'SUN', emotion: null }, // Día sin registro
];

const ProfileScreen = ({ handleCameraAccess }) => {
  // --- Lógica de ejemplo para los consejos ---
  const [indiceConsejo, setIndiceConsejo] = React.useState(0);
  const anteriorConsejo = () => {
    setIndiceConsejo((prev) => (prev > 0 ? prev - 1 : consejosHoy.length - 1));
  };
  const siguienteConsejo = () => {
    setIndiceConsejo((prev) => (prev < consejosHoy.length - 1 ? prev + 1 : 0));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.username}>Nombre de Usuario</Text>
          <Text style={styles.prompt}>"Mensaje personalizado para la IA"</Text>
          <Text style={styles.prompt}>Age: XX</Text>
        </View>

        {/* Tracking Record + Emoción */}
        <View style={styles.rowContainer}>
          {/* Tracking Record */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tracking Record</Text>
            <View style={styles.daysRow}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <View key={index} style={styles.dayCircle}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.grid}>
              {Array.from({ length: 35 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridCircle,
                    {
                      backgroundColor: usedDays.includes(index)
                        ? '#df0aadff'
                        : '#353535ff',
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Emoción de hoy */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Daily emotion</Text>
            <Image source={happyImage} style={styles.dailyEmotionImage} />
            <Text style={styles.prompt}>Your mood seems happy today.</Text>
          </View>
        </View>

        {/* Botón cámara */}
        <View style={styles.explanationContainer}>
            <Text style={styles.sectionTitle}>Take a photo</Text>
          <TouchableOpacity style={styles.circleButton} onPress={handleCameraAccess}>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
          <Text style={styles.explanationText}>
            Presiona para que el espejo capture tu expresión actual y analice tu rostro.
          </Text>
        </View>

        {/* --- SECCIÓN DEL CONSEJO PSICOLÓGICO --- */}
        <View style={styles.userTipContainer}>
          {consejosHoy.length > 0 ? (
            <>
              {/* Contenedor de la emoción */}
              <View style={styles.emotionWrapper}>
                  <View style={styles.emotionContainer}>
                      <Image
                          source={emocionesInfo[consejosHoy[indiceConsejo].emocion]?.imagen || Neutral}
                          style={styles.emotionImage}
                      />
                  </View>
              </View>

              {/* Línea Vertical */}
              <View style={styles.verticalLine} />

              {/* Zona de Texto */}
              <View style={styles.tipTextZone}>
                <Text style={styles.emotionTitle}>
                  {emocionesInfo[consejosHoy[indiceConsejo].emocion]?.nombre || "Consejo"}
                </Text>
                <Text style={styles.tipText}>
                  {consejosHoy[indiceConsejo].consejo}
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
          <Text style={styles.sectionTitle}>Seguimiento Semanal</Text>
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
          <Text style={styles.sectionTitle}>Gráfica de Emociones</Text>
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
                {dailyEmotionData.map((item) => (
                    <View key={item.name} style={[styles.bar, {height: `${item.value}%`, backgroundColor: item.color}]} />
                ))}
            </View>
          </View>

          {/* Iconos/Etiquetas de Emociones */}
          <View style={styles.emotionLabelsContainer}>
              {dailyEmotionData.map((item) => (
                  <View key={item.name} style={styles.emotionLabelItem}>
                      <Image source={item.icon} style={styles.emotionLabelIcon} />
                  </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: COLORS.boxesBG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  prompt: {
    fontSize: 16,
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
    backgroundColor: COLORS.boxesBG,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    height: 190,
    alignItems: 'center',
  },
  cardFullWidth: {
    backgroundColor: COLORS.boxesBG,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
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
    backgroundColor: COLORS.boxesBG,
    borderRadius: 30,
    justifyContent: 'center',
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
    backgroundColor: COLORS.boxesBG,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    height: 160,
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
    width: 2,
    height: '70%',
    backgroundColor: '#d0d0d0',
    borderRadius: 1,
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
  // --- ESTILOS PARA LA GRÁFICA DE EMOCIONES ---
  graphContainer: {
    height: 200, // Altura fija para la gráfica
    marginTop: 20,
    position: 'relative', // Necesario para posicionar las líneas de fondo
  },
  graphBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '8%', // Margen izquierdo para el eje Y
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
});

export default ProfileScreen;
