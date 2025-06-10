import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen!</Text>
      <Text style={styles.subtitle}>Explore personalized content!</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  subtitle: {
    fontSize: 18,
    color: '#6A5ACD',
  },
});

export default HomeScreen;