import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const videoRef = useRef(null);
  const navigation = useNavigation();

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      navigation.replace('Login'); // o 'Home', según tu flujo
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../assets/videos/splashanimation.mp4')}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width,
    height,
    position: 'absolute',
  },
});

export default SplashScreen;
