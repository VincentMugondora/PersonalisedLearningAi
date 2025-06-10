import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';

const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.jpg')} style={styles.image} />
      <Text style={styles.title}>Welcome to Our App!</Text>
      <Text style={styles.subtitle}>We help you learn and grow with personalized content.</Text>
      <Button title="Get Started" onPress={() => navigation.navigate('UserType')} color="#6A5ACD" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EDE7F6',
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4B0082',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
    color: '#6A5ACD',
  },
});

export default OnboardingScreen;