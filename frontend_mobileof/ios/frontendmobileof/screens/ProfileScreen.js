import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const COLORS = {
  background: '#0a0a0a',
  secondary: '#d400ff',
  white: '#ffffff',
  boxesBG: '#1f1f2e',
  text: '#eaeaea',
  primary: '#4e4e4e',
};

const ProfileScreen = ({ handleCameraAccess }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Top: User Info Full Width */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.username}>Nombre de Usuario</Text>
        <Text style={styles.prompt}>"Mensaje personalizado para la IA"</Text>
      </View>

      {/* Second Row: Calendar + Daily Emotion */}
      <View style={styles.rowContainer}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tracking Record</Text>
          <View style={styles.daysRow}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <View key={index} style={styles.dayCircle}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Emoción de hoy</Text>
          <Text style={styles.emotionPlaceholder}>😊 Feliz</Text>
        </View>
      </View>

      {/* Third Row: Camera Button */}
      <View style={styles.explanationContainer}>
        <Text style={styles.explanationText}>
          Presiona el botón para que el espejo inteligente capture tu expresión actual y analice tus emociones.
        </Text>
        <TouchableOpacity style={styles.circleButton} onPress={handleCameraAccess}>
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Fourth Row: Psychological Tip */}
      <View style={styles.cardFullWidth}>
        <Text style={styles.sectionTitle}>Consejo Psicológico</Text>
        <Text style={styles.tipText}>
          Tómate un momento para respirar profundamente y enfocarte en lo que puedes controlar.
        </Text>
      </View>

      {/* Fifth Row: Weekly Emotion Tracking */}
      <View style={styles.cardFullWidth}>
        <Text style={styles.sectionTitle}>Seguimiento Semanal</Text>
        <Text style={styles.placeholderText}>[Aquí se mostrarán tus emociones de la semana]</Text>
      </View>

      {/* Final Row: Emotion Chart */}
      <View style={styles.cardFullWidth}>
        <Text style={styles.sectionTitle}>Gráfica de Emociones</Text>
        <Text style={styles.placeholderText}>[Gráfica próximamente]</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  userInfoContainer: {
    backgroundColor: COLORS.boxesBG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
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
  },
  cardFullWidth: {
    backgroundColor: COLORS.boxesBG,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emotionPlaceholder: {
    fontSize: 28,
    textAlign: 'center',
    color: COLORS.white,
  },
  explanationContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.boxesBG,
    borderRadius: 30,
    padding: 20,
  },
  explanationText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  circleButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
    borderColor: '#aaa',
    borderWidth: 3,
  },
  cameraIcon: {
    fontSize: 30,
    color: COLORS.white,
  },
  tipText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
  },
  placeholderText: {
    color: COLORS.text,
    fontStyle: 'italic',
    fontSize: 14,
  },
});

export default ProfileScreen;
