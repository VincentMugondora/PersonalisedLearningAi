import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const VerificationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>Please check your email for the verification link.</Text>
      <Button title="Resend Email" onPress={() => {}} color="#6A5ACD" />
      <Button title="Continue" onPress={() => navigation.navigate('ProfileSetup')} color="#6A5ACD" />
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
    marginBottom: 20,
    color: '#4B0082',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#6A5ACD',
  },
});

export default VerificationScreen;