import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';

const SplashScreen = ({ navigation }) => {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(50);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('Home'); // Navigate to Home after splash
    }, 2000); // Adjust duration as needed

    return () => clearTimeout(timer);
  }, [navigation, opacity, translateY]);

  return (
    <View style={styles.container}>
      <Animated.View style={{
        opacity,
        transform: [{ translateY }]
      }}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Personalized Learning</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50', // Change this to your preferred color
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SplashScreen;