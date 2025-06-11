import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      // If registration is successful and token is returned
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        Alert.alert('Registration Successful', 'Welcome to the app!');
        navigation.navigate('Home'); // Redirect to Home screen
      } else {
        // If registration failed but verification is required
        if (response.data.message && response.data.message.toLowerCase().includes('verification')) {
          Alert.alert('Registration Successful', 'Please verify your email to continue.');
          navigation.navigate('VerificationScreen', { email }); // Pass email to verification screen
        } else {
          Alert.alert('Registration Failed', response.data.message || 'Please try again.');
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred during registration.';
      // If error message indicates verification required
      if (message.toLowerCase().includes('verification')) {
        Alert.alert('Registration Successful', 'Please verify your email to continue.');
        navigation.navigate('VerificationScreen', { email });
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={handleRegister} color="#6A5ACD" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#EDE7F6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4B0082',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
});

export default RegisterScreen;
